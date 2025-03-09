# AI Trash Scanner Implementation

This document explains how to set up and run the AI Trash Scanner feature that uses Google's Gemini API to classify images of waste items.

## Project Structure

- `trash_scanner.py`: Python script that uses the Gemini API to classify images
- `app.py`: Flask server that provides an API endpoint for the frontend
- `src/api/trashScanner.ts`: Frontend API service to communicate with the Flask server
- `src/pages/TrashScanner.tsx`: React component for the trash scanner UI

## Setup Instructions

### 1. Set up the Python environment

```bash
# Create and activate a virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install the required dependencies
pip install -r requirements.txt
```

### 2. Configure the Gemini API key

Make sure your `.env` file contains the Gemini API key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Flask server

```bash
python app.py
```

This will start the Flask server on http://localhost:5000.

### 4. Start the frontend development server

```bash
npm run dev
```

This will start the frontend development server, typically on http://localhost:5173.

## How It Works

1. The user uploads an image through the frontend interface
2. The image is sent as a base64-encoded string to the Flask backend
3. The Flask backend saves the image to a temporary file
4. The `trash_scanner.py` script uses the Gemini API to classify the image
5. The classification result is returned to the frontend
6. The frontend displays the result to the user

## Troubleshooting

- If you encounter CORS issues, make sure the Flask server is running and properly configured with CORS support
- Check the browser console and Flask server logs for error messages
- Verify that your Gemini API key is valid and has the necessary permissions

## Production Deployment

For production deployment, consider the following:

1. Use a production-ready WSGI server like Gunicorn instead of Flask's development server
2. Set up proper error handling and logging
3. Implement rate limiting to prevent API abuse
4. Use environment variables for configuration
5. Consider containerizing the application with Docker 