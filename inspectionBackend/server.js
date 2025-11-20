const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads/safety-reviews')) {
  fs.mkdirSync('uploads/safety-reviews', { recursive: true });
}

// ============================================================
// MONGODB ATLAS CONNECTION
// ============================================================

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('✗ MONGODB_URI not defined in .env file');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✓ MongoDB Atlas connected successfully');
})
.catch(err => {
  console.error('✗ MongoDB Atlas connection error:', err.message);
  process.exit(1);
});

// ============================================================
// ROUTES
// ============================================================

// Import safety review routes
const safetyReviewRoutes = require('./routes/safetyReview');

// Use routes
app.use('/api/safety-reviews', safetyReviewRoutes);

// ============================================================
// ROOT ENDPOINT (Test)
// ============================================================

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Fire Safety Code Review Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      'POST /api/safety-reviews': 'Submit new safety review',
      'GET /api/safety-reviews': 'Get all safety reviews',
      'GET /api/safety-reviews/:id': 'Get specific safety review',
      'PUT /api/safety-reviews/:id/status': 'Update review status',
      'DELETE /api/safety-reviews/:id': 'Delete safety review'
    }
  });
});

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Server is running',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    mongodbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ============================================================
// 404 ERROR HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// ============================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds 5MB limit'
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ============================================================
// SERVER STARTUP
// ============================================================

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'production';

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🔥 Fire Safety Code Review Backend');
  console.log('='.repeat(70));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`💾 Database: MongoDB Atlas (Cluster)`);
  console.log(`📦 Uploads directory: ./uploads/safety-reviews`);
  console.log('='.repeat(70) + '\n');
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.on('SIGTERM', () => {
  console.log('\n✓ SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✓ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✓ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n✓ SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✓ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✓ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('✗ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;