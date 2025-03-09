import os
import base64
import google.generativeai as genai
from dotenv import load_dotenv
import sys
import time
import requests
import json
import io
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
import random

# Load environment variables from .env file
load_dotenv()

# Configure the Gemini API with the key from .env
api_key = os.getenv("VITE_GEMINI_API_KEY")

# Print a masked version of the API key for debugging
if api_key:
    masked_key = api_key[:4] + "*" * (len(api_key) - 8) + api_key[-4:]
    print(f"Loaded Gemini API key: {masked_key}")
else:
    print("WARNING: No Gemini API key found in environment variables!")

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

def preprocess_image(image_path):
    """
    Preprocess an image to improve classification accuracy.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        str: Path to the preprocessed image file
    """
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize if the image is too large
        max_size = 1024
        if max(img.size) > max_size:
            # Calculate the new size while maintaining aspect ratio
            if img.width > img.height:
                new_width = max_size
                new_height = int(img.height * (max_size / img.width))
            else:
                new_height = max_size
                new_width = int(img.width * (max_size / img.height))
            
            # Resize the image
            img = img.resize((new_width, new_height), Image.LANCZOS)
        
        # Enhance the image
        # Increase contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)
        
        # Increase sharpness
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.5)
        
        # Apply a slight blur to reduce noise
        img = img.filter(ImageFilter.GaussianBlur(0.5))
        
        # Save the preprocessed image
        preprocessed_path = f"{image_path}_preprocessed.jpg"
        img.save(preprocessed_path, 'JPEG', quality=95)
        
        return preprocessed_path
    
    except Exception as e:
        print(f"Error preprocessing image: {str(e)}")
        # Return the original image path if preprocessing fails
        return image_path

def classify_trash_direct_api(image_path):
    """
    Classify trash using direct API call to Gemini.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: Classification result with category, confidence, details, tips, and buds reward
    """
    try:
        # Preprocess the image
        preprocessed_image_path = preprocess_image(image_path)
        
        # Encode the preprocessed image
        encoded_image = encode_image(preprocessed_image_path)
        
        # API endpoint for Gemini
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        
        # Prepare headers
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": api_key
        }
        
        # Prepare request body with a more detailed prompt
        data = {
            "contents": [
                {
                    "parts": [
                        {"text": """Analyze this image of trash and classify it into one of these categories: 'recycle', 'compost', or 'landfill'.
                        
                        Provide your response in JSON format with the following fields:
                        - category: The category (recycle, compost, or landfill)
                        - confidence: A number between 1-100 representing your confidence level
                        - details: A detailed explanation of why this item belongs in this category, including material composition and environmental impact
                        - environmental_impact: A brief explanation of the environmental impact of this type of waste
                        - tips: An array of 2-3 specific tips for properly disposing of this item
                        - buds_reward: A number between 5-20 representing eco-points (buds) earned for proper disposal
                          (recycle: 10-15 buds, compost: 15-20 buds, landfill: 5-10 buds)
                        
                        Example response format:
                        {
                            "category": "recycle",
                            "confidence": 85,
                            "details": "This plastic bottle is made of PET (polyethylene terephthalate), which is highly recyclable in most municipal recycling programs.",
                            "environmental_impact": "Recycling plastic bottles reduces landfill waste and saves energy compared to producing new plastic from raw materials.",
                            "tips": ["Rinse before recycling", "Remove the cap and recycle separately", "Check local guidelines as recycling rules vary by location"],
                            "buds_reward": 12
                        }
                        """},
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
                "maxOutputTokens": 800
            }
        }
        
        # Make the API call with a timeout
        response = requests.post(url, headers=headers, json=data, timeout=15)
        
        # Check if the request was successful
        if response.status_code == 200:
            response_json = response.json()
            if "candidates" in response_json and len(response_json["candidates"]) > 0:
                text = response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                
                # Try to parse the JSON response
                try:
                    # Find JSON content in the response (in case there's extra text)
                    import re
                    json_match = re.search(r'\{.*\}', text, re.DOTALL)
                    if json_match:
                        json_text = json_match.group(0)
                        result = json.loads(json_text)
                        
                        # Ensure all required fields are present
                        required_fields = ['category', 'confidence', 'details', 'tips', 'buds_reward']
                        if all(key in result for key in required_fields):
                            # Normalize the category to lowercase
                            result['category'] = result['category'].lower()
                            return result
                except Exception as e:
                    print(f"Error parsing JSON response: {str(e)}")
                    print(f"Raw response: {text}")
        
        # If we get here, something went wrong with the API response
        print(f"API Error: Status code {response.status_code}")
        print(f"Response: {response.text}")
        return {
            "category": "unknown",
            "confidence": 0,
            "details": "Unable to classify this item.",
            "environmental_impact": "Improper waste disposal can harm the environment. When in doubt, consult local waste management guidelines.",
            "tips": ["Consider consulting your local waste management guidelines"],
            "buds_reward": 0
        }
        
    except Exception as e:
        print(f"Error during classification: {str(e)}")
        return {
            "category": "unknown",
            "confidence": 0,
            "details": "An error occurred during classification.",
            "environmental_impact": "Improper waste disposal can harm the environment. When in doubt, consult local waste management guidelines.",
            "tips": ["Consider consulting your local waste management guidelines"],
            "buds_reward": 0
        }
    finally:
        # Clean up the preprocessed image if it was created
        if 'preprocessed_image_path' in locals() and preprocessed_image_path != image_path:
            try:
                os.remove(preprocessed_image_path)
            except:
                pass

def classify_trash_mock(image_path):
    """
    Mock classification based on filename.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: Mock classification result with category, confidence, details, environmental impact, tips, and buds reward
    """
    print("Using mock response (for testing)")
    time.sleep(1)  # Simulate a short delay
    
    # Simple logic to determine mock response based on filename
    if "bottle" in image_path.lower():
        return {
            "category": "recycle",
            "confidence": 92,
            "details": "This plastic bottle is made of PET (polyethylene terephthalate), which is highly recyclable in most municipal recycling programs.",
            "environmental_impact": "Recycling plastic bottles reduces landfill waste and saves energy compared to producing new plastic from raw materials.",
            "tips": ["Rinse before recycling", "Remove the cap and recycle separately", "Check local guidelines"],
            "buds_reward": 12
        }
    elif "food" in image_path.lower() or "apple" in image_path.lower():
        return {
            "category": "compost",
            "confidence": 95,
            "details": "This food waste is organic material that can break down naturally in a composting environment.",
            "environmental_impact": "Composting food waste reduces methane emissions from landfills and creates nutrient-rich soil for gardening.",
            "tips": ["Add to your compost bin", "Mix with dry materials", "Avoid meat or dairy in home compost"],
            "buds_reward": 18
        }
    else:
        return {
            "category": "landfill",
            "confidence": 85,
            "details": "This item appears to be made of mixed materials that cannot be easily separated for recycling.",
            "environmental_impact": "Items sent to landfill contribute to methane emissions and take up valuable space. Consider alternatives when possible.",
            "tips": ["Consider alternatives with less packaging", "Check for manufacturer take-back programs", "Look for TerraCycle programs"],
            "buds_reward": 7
        }

def classify_trash_offline(image_path):
    """
    Classify trash using a simple offline approach when the API is unavailable.
    This is a fallback method that uses basic image analysis.
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: Classification result with category, confidence, details, and tips
    """
    try:
        print("Using offline classification mode")
        
        # Open and preprocess the image
        img = Image.open(image_path)
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize for faster processing
        img = img.resize((100, 100), Image.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Extract color features
        avg_color = np.mean(img_array, axis=(0, 1))
        
        # Simple color-based classification
        # Green tones might indicate organic/compostable materials
        # Blue/clear tones might indicate recyclables
        # Dark or mixed colors might indicate landfill
        
        r, g, b = avg_color
        
        # Calculate color ratios
        total = r + g + b
        if total == 0:
            total = 1  # Avoid division by zero
        
        r_ratio = r / total
        g_ratio = g / total
        b_ratio = b / total
        
        # Simple classification logic
        if g_ratio > 0.38:  # Higher green component
            category = "compost"
            confidence = int(min(g_ratio * 100 + 50, 80))
            details = "This item appears to have organic characteristics based on color analysis."
            environmental_impact = "Composting organic waste reduces methane emissions from landfills and creates nutrient-rich soil."
            tips = [
                "Add to your compost bin or municipal compost collection",
                "Mix with dry materials like leaves or paper",
                "Avoid composting meat or dairy products in home systems"
            ]
            buds_reward = random.randint(15, 18)
        elif b_ratio > 0.35 or (r_ratio < 0.3 and g_ratio < 0.3 and b_ratio < 0.3):  # Higher blue component or very dark/light
            category = "recycle"
            confidence = int(min(b_ratio * 100 + 40, 75))
            details = "This item appears to have characteristics of recyclable materials based on color analysis."
            environmental_impact = "Recycling reduces waste sent to landfills and conserves natural resources."
            tips = [
                "Rinse before recycling",
                "Check local guidelines as recycling rules vary by location",
                "Remove any non-recyclable components"
            ]
            buds_reward = random.randint(10, 15)
        else:  # Mixed or red dominant
            category = "landfill"
            confidence = int(min(r_ratio * 100 + 30, 70))
            details = "This item appears to be made of mixed or non-recyclable materials based on color analysis."
            environmental_impact = "Items sent to landfill contribute to methane emissions. Consider alternatives when possible."
            tips = [
                "Consider alternatives with less packaging next time",
                "Check if the manufacturer has a take-back program",
                "Search for TerraCycle programs that might accept this waste"
            ]
            buds_reward = random.randint(5, 10)
        
        # Add a disclaimer about offline mode
        details += " (Note: This classification was performed offline and may be less accurate than online analysis.)"
        
        return {
            "category": category,
            "confidence": confidence,
            "details": details,
            "environmental_impact": environmental_impact,
            "tips": tips,
            "buds_reward": buds_reward,
            "offline_mode": True
        }
    
    except Exception as e:
        print(f"Error in offline classification: {str(e)}")
        return {
            "category": "unknown",
            "confidence": 30,
            "details": "Unable to classify this item in offline mode.",
            "environmental_impact": "When in doubt, consult local waste management guidelines.",
            "tips": ["Consider consulting your local waste management guidelines"],
            "buds_reward": 5,
            "offline_mode": True
        }

def classify_trash(image_path):
    """
    Classify trash in an image as 'Recycle', 'Compost', or 'Landfill'.
    
    Args:
        image_path (str): Path to the image file containing trash
        
    Returns:
        dict: Classification result with category, confidence, details, tips, and buds reward
    """
    if USE_MOCK_RESPONSE:
        return classify_trash_mock(image_path)
    
    # Try the direct API first
    try:
        result = classify_trash_direct_api(image_path)
        # If we got a valid result, return it
        if result["category"] != "unknown":
            return result
    except Exception as e:
        print(f"API classification failed: {str(e)}")
    
    # If we get here, either the API failed or returned unknown
    # Fall back to offline classification
    return classify_trash_offline(image_path)

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
        print(f"\nClassification Result: This item should go in the {classification['category']} bin.")
    else:
        # Print an error message if the file does not exist
        print(f"Error: The image file '{image_file_path}' does not exist. Please check the file path.") 
