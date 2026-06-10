/**
 * Hubtel SMS System
 * Main server file
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    service: 'Hubtel SMS System'
  });
});

// SMS Routes
app.use('/api/sms', require('./routes/sms'));

// Serve HTML on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error'
      : err.message
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   Hubtel SMS System                            ║
║   Running on http://localhost:${PORT}           ║
╠════════════════════════════════════════════════╣
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(26)} ║
║   Sender ID: ${(process.env.HUBTEL_SENDER_ID || 'Not set').padEnd(28)} ║
╠════════════════════════════════════════════════╣
║   POST /api/sms/send      - Send SMS           ║
║   GET  /api/sms/status    - Check status       ║
║   POST /api/sms/bulk      - Bulk send          ║
║   GET  /api/sms/history   - Message history    ║
║   GET  /api/health        - Health check       ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
