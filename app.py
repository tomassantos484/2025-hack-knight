from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import tempfile
import logging
from trash_scanner import classify_trash

app = Flask(__name__)
# Configure CORS to allow requests from your frontend application
CORS(app, resources={r"/*": {"origins": ["http://localhost:8080", "https://localhost:8080"], 
                            "methods": ["GET", "POST", "OPTIONS"], 
                            "allow_headers": "*"}})

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# API info route
@app.route('/', methods=['GET'])
def api_info():
    return jsonify({
        'status': 'ok',
        'message': 'Trash Scanner API is running',
        'endpoints': [
            {'path': '/', 'method': 'GET', 'description': 'This help message'},
            {'path': '/api/test', 'method': 'GET', 'description': 'Test endpoint'},
            {'path': '/api/classify-trash', 'method': 'POST', 'description': 'Classify trash images'}
        ]
    })

@app.route('/api/classify-trash', methods=['POST'])
def classify_trash_endpoint():
    try:
        logger.debug("Received request to /api/classify-trash")
        
        # Get the image data from the request
        data = request.json
        if not data or 'image' not in data:
            logger.error("No image data provided in request")
            return jsonify({'error': 'No image data provided'}), 400
        
        # Extract the base64 image data (remove the data:image/jpeg;base64, prefix if present)
        image_data = data['image']
        logger.debug(f"Received image data of length: {len(image_data)}")
        
        # Handle the data URI format (e.g., data:image/jpeg;base64,...)
        if ',' in image_data:
            logger.debug("Image data contains data URI prefix, removing it")
            image_data = image_data.split(',', 1)[1]
        
        try:
            # Decode the base64 data
            logger.debug("Decoding base64 image data")
            decoded_image = base64.b64decode(image_data)
            logger.debug(f"Decoded image size: {len(decoded_image)} bytes")
            
            # Create a temporary file to save the image
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_file.write(decoded_image)
                temp_file_path = temp_file.name
                logger.debug(f"Saved image to temporary file: {temp_file_path}")
            
            # Use the classify_trash function from trash_scanner.py
            logger.debug("Calling classify_trash function")
            classification = classify_trash(temp_file_path)
            logger.debug(f"Classification result: {classification}")
            
            # Prepare response based on classification
            category = classification.lower()
            logger.debug(f"Normalized category: {category}")
            
            # Define response data based on category
            response_data = {
                'recycle': {
                    'category': 'recycle',
                    'confidence': 89,
                    'details': 'This appears to be a recyclable item.',
                    'tips': [
                        'Rinse before recycling',
                        'Remove any non-recyclable caps or lids',
                        'Check local guidelines as recycling rules vary by location'
                    ]
                },
                'compost': {
                    'category': 'compost',
                    'confidence': 93,
                    'details': 'This appears to be food waste that can be composted.',
                    'tips': [
                        'Add to your home compost bin or municipal compost collection',
                        'Mix with dry materials like leaves or paper',
                        'Avoid composting meat or dairy products in home systems'
                    ]
                },
                'landfill': {
                    'category': 'landfill',
                    'confidence': 81,
                    'details': 'This item appears to be non-recyclable mixed materials.',
                    'tips': [
                        'Consider alternatives with less packaging next time',
                        'Check if the manufacturer has a take-back program',
                        'Search for TerraCycle programs that might accept this waste'
                    ]
                }
            }
            
            # Return the appropriate response based on classification
            if category in response_data:
                logger.debug(f"Returning data for category: {category}")
                return jsonify(response_data[category]), 200
            else:
                logger.debug(f"Category {category} not found in response_data, returning unknown")
                return jsonify({
                    'category': 'unknown',
                    'confidence': 50,
                    'details': 'Unable to classify this item with confidence.',
                    'tips': ['Consider consulting your local waste management guidelines']
                }), 200
                
        except Exception as e:
            logger.exception(f"Error processing image: {str(e)}")
            return jsonify({'error': f"Error processing image: {str(e)}"}), 500
        finally:
            # Clean up the temporary file
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                logger.debug(f"Deleted temporary file: {temp_file_path}")
    
    except Exception as e:
        logger.exception(f"Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add a simple test endpoint
@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({'status': 'ok', 'message': 'Flask server is running'}), 200

if __name__ == '__main__':
    # Use port 5002 for the API server
    app.run(debug=True, port=5002) 