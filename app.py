from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import tempfile
import logging
from trash_scanner import classify_trash
import datetime
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS to allow requests from your frontend application
# Allow all origins in development, but restrict in production
CORS(app, resources={r"/*": {"origins": ["http://localhost:8080", 
                                         "https://localhost:8080", 
                                         "http://localhost:5173", 
                                         "https://localhost:5173", 
                                         "https://2025-hack-knight.vercel.app", 
                                         "https://*.vercel.app"], 
                            "methods": ["GET", "POST", "OPTIONS"], 
                            "allow_headers": "*"}})

# Configure logging
logging.basicConfig(level=logging.INFO if os.environ.get('PRODUCTION') else logging.DEBUG)
logger = logging.getLogger(__name__)

# In-memory storage for scan history (in a production app, this would be a database)
scan_history = []

# Simple cache for recycling information to avoid repeated API calls
recycling_info_cache = {}

# API info route
@app.route('/', methods=['GET'])
def api_info():
    return jsonify({
        'status': 'ok',
        'message': 'Trash Scanner API is running',
        'endpoints': [
            '/api/test - Test endpoint',
            '/api/classify-trash - Classify trash image',
            '/api/history - Get scan history',
            '/api/local-recycling-info - Get local recycling information'
        ],
        'version': '1.0.0'
    })

@app.route('/api/classify-trash', methods=['POST'])
def classify_trash_endpoint():
    try:
        logger.debug("Received request to /api/classify-trash")
        
        # Get the image data from the request
        data = request.json
        if not data or 'image' not in data:
            logger.error("No image data provided in request")
            return jsonify({
                'error': 'No image data provided',
                'category': 'unknown',
                'confidence': 0,
                'details': 'No image was provided for classification.',
                'tips': ['Please upload an image to classify'],
                'buds_reward': 0
            }), 400
        
        # Extract the base64 image data (remove the data:image/jpeg;base64, prefix if present)
        image_data = data['image']
        logger.debug(f"Received image data of length: {len(image_data)}")
        
        # Check if the image data is too small (likely a poor quality image)
        if len(image_data) < 1000:
            logger.warning("Image data is too small, likely a poor quality image")
            return jsonify({
                'error': 'Poor quality image',
                'category': 'unknown',
                'confidence': 0,
                'details': 'The image quality is too low for accurate classification.',
                'tips': ['Try uploading a clearer image with better lighting', 'Make sure the item is clearly visible in the frame'],
                'buds_reward': 0
            }), 200
        
        # Handle the data URI format (e.g., data:image/jpeg;base64,...)
        if ',' in image_data:
            logger.debug("Image data contains data URI prefix, removing it")
            image_data = image_data.split(',', 1)[1]
        
        try:
            # Decode the base64 data
            logger.debug("Decoding base64 image data")
            decoded_image = base64.b64decode(image_data)
            logger.debug(f"Decoded image size: {len(decoded_image)} bytes")
            
            # Check if the decoded image is too small
            if len(decoded_image) < 1000:
                logger.warning("Decoded image is too small, likely a poor quality image")
                return jsonify({
                    'error': 'Poor quality image',
                    'category': 'unknown',
                    'confidence': 0,
                    'details': 'The image quality is too low for accurate classification.',
                    'tips': ['Try uploading a clearer image with better lighting', 'Make sure the item is clearly visible in the frame'],
                    'buds_reward': 0
                }), 200
            
            # Create a temporary file to save the image
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_file.write(decoded_image)
                temp_file_path = temp_file.name
                logger.debug(f"Saved image to temporary file: {temp_file_path}")
            
            # Use the classify_trash function from trash_scanner.py
            logger.debug("Calling classify_trash function")
            classification_result = classify_trash(temp_file_path)
            logger.debug(f"Classification result: {classification_result}")
            
            # Add to scan history if a user_id is provided
            user_id = data.get('user_id')
            if user_id:
                # Create a thumbnail from the image (first 100 chars of base64 data)
                thumbnail = image_data[:100] if len(image_data) > 100 else image_data
                
                # Create history item
                history_item = {
                    'user_id': user_id,
                    'timestamp': datetime.datetime.now().isoformat(),
                    'category': classification_result.get('category'),
                    'confidence': classification_result.get('confidence'),
                    'details': classification_result.get('details'),
                    'tips': classification_result.get('tips'),
                    'buds_reward': classification_result.get('buds_reward'),
                    'image_thumbnail': thumbnail
                }
                
                # Add to history
                scan_history.append(history_item)
                
                # Limit the history size
                if len(scan_history) > 1000:
                    scan_history.pop(0)
            
            # Return the classification result directly
            return jsonify(classification_result), 200
                
        except Exception as e:
            logger.exception(f"Error processing image: {str(e)}")
            return jsonify({
                'error': f"Error processing image: {str(e)}",
                'category': 'unknown',
                'confidence': 0,
                'details': 'An error occurred while processing the image.',
                'tips': ['Try a different image', 'Make sure the image format is supported (JPEG, PNG)'],
                'buds_reward': 0
            }), 500
        finally:
            # Clean up the temporary file
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                logger.debug(f"Deleted temporary file: {temp_file_path}")
    
    except Exception as e:
        logger.exception(f"Unexpected error: {str(e)}")
        return jsonify({
            'error': str(e),
            'category': 'unknown',
            'confidence': 0,
            'details': 'An unexpected error occurred.',
            'tips': ['Please try again later'],
            'buds_reward': 0
        }), 500

