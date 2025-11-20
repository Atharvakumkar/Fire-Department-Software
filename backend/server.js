// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fire_noc_db')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

// Application Schema
const applicationSchema = new mongoose.Schema({
  appNo: {
    type: String,
    required: true,
    unique: true
  },
  buildingType: {
    type: String,
    required: true
  },
  propertyName: {
    type: String,
    required: true
  },
  plotNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  builtupArea: {
    type: Number,
    required: true
  },
  floors: {
    type: Number,
    required: true
  },
  applicantName: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  applicantType: {
    type: String,
    required: true
  },
  documents: {
    buildingPlan: String,
    propertyDoc: String,
    idProof: String
  },
  status: {
    type: String,
    default: 'Submitted',
    enum: ['Submitted', 'Under Review', 'Approved', 'Rejected']
  },
  statusClass: {
    type: String,
    default: 'bg-blue-500'
  },
  remarks: {
    type: String,
    default: ''
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: String,
    default: ''
  },
  reviewedDate: {
    type: Date
  }
}, {
  timestamps: true
});

const Application = mongoose.model('Application', applicationSchema);

// File Upload Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'));
    }
  }
});

// Generate Application Number
async function generateAppNo() {
  const count = await Application.countDocuments();
  return 'NOC2024' + String(count + 1).padStart(3, '0');
}

// ============= ADMIN ROUTES =============

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // For demo purposes, use simple authentication
    // In production, use bcrypt for password hashing
    const admin = await Admin.findOne({ username, password });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Replace your current POST endpoint with this GET endpoint
// Create Default Admin (run once) - GET version
app.get('/api/admin/create-default', async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      return res.json({
        success: false,
        message: 'Default admin already exists'
      });
    }

    const admin = new Admin({
      username: 'admin',
      password: 'admin123', // Change this in production!
      email: 'admin@firenoc.com',
      role: 'admin'
    });

    await admin.save();

    res.json({
      success: true,
      message: 'Default admin created successfully',
      credentials: {
        username: 'admin',
        password: 'admin123'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin',
      error: error.message
    });
  }
});

// Get Dashboard Statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const total = await Application.countDocuments();
    const submitted = await Application.countDocuments({ status: 'Submitted' });
    const underReview = await Application.countDocuments({ status: 'Under Review' });
    const approved = await Application.countDocuments({ status: 'Approved' });
    const rejected = await Application.countDocuments({ status: 'Rejected' });

    res.json({
      success: true,
      data: {
        total,
        submitted,
        underReview,
        approved,
        rejected
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// ============= APPLICATION ROUTES =============

// Submit New Application
app.post('/api/applications', upload.fields([
  { name: 'buildingPlan', maxCount: 1 },
  { name: 'propertyDoc', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const appNo = await generateAppNo();
    
    const applicationData = {
      appNo: appNo,
      buildingType: req.body.buildingType,
      propertyName: req.body.propertyName,
      plotNumber: req.body.plotNumber,
      address: req.body.address,
      builtupArea: req.body.builtupArea,
      floors: req.body.floors,
      applicantName: req.body.applicantName,
      mobile: req.body.mobile,
      email: req.body.email,
      applicantType: req.body.applicantType,
      documents: {
        buildingPlan: req.files['buildingPlan'] ? req.files['buildingPlan'][0].filename : null,
        propertyDoc: req.files['propertyDoc'] ? req.files['propertyDoc'][0].filename : null,
        idProof: req.files['idProof'] ? req.files['idProof'][0].filename : null
      }
    };

    const application = new Application(applicationData);
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
});

// Get All Applications
app.get('/api/applications', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { appNo: { $regex: search, $options: 'i' } },
        { propertyName: { $regex: search, $options: 'i' } },
        { applicantName: { $regex: search, $options: 'i' } }
      ];
    }

    const applications = await Application.find(query).sort({ submittedDate: -1 });
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Get Single Application
app.get('/api/applications/:appNo', async (req, res) => {
  try {
    const application = await Application.findOne({ appNo: req.params.appNo });
    
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
      message: 'Error fetching application',
      error: error.message
    });
  }
});

// Update Application Status (Admin)
app.patch('/api/applications/:appNo/status', async (req, res) => {
  try {
    const { status, remarks, reviewedBy } = req.body;
    
    const statusClassMap = {
      'Submitted': 'bg-blue-500',
      'Under Review': 'bg-yellow-500',
      'Approved': 'bg-green-500',
      'Rejected': 'bg-red-500'
    };

    const updateData = {
      status: status,
      statusClass: statusClassMap[status],
      reviewedDate: new Date()
    };

    if (remarks) updateData.remarks = remarks;
    if (reviewedBy) updateData.reviewedBy = reviewedBy;

    const application = await Application.findOneAndUpdate(
      { appNo: req.params.appNo },
      updateData,
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
});

// Delete Application
app.delete('/api/applications/:appNo', async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ appNo: req.params.appNo });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});