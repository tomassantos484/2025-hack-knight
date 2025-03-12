// Simple API endpoint to test connectivity
export default function handler(req, res) {
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://2025-hack-knight.vercel.app/',
    'https://ecovision-backend-production.up.railway.app'
  ];
  
  // Get the request origin
  const origin = req.headers.origin;
  
  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    // Set CORS headers for allowed origins
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  } else if (!origin) {
    // For requests without origin (like curl or Postman)
    console.warn('Request without origin header');
  } else {
    // Log disallowed origins for monitoring
    console.warn(`CORS request from disallowed origin: ${origin}`);
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  
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