# Add a simple test endpoint
@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({'status': 'ok', 'message': 'Flask server is running'}), 200

@app.route('/api/history', methods=['GET'])
def get_scan_history():
    """
    Get the scan history.
    
    Query parameters:
    - limit: Maximum number of items to return (default: 10)
    - user_id: Filter by user ID (optional)
    
    Returns:
        JSON array of scan history items
    """
    try:
        # Get query parameters
        limit = request.args.get('limit', default=10, type=int)
        user_id = request.args.get('user_id', default=None, type=str)
        
        # Filter by user_id if provided
        filtered_history = scan_history
        if user_id:
            filtered_history = [item for item in scan_history if item.get('user_id') == user_id]
        
        # Return the most recent items first, limited by the limit parameter
        return jsonify(filtered_history[-limit:]), 200
    
    except Exception as e:
        logger.exception(f"Error retrieving scan history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['POST'])
def add_to_scan_history():
    """
    Add an item to the scan history.
    
    Request body:
    - user_id: User ID (optional)
    - category: Category of the item
    - confidence: Confidence level
    - details: Details about the item
    - tips: Tips for disposal
    - buds_reward: Buds reward earned
    - image_thumbnail: Base64 encoded thumbnail of the image (optional)
    
    Returns:
        JSON object with success message
    """
    try:
        # Get the data from the request
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Create a new history item
        history_item = {
            'timestamp': datetime.datetime.now().isoformat(),
            'user_id': data.get('user_id'),
            'category': data.get('category'),
            'confidence': data.get('confidence'),
            'details': data.get('details'),
            'tips': data.get('tips'),
            'buds_reward': data.get('buds_reward'),
            'image_thumbnail': data.get('image_thumbnail')
        }
        
        # Add to the history
        scan_history.append(history_item)
        
        # Limit the history size to prevent memory issues
        if len(scan_history) > 1000:
            scan_history.pop(0)
        
        return jsonify({'success': True, 'message': 'Added to scan history'}), 200
    
    except Exception as e:
        logger.exception(f"Error adding to scan history: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/local-recycling-info', methods=['GET'])
def get_local_recycling_info():
    """
    Get local recycling information based on location.
    
    Query parameters:
    - location: City or zip code
    - category: Waste category (recycle, compost, landfill)
    
    Returns:
        JSON object with local recycling information
    """
    try:
        # Get query parameters
        location = request.args.get('location', default=None, type=str)
        category = request.args.get('category', default=None, type=str)
        
        if not location:
            return jsonify({'error': 'Location parameter is required'}), 400
        
        # Normalize category
        if category:
            category = category.lower()
        
        # Check cache first
        cache_key = f"{location}_{category}"
        if cache_key in recycling_info_cache:
            return jsonify(recycling_info_cache[cache_key]), 200
        
        # Use Gemini API to get local recycling information
        api_key = os.getenv("VITE_GEMINI_API_KEY")
        
        # Prepare the prompt based on the category
        if category == 'recycle':
            prompt = f"Provide specific recycling guidelines for {location}. Include what can and cannot be recycled, where to recycle, and any special programs. Format as JSON with fields: guidelines (array), locations (array), special_programs (array), and website (string)."
        elif category == 'compost':
            prompt = f"Provide specific composting guidelines for {location}. Include what can and cannot be composted, where to compost, and any municipal programs. Format as JSON with fields: guidelines (array), locations (array), special_programs (array), and website (string)."
        elif category == 'landfill':
            prompt = f"Provide specific landfill and waste disposal guidelines for {location}. Include what must go to landfill, hazardous waste disposal, and any waste reduction programs. Format as JSON with fields: guidelines (array), locations (array), special_programs (array), and website (string)."
        else:
            prompt = f"Provide general waste management guidelines for {location}. Include recycling, composting, and landfill information. Format as JSON with fields: recycling (object), composting (object), landfill (object), each containing guidelines (array), locations (array), and website (string)."
        
        # Make the API call
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": api_key
        }
        data = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topK": 32,
                "topP": 0.95,
                "maxOutputTokens": 800
            }
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=15)
        
        # Process the response
        if response.status_code == 200:
            response_json = response.json()
            if "candidates" in response_json and len(response_json["candidates"]) > 0:
                text = response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                
                # Try to parse the JSON response
                try:
                    # Find JSON content in the response
                    import re
                    json_match = re.search(r'\{.*\}', text, re.DOTALL)
                    if json_match:
                        json_text = json_match.group(0)
                        result = json.loads(json_text)
                        
                        # Add to cache
                        recycling_info_cache[cache_key] = result
                        
                        # Limit cache size
                        if len(recycling_info_cache) > 100:
                            # Remove oldest entry
                            oldest_key = next(iter(recycling_info_cache))
                            recycling_info_cache.pop(oldest_key)
                        
                        return jsonify(result), 200
                except Exception as e:
                    logger.exception(f"Error parsing recycling info JSON: {str(e)}")
        
        # Fallback response if API call fails
        fallback_response = {
            "guidelines": [
                "Check your local municipality website for specific guidelines",
                "Contact your waste management provider for detailed information",
                "Search for recycling centers in your area"
            ],
            "locations": [
                "Local municipal waste management facilities",
                "Community recycling centers",
                "Retail take-back programs (for electronics, batteries, etc.)"
            ],
            "special_programs": [
                "Hazardous waste collection events",
                "E-waste recycling programs",
                "Composting initiatives"
            ],
            "website": "https://www.epa.gov/recycle"
        }
        
        # Add to cache
        recycling_info_cache[cache_key] = fallback_response
        
        return jsonify(fallback_response), 200
    
    except Exception as e:
        logger.exception(f"Error retrieving local recycling information: {str(e)}")
        return jsonify({'error': str(e)}), 500

# For Vercel serverless deployment
app.debug = False

# Only use this for local development
if __name__ == '__main__':
    # Use the PORT environment variable provided by the hosting platform
    port = int(os.environ.get('PORT', 5003))
    # In production, we should not run in debug mode and should bind to 0.0.0.0
    debug_mode = not os.environ.get('PRODUCTION', False)
    app.run(host='0.0.0.0', port=port, debug=debug_mode) 