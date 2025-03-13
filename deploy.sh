#!/bin/bash

# Deployment script for EcoVision app

echo "Starting deployment process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Ensure environment variables are set
echo "Checking environment variables..."

# Create .vercel directory if it doesn't exist
mkdir -p .vercel

# Create or update project.json if needed
if [ ! -f .vercel/project.json ]; then
    echo "Creating project configuration..."
    cat > .vercel/project.json << EOF
{
  "projectId": "prj_ecovision",
  "orgId": "your-org-id"
}
EOF
fi

# Remind about environment variables
echo "IMPORTANT: Make sure you have set up the following environment variables in the Vercel dashboard:"
echo "- VITE_API_BASE_URL"
echo "- VITE_SUPABASE_URL"
echo "- VITE_SUPABASE_API_KEY"
echo "- VITE_CLERK_PUBLISHABLE_KEY"

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!" 