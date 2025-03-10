// Simple API endpoint to test connectivity
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Handle GET request
  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'ok', 
      message: 'API is working', 
      timestamp: new Date().toISOString() 
    });
    return;
  }
  
  // Handle other methods
  res.status(405).json({ error: 'Method not allowed' });
} 