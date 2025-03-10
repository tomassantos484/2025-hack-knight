from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
import base64
import json
from datetime import datetime
import logging
import socket

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/test', methods=['GET', 'OPTIONS'])
def test_api():
    """Test endpoint to verify API is working"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        return handle_preflight()
    
    logger.info(f"Test API called from: {request.remote_addr}")
    return jsonify({
        'status': 'ok',
        'message': 'API is working',
        'timestamp': datetime.now().isoformat()
    })

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
    response.headers.add('Access-Control-Allow-Origin', '*')
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
    print(f"https://ecovision-backend.up.railway.app")
    
    # Print relevant environment variables
    print("\nEnvironment Variables:")
    for key, value in os.environ.items():
        if "URL" in key or "HOST" in key or "RAILWAY" in key or "DOMAIN" in key:
            print(f"{key}: {value}")
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=False) 