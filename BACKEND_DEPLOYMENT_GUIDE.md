# Backend Deployment Guide

This guide provides step-by-step instructions for deploying the EcoVision Tracker backend to a cloud platform.

## Deployment Options

### Option 1: Render (Recommended)

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Select the repository containing your Flask application

3. **Configure the Web Service**
   - **Name**: `ecovision-api` (or your preferred name)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Add the following environment variables**:
     - `VITE_GEMINI_API_KEY`: Your Gemini API key
     - `PRODUCTION`: `true`
     - `USE_MOCK_RESPONSE`: `false` (or `true` if you want to use mock responses)

4. **Deploy the application**
   - Click "Create Web Service"
   - Wait for the deployment to complete

5. **Update your frontend environment variable**
   - Set `VITE_API_BASE_URL` to your Render service URL (e.g., `https://ecovision-api.onrender.com`)

### Option 2: Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project**
   - Connect your GitHub repository
   - Select the repository containing your Flask application

3. **Configure the project**
   - Add the following environment variables:
     - `VITE_GEMINI_API_KEY`: Your Gemini API key
     - `PRODUCTION`: `true`
     - `USE_MOCK_RESPONSE`: `false` (or `true` if you want to use mock responses)
     - `PORT`: `5000` (Railway will override this, but it's good to have)

4. **Deploy the application**
   - Railway will automatically deploy your application
   - Wait for the deployment to complete

5. **Update your frontend environment variable**
   - Set `VITE_API_BASE_URL` to your Railway service URL

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your frontend domain is included in the CORS configuration in app.py
   - Check that the request is being sent to the correct backend URL
   - Verify that the CORS headers are being properly set in the response

2. **API Key Issues**
   - Verify that your Gemini API key is correctly set in the environment variables
   - Check the logs to see if the API key is being loaded correctly
   - If you don't have a valid API key, set `USE_MOCK_RESPONSE` to `true`

3. **Deployment Failures**
   - Check the deployment logs for any error messages
   - Verify that all required dependencies are in your requirements.txt file
   - Ensure that your application is properly configured for production

4. **Connection Issues**
   - Verify that your frontend is using the correct API URL
   - Check that your backend is running and accessible
   - Try accessing the API directly in your browser (e.g., `https://your-api-url.com/api/test`)

### Testing Your Deployment

1. **Test the API directly**
   - Visit `https://your-api-url.com/api/test` in your browser
   - You should see a JSON response with `{"status": "ok"}`

2. **Test the trash scanner**
   - Use a tool like Postman to send a POST request to `https://your-api-url.com/api/classify-trash`
   - Include a base64-encoded image in the request body
   - You should receive a classification response

3. **Test from your frontend**
   - Update your frontend environment variables to point to your deployed backend
   - Try using the trash scanner feature in your application
   - Check the browser console for any error messages

## Maintaining Your Deployment

1. **Monitor your logs**
   - Check the logs regularly for any errors or warnings
   - Set up alerts for critical errors

2. **Update your dependencies**
   - Regularly update your dependencies to ensure security and stability
   - Test thoroughly after updating dependencies

3. **Scale as needed**
   - Monitor your application's performance and scale as needed
   - Consider upgrading to a paid plan if you need more resources 