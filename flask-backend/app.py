from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
import base64
import json
from datetime import datetime
import logging
import socket
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Define allowed origins
ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:8081',
    'https://2025-hack-knight.vercel.app',
    'https://ecovision-backend-production.up.railway.app'
]

# Get allowed origins from environment variable if available
if os.environ.get('CORS_ALLOWED_ORIGINS'):
    try:
        env_origins = os.environ.get('CORS_ALLOWED_ORIGINS').split(',')
        ALLOWED_ORIGINS.extend([origin.strip() for origin in env_origins])
        logger.info(f"Added origins from environment: {env_origins}")
    except Exception as e:
        logger.error(f"Error parsing CORS_ALLOWED_ORIGINS: {e}")

# Enable CORS for specific origins
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}})

# Supabase configuration - server-side only
SUPABASE_URL = os.environ.get('SUPABASE_PROJECT_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_API_KEY')

# Gemini API configuration - server-side only
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

@app.route('/api/test', methods=['GET', 'OPTIONS'])
def test_api():
    """Test endpoint to verify API is working"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        return handle_preflight()
    
    # Get the request origin
    origin = request.headers.get('Origin')
    logger.info(f"Test API called from origin: {origin}")
    
    # Create the response
    response = jsonify({
        'status': 'ok',
        'message': 'API is working',
        'timestamp': datetime.now().isoformat(),
        'origin': origin
    })
    
    # Add CORS headers if origin is allowed
    if origin and origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    else:
        logger.warning(f"Request from unauthorized origin: {origin}")
    
    return response

@app.route('/api/process-receipt', methods=['POST', 'OPTIONS'])
def process_receipt():
    """Process receipt images using Gemini API"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        return handle_preflight()
    
    try:
        # Check if files were uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        logger.info(f"Processing receipt: {file.filename}")
        
        # Read the file data
        file_data = file.read()
        
        # Convert to base64 for Gemini API
        base64_image = base64.b64encode(file_data).decode('utf-8')
        
        # Prepare the request to Gemini API
        gemini_url = 'https://api.gemini.com/v1/receipt'
        
        # Create form data for the Gemini API
        form_data = {
            'image': base64_image,
            'format': 'json'
        }
        
        # Make the request to Gemini API with server-side API key
        headers = {
            'Authorization': f'Bearer {GEMINI_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        logger.info("Sending request to Gemini API")
        response = requests.post(gemini_url, json=form_data, headers=headers)
        
        # Check if the request was successful
        if response.status_code != 200:
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            
            # If Gemini API is unavailable, use a fallback method
            logger.info("Using fallback method for receipt processing")
            result = process_receipt_fallback(base64_image)
            return jsonify(result)
        
        # Process the Gemini API response
        gemini_data = response.json()
        
        # Extract and process the data
        extracted_text = gemini_data.get('text', '')
        
        # Process the receipt data (similar to the client-side logic)
        result = {
            'success': True,
            'extracted_text': extracted_text,
            'eco_score': calculate_eco_score(extracted_text),
            'carbon_footprint': calculate_carbon_footprint(extracted_text),
            'items': parse_receipt_items(extracted_text)
        }
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error processing receipt: {str(e)}")
        return jsonify({'error': 'Failed to process receipt', 'details': str(e)}), 500

def process_receipt_fallback(base64_image):
    """Fallback method for receipt processing when Gemini API is unavailable"""
    # This is a simplified version that would normally use OCR like Tesseract
    # For this example, we'll return mock data
    return {
        'success': True,
        'extracted_text': 'MOCK RECEIPT\nStore: Eco Grocery\nDate: 2023-05-15\nItems:\n1. Organic Apples $3.99\n2. Reusable Bags $1.50\n3. Local Produce $5.99\nTotal: $11.48',
        'eco_score': 85,
        'carbon_footprint': 0.8,
        'items': [
            {'name': 'Organic Apples', 'price': 3.99, 'isEcoFriendly': True},
            {'name': 'Reusable Bags', 'price': 1.50, 'isEcoFriendly': True},
            {'name': 'Local Produce', 'price': 5.99, 'isEcoFriendly': True}
        ]
    }

def calculate_eco_score(text):
    """Calculate eco score based on receipt text"""
    # This would normally analyze the items for eco-friendliness
    # For this example, we'll return a mock score
    return 75

def calculate_carbon_footprint(text):
    """Calculate carbon footprint based on receipt text"""
    # This would normally calculate based on items and quantities
    # For this example, we'll return a mock value
    return 1.2

def parse_receipt_items(text):
    """Parse receipt text into structured items"""
    # This would normally use NLP to extract items, prices, etc.
    # For this example, we'll return mock items
    return [
        {'name': 'Organic Vegetables', 'price': 4.99, 'isEcoFriendly': True},
        {'name': 'Recycled Paper Towels', 'price': 2.99, 'isEcoFriendly': True},
        {'name': 'Plastic Water Bottles', 'price': 3.99, 'isEcoFriendly': False}
    ]

@app.route('/api/supabase/data', methods=['POST', 'OPTIONS'])
def supabase_data():
    """Proxy for Supabase data operations"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        return handle_preflight()
    
    try:
        # Get the request data
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Required fields
        if 'table' not in data:
            return jsonify({'error': 'Table name is required'}), 400
        
        table = data['table']
        operation = data.get('operation', 'select')
        query_params = data.get('params', {})
        auth_token = request.headers.get('Authorization')
        
        logger.info(f"Supabase operation: {operation} on table: {table}")
        
        # Construct Supabase API URL
        url = f"{SUPABASE_URL}/rest/v1/{table}"
        
        # Set up headers
        headers = {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
        }
        
        # Add authorization if provided
        if auth_token:
            headers['Authorization'] = auth_token
        
        # Perform the operation
        if operation == 'select':
            # Handle select operation
            response = requests.get(url, headers=headers, params=query_params)
        elif operation == 'insert':
            # Handle insert operation
            response = requests.post(url, headers=headers, json=data.get('data', {}))
        elif operation == 'update':
            # Handle update operation
            response = requests.patch(url, headers=headers, json=data.get('data', {}), params=query_params)
        elif operation == 'delete':
            # Handle delete operation
            response = requests.delete(url, headers=headers, params=query_params)
        else:
            return jsonify({'error': 'Invalid operation'}), 400
        
        # Return the response from Supabase
        return jsonify(response.json() if response.text else {}), response.status_code
    except Exception as e:
        logger.error(f"Error in Supabase operation: {str(e)}")
        return jsonify({'error': 'Failed to perform Supabase operation'}), 500

@app.route('/api/classify-trash', methods=['POST', 'OPTIONS'])
def classify_trash():
    """Classify trash images"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        return handle_preflight()
    
    try:
        # Get the image data from the request
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        image_data = data['image']
        logger.info(f"Received image data of length: {len(image_data)}")
        
        # In a real implementation, you would process the image and classify it
        # For now, we'll return a mock result
        result = generate_mock_result()
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error classifying trash: {str(e)}")
        return jsonify({'error': 'Failed to classify trash'}), 500

def handle_preflight():
    """Handle preflight CORS requests"""
    response = jsonify({'status': 'ok'})
    
    # Get the request origin
    origin = request.headers.get('Origin')
    
    # Check if the origin is allowed
    if origin and origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
    else:
        # For development/testing, log the disallowed origin
        if origin:
            logger.warning(f"Preflight request from disallowed origin: {origin}")
        else:
            logger.warning("Preflight request without origin header")
    
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

def generate_mock_result():
    """Generate a mock classification result"""
    categories = ['recycle', 'compost', 'landfill']
    random_category = random.choice(categories)
    
    details = f"This item appears to be "
    if random_category == 'recycle':
        details += "recyclable. It should be placed in your recycling bin."
    elif random_category == 'compost':
        details += "compostable. It can be added to your compost pile or green bin."
    else:
        details += "non-recyclable trash. It should go in your regular waste bin."
    
    return {
        'category': random_category,
        'confidence': random.randint(70, 99),
        'details': details,
        'tips': [
            "When in doubt, check your local recycling guidelines.",
            "Clean items before recycling to avoid contamination.",
            "Consider reducing waste by using reusable alternatives."
        ],
        'environmental_impact': "By properly disposing of this item, you're helping reduce landfill waste.",
        'buds_reward': 5
    }

if __name__ == '__main__':
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get('PORT', 5000))
    
    # Print startup message
    print(f"Starting Flask application on port {port}")
    
    # Print URL information
    hostname = socket.gethostname()
    print(f"Hostname: {hostname}")
    print(f"Possible URLs:")
    print(f"http://{hostname}:{port}")
    print(f"https://{hostname}")
    print(f"https://{hostname}.up.railway.app")
    print(f"https://ecovision-backend-production.up.railway.app")
    
    # Print relevant environment variables
    print("\nEnvironment Variables:")
    for key, value in os.environ.items():
        if "URL" in key or "HOST" in key or "RAILWAY" in key or "DOMAIN" in key:
            print(f"{key}: {value}")
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=False) 