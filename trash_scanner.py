import os
import base64
import google.generativeai as genai
from dotenv import load_dotenv
import sys
import time
import requests
import json

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API with the key from .env
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Flag to use mock response or direct API call
USE_MOCK_RESPONSE = False  # Set to True to use mock responses instead of API

def encode_image(image_path):
    """
    Encode an image file to base64 string.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        str: Base64 encoded string of the image
    """
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def classify_trash_direct_api(image_path):
    """
    Classify trash using direct API call to Gemini.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        str: Classification result
    """
    try:
        # Encode the image
        encoded_image = encode_image(image_path)
        
        # API endpoint for Gemini
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        
        # Prepare headers
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": api_key
        }
        
        # Prepare request body
        data = {
            "contents": [
                {
                    "parts": [
                        {"text": "Classify the trash in this image into exactly one of these categories: 'Recycle', 'Compost', or 'Landfill'. Respond with only the category name."},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": encoded_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topK": 32,
                "topP": 0.95,
                "maxOutputTokens": 100
            }
        }
        
        # Make the API call with a timeout
        response = requests.post(url, headers=headers, json=data, timeout=15)
        
        # Check if the request was successful
        if response.status_code == 200:
            response_json = response.json()
            if "candidates" in response_json and len(response_json["candidates"]) > 0:
                text = response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                return text
        
        # If we get here, something went wrong with the API response
        print(f"API Error: Status code {response.status_code}")
        print(f"Response: {response.text}")
        return "Unknown"
        
    except Exception as e:
        print(f"Error during classification: {str(e)}")
        return "Unknown"

def classify_trash_mock(image_path):
    """
    Mock classification based on filename.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        str: Mock classification result
    """
    print("Using mock response (for testing)")
    time.sleep(1)  # Simulate a short delay
    
    # Simple logic to determine mock response based on filename
    if "bottle" in image_path.lower():
        return "Recycle"
    elif "food" in image_path.lower() or "apple" in image_path.lower():
        return "Compost"
    else:
        return "Landfill"

def classify_trash(image_path):
    """
    Classify trash in an image as 'Recycle', 'Compost', or 'Landfill'.
    
    Args:
        image_path (str): Path to the image file containing trash
        
    Returns:
        str: Classification result ('Recycle', 'Compost', or 'Landfill'), or 'Unknown' if an error occurs
    """
    if USE_MOCK_RESPONSE:
        return classify_trash_mock(image_path)
    else:
        return classify_trash_direct_api(image_path)

if __name__ == "__main__":
    # Check if image path is provided as command line argument
    if len(sys.argv) < 2:
        print("Usage: python trash_scanner.py <image_path>")
        print("Example: python trash_scanner.py trash_image.jpg")
        sys.exit(1)
    
    # Get the image path from command line arguments
    image_file_path = sys.argv[1]
    
    # Check if the file exists
    if os.path.exists(image_file_path):
        print(f"Analyzing image: {image_file_path}")
        
        # Call the classify_trash function
        classification = classify_trash(image_file_path)
        
        # Print the result in a user-friendly format
        print(f"\nClassification Result: This item should go in the {classification} bin.")
    else:
        # Print an error message if the file does not exist
        print(f"Error: The image file '{image_file_path}' does not exist. Please check the file path.") 
