# Trash Scanner Integration Guide

This guide explains how to integrate the Trash Scanner functionality into your existing application running at `http://localhost:8080/trash-scanner`.

## Overview

The Trash Scanner consists of two main parts:
1. A Flask API backend that handles image classification using the Gemini AI model
2. Frontend components (HTML, CSS, JavaScript) that can be integrated into your existing application

## Step 1: Set Up the API Backend

1. Make sure you have the required Python dependencies installed:
   ```
   pip install flask flask-cors python-dotenv google-generativeai requests
   ```

2. Ensure you have a valid Gemini API key in your `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the Flask API server:
   ```
   python app.py
   ```

   This will start the API server on port 5002.

## Step 2: Integrate Frontend Components

### Option 1: Direct HTML Inclusion

If your application allows direct HTML inclusion, you can:

1. Copy the `trash-scanner.css` file to your application's CSS directory
2. Copy the `trash-scanner.js` file to your application's JavaScript directory
3. Include these files in your application's HTML:
   ```html
   <link rel="stylesheet" href="path/to/trash-scanner.css">
   <script src="path/to/trash-scanner.js"></script>
   ```
4. Copy the HTML from `trash-scanner-component.html` into your application's `/trash-scanner` page

### Option 2: Framework Integration (React, Vue, Angular, etc.)

If you're using a JavaScript framework:

1. Import the CSS in your component:
   ```javascript
   import './path/to/trash-scanner.css';
   ```

2. Adapt the HTML structure from `trash-scanner-component.html` to your framework's component structure

3. Import and use the JavaScript functionality:
   ```javascript
   import './path/to/trash-scanner.js';
   
   // In your component's mounted/useEffect hook:
   window.initTrashScanner({
     dropAreaId: 'trashScannerDropArea',
     fileInputId: 'trashScannerFileInput',
     // ... other options
   });
   ```

## Step 3: Customize the Appearance

You can customize the appearance of the Trash Scanner by modifying the CSS variables in `trash-scanner.css`:

```css
:root {
    --primary-color: #4CAF50;
    --recycle-color: #2196F3;
    --compost-color: #8BC34A;
    --landfill-color: #FF9800;
}
```

## Step 4: Test the Integration

1. Make sure both your main application and the Flask API server are running
2. Navigate to `http://localhost:8080/trash-scanner` in your browser
3. Upload an image and test the classification functionality

## Troubleshooting

### CORS Issues

If you encounter CORS issues, make sure:

1. The Flask API server is properly configured with CORS support (already done in `app.py`)
2. The origins in the CORS configuration match your application's URL

### API Connection Issues

If the frontend can't connect to the API:

1. Check that the API server is running on port 5002
2. Verify that the `API_BASE_URL` in `trash-scanner.js` is set correctly
3. Check your browser's console for any error messages

### Classification Issues

If image classification isn't working:

1. Verify your Gemini API key is valid and properly set in the `.env` file
2. Check the Flask server logs for any API errors
3. Try with a smaller image if you're encountering timeout issues

## Advanced Customization

### Changing the API Endpoint

If you need to change the API endpoint:

1. Update the `API_BASE_URL` in `trash-scanner.js`:
   ```javascript
   const API_BASE_URL = 'http://your-custom-endpoint:port';
   ```

### Adding Additional Categories

If you want to add more categories beyond recycle, compost, and landfill:

1. Update the `categoryConfig` object in `trash-scanner.js`
2. Update the classification logic in `trash_scanner.py`
3. Update the response data in `app.py` 