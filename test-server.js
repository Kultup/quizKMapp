const http = require('http');
const url = require('url');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  console.log(`${req.method} ${path}`);

  // Parse request body for POST requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    let requestData = {};
    if (body) {
      try {
        requestData = JSON.parse(body);
      } catch (e) {
        console.log('Invalid JSON:', body);
      }
    }

    res.setHeader('Content-Type', 'application/json');

    // Health check endpoint
    if (path === '/api/health' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'OK',
        message: 'Test server is running!',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Mock registration endpoint
    if (path === '/api/auth/register' && req.method === 'POST') {
      console.log('Registration attempt:', requestData);
      res.writeHead(201);
      res.end(JSON.stringify({
        message: 'Registration successful (mock)',
        user: {
          id: '1',
          email: requestData.email,
          first_name: requestData.firstName,
          last_name: requestData.lastName,
          created_at: new Date().toISOString()
        },
        token: 'mock-jwt-token'
      }));
      return;
    }

    // Mock login endpoint
    if (path === '/api/auth/login' && req.method === 'POST') {
      console.log('Login attempt:', requestData);
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Login successful (mock)',
        user: {
          id: '1',
          email: requestData.email,
          first_name: 'Test',
          last_name: 'User',
          created_at: new Date().toISOString()
        },
        token: 'mock-jwt-token'
      }));
      return;
    }

    // 404 for other routes
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://0.0.0.0:${PORT}`);
  console.log(`Available at http://192.168.201.14:${PORT}`);
});