const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Basic Rate Limiter (30 requests per minute per IP)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many chat requests from this IP address. Please wait a minute before trying again.'
  }
});

// 2. CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
app.use(cors({
  origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(','),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body Parsing Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Health check endpoint (exempt from rate limiting)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 5. Rate Limiting Middleware on API routes
app.use('/api', apiLimiter);

// 6. API Routes
app.use('/api', chatRoutes);

// 7. Serve static frontend assets from client directory
const clientDir = path.join(__dirname, '../client');
app.use(express.static(clientDir));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDir, 'index.html'));
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// 9. Start Server
app.listen(PORT, () => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  console.log(`==================================================`);
  console.log(`🚀 AI Chatbot Server is running on port ${PORT}`);
  console.log(`🌐 Local Web UI: http://localhost:${PORT}`);
  console.log(`📡 API Endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🔑 Gemini API Key Status: ${hasApiKey ? 'Configured ✅' : 'Missing / Demo Mode ⚠️'}`);
  console.log(`==================================================`);
});
