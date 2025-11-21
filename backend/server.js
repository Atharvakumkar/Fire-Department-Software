const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory storage for applications
let applications = [];
let appCounter = 1000;

// Status classes mapping
const statusClasses = {
  'Pending': 'bg-yellow-500',
  'Under Review': 'bg-blue-500',
  'Approved': 'bg-green-500',
  'Rejected': 'bg-red-500'
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

// Get all applications
app.get('/api/applications', (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: applications 
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applications' 
    });
  }
});

// Submit new application
app.post('/api/applications', 
  upload.fields([
    { name: 'buildingPlan', maxCount: 1 },
    { name: 'propertyDoc', maxCount: 1 },
    { name: 'idProof', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const {
        buildingType,
        propertyName,
        plotNumber,
        address,
        builtupArea,
        floors,
        applicantName,
        mobile,
        email,
        applicantType
      } = req.body;

      // Validate required fields
      if (!buildingType || !propertyName || !plotNumber || !address || 
          !builtupArea || !floors || !applicantName || !mobile || !email || !applicantType) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be filled'
        });
      }

      // Generate application number
      appCounter++;
      const appNo = `NOC${appCounter}`;

      // Create application object
      const newApplication = {
        appNo,
        buildingType,
        propertyName,
        plotNumber,
        address,
        builtupArea: parseInt(builtupArea),
        floors: parseInt(floors),
        applicantName,
        mobile,
        email,
        applicantType,
        submittedDate: new Date().toISOString(),
        status: 'Pending',
        statusClass: statusClasses['Pending'],
        files: {
          buildingPlan: req.files?.buildingPlan?.[0]?.filename || null,
          propertyDoc: req.files?.propertyDoc?.[0]?.filename || null,
          idProof: req.files?.idProof?.[0]?.filename || null
        }
      };

      applications.push(newApplication);

      console.log('New application created:', appNo);
      
      res.json({
        success: true,
        message: 'Application submitted successfully',
        data: newApplication
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting application: ' + error.message
      });
    }
  }
);

// Get specific application
app.get('/api/applications/:appNo', (req, res) => {
  try {
    const application = applications.find(app => app.appNo === req.params.appNo);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`✅ API available at http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});