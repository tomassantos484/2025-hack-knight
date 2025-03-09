# Backend Deployment Guide

This guide provides instructions for deploying the Flask backend for the EcoVision Tracker application.

## Option 1: Render Deployment (Recommended)

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Select the repository containing your Flask application

3. **Configure the Web Service**
   - **Name**: `ecovision-api` (or your preferred name)
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Add the following environment variables**:
     - `VITE_GEMINI_API_KEY`: Your Gemini API key

4. **Add gunicorn to requirements.txt**
   ```
   gunicorn==21.2.0
   ```

5. **Update app.py to use the PORT environment variable**
   ```python
   if __name__ == '__main__':
       # Use the PORT environment variable provided by the hosting platform
       port = int(os.environ.get('PORT', 5002))
       app.run(host='0.0.0.0', port=port)
   ```

6. **Update CORS configuration**
   ```python
   CORS(app, resources={r"/*": {"origins": ["https://2025-hack-knight.vercel.app", "https://*.vercel.app"], 
                              "methods": ["GET", "POST", "OPTIONS"], 
                              "allow_headers": "*"}})
   ```

7. **Deploy the application**
   - Click "Create Web Service"
   - Wait for the deployment to complete

8. **Update your frontend environment variable**
   - Set `VITE_API_BASE_URL` to your Render service URL (e.g., `https://ecovision-api.onrender.com`)

## Option 2: Heroku Deployment

1. **Create a Heroku account** at [heroku.com](https://heroku.com)

2. **Install the Heroku CLI**
   ```bash
   npm install -g heroku
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   ```

4. **Create a Procfile**
   Create a file named `Procfile` (no extension) with the following content:
   ```
   web: gunicorn app:app
   ```

5. **Add gunicorn to requirements.txt**
   ```
   gunicorn==21.2.0
   ```

6. **Update app.py to use the PORT environment variable**
   ```python
   if __name__ == '__main__':
       port = int(os.environ.get('PORT', 5002))
       app.run(host='0.0.0.0', port=port)
   ```

7. **Create a Heroku app**
   ```bash
   heroku create ecovision-api
   ```

8. **Set environment variables**
   ```bash
   heroku config:set VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

9. **Deploy to Heroku**
   ```bash
   git push heroku main
   ```

10. **Update your frontend environment variable**
    - Set `VITE_API_BASE_URL` to your Heroku app URL (e.g., `https://ecovision-api.herokuapp.com`)

## Troubleshooting

### CORS Issues
If you're experiencing CORS issues:
1. Verify that your frontend URL is included in the CORS configuration
2. Check that the request is being sent to the correct backend URL
3. Ensure that the CORS headers are being properly set in the response

### API Connection Issues
If your frontend can't connect to the backend:
1. Check that the `VITE_API_BASE_URL` is set correctly
2. Verify that your backend is running and accessible
3. Check the browser console for any error messages
4. Try accessing the API directly in your browser (e.g., `https://your-api-url.com/api/test`)

### Deployment Issues
If you're having trouble deploying:
1. Check the deployment logs for any error messages
2. Verify that all required dependencies are in your requirements.txt file
3. Ensure that your application is properly configured for production
4. Check that your environment variables are set correctly 