const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5001;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'inspection-uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer
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
  limits: { fileSize: 10 * 1024 * 1024 }
});

// In-memory storage
let safetyReviews = [];
let reviewCounter = 1000;

// Status classes mapping
const statusClasses = {
  'Pending': 'bg-yellow-500',
  'Submitted': 'bg-yellow-500',
  'Under Review': 'bg-blue-500',
  'Approved': 'bg-green-500',
  'Rejected': 'bg-red-500'
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Inspection API is running' });
});

// ========== SAFETY REVIEWS ENDPOINTS ==========

// Get all safety reviews
app.get('/api/safety-reviews', (req, res) => {
  try {
    const { status, q } = req.query;
    let filtered = [...safetyReviews];

    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(review => review.status === status);
    }

    // Search
    if (q) {
      const searchLower = q.toLowerCase();
      filtered = filtered.filter(review =>
        (review.reviewId && review.reviewId.toLowerCase().includes(searchLower)) ||
        (review.buildingName && review.buildingName.toLowerCase().includes(searchLower)) ||
        (review.ownerName && review.ownerName.toLowerCase().includes(searchLower))
      );
    }

    res.json({ 
      success: true, 
      data: filtered 
    });
  } catch (error) {
    console.error('Error fetching safety reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching safety reviews' 
    });
  }
});

// Get specific safety review
app.get('/api/safety-reviews/:id', (req, res) => {
  try {
    const review = safetyReviews.find(r => 
      r.reviewId === req.params.id || r._id === req.params.id
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Safety review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching safety review:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching safety review'
    });
  }
});

// Submit new safety review
app.post('/api/safety-reviews', 
  upload.fields([
    { name: 'buildingPlan', maxCount: 1 },
    { name: 'equipmentLayout', maxCount: 1 },
    { name: 'electricalLayout', maxCount: 1 },
    { name: 'previousAudit', maxCount: 1 },
    { name: 'additionalDocs', maxCount: 5 }
  ]),
  (req, res) => {
    try {
      const data = req.body;

      // Generate review ID
      reviewCounter++;
      const reviewId = `REV${reviewCounter}`;

      // Create review object
      const newReview = {
        reviewId,
        _id: reviewId,
        buildingName: data.buildingName,
        buildingType: data.buildingType,
        address: data.address,
        floors: parseInt(data.floors) || 0,
        numberOfFloors: parseInt(data.floors) || 0,
        occupancyLoad: data.occupancyLoad,
        yearConstruction: data.yearConstruction,
        ownerName: data.ownerName,
        contactNumber: data.contactNumber,
        
        // Fire safety equipment
        fireExtinguishers: data.fireExtinguishers === 'true' || data.fireExtinguishers === true,
        hydrants: data.hydrants === 'true' || data.hydrants === true,
        smokeDetectors: data.smokeDetectors === 'true' || data.smokeDetectors === true,
        sprinklers: data.sprinklers === 'true' || data.sprinklers === true,
        fireAlarm: data.fireAlarm === 'true' || data.fireAlarm === true,
        emergencyExits: data.emergencyExits === 'true' || data.emergencyExits === true,
        firePump: data.firePump === 'true' || data.firePump === true,
        
        // Electrical & structural
        wiringCondition: data.wiringCondition,
        earthing: data.earthing === 'true' || data.earthing === true,
        panelsAccessible: data.panelsAccessible === 'true' || data.panelsAccessible === true,
        escapeRoutes: data.escapeRoutes === 'true' || data.escapeRoutes === true,
        fireDoors: data.fireDoors === 'true' || data.fireDoors === true,
        staircaseWidth: data.staircaseWidth === 'true' || data.staircaseWidth === true,
        
        // Housekeeping
        hazardousStorage: data.hazardousStorage === 'true' || data.hazardousStorage === true,
        corridors: data.corridors === 'true' || data.corridors === true,
        wasteDisposal: data.wasteDisposal === 'true' || data.wasteDisposal === true,
        
        submittedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'Pending',
        statusClass: statusClasses['Pending'],
        remarks: '',
        files: {
          buildingPlan: req.files?.buildingPlan?.[0]?.filename || null,
          equipmentLayout: req.files?.equipmentLayout?.[0]?.filename || null,
          electricalLayout: req.files?.electricalLayout?.[0]?.filename || null,
          previousAudit: req.files?.previousAudit?.[0]?.filename || null,
          additionalDocs: req.files?.additionalDocs?.map(f => f.filename) || []
        }
      };

      // Add file URLs
      if (newReview.files.buildingPlan) {
        newReview.buildingPlanUrl = `/uploads/${newReview.files.buildingPlan}`;
      }
      if (newReview.files.equipmentLayout) {
        newReview.equipmentLayoutUrl = `/uploads/${newReview.files.equipmentLayout}`;
      }
      if (newReview.files.electricalLayout) {
        newReview.electricalLayoutUrl = `/uploads/${newReview.files.electricalLayout}`;
      }
      if (newReview.files.previousAudit) {
        newReview.previousAuditUrl = `/uploads/${newReview.files.previousAudit}`;
      }

      safetyReviews.push(newReview);

      console.log('✅ New safety review created:', reviewId);
      
      res.json({
        success: true,
        message: 'Safety review submitted successfully',
        data: newReview
      });
    } catch (error) {
      console.error('Error submitting safety review:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting safety review: ' + error.message
      });
    }
  }
);

// Update safety review status (supports both PATCH and PUT)
app.patch('/api/safety-reviews/:id/status', updateReviewStatus);
app.put('/api/safety-reviews/:id/status', updateReviewStatus);

function updateReviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks, updatedBy } = req.body;

    const reviewIndex = safetyReviews.findIndex(r => 
      r.reviewId === id || r._id === id
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Safety review not found'
      });
    }

    // Update the review
    safetyReviews[reviewIndex].status = status;
    safetyReviews[reviewIndex].statusClass = statusClasses[status] || statusClasses['Pending'];
    safetyReviews[reviewIndex].remarks = remarks || safetyReviews[reviewIndex].remarks;
    safetyReviews[reviewIndex].updatedBy = updatedBy || 'admin';
    safetyReviews[reviewIndex].updatedDate = new Date().toISOString();

    console.log(`✅ Safety review ${id} status updated to: ${status}`);

    res.json({
      success: true,
      message: 'Safety review status updated successfully',
      data: safetyReviews[reviewIndex]
    });
  } catch (error) {
    console.error('Error updating safety review status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating safety review status'
    });
  }
}

// Delete safety review
app.delete('/api/safety-reviews/:id', (req, res) => {
  try {
    const { id } = req.params;
    const reviewIndex = safetyReviews.findIndex(r => 
      r.reviewId === id || r._id === id
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Safety review not found'
      });
    }

    // Remove from array
    const deleted = safetyReviews.splice(reviewIndex, 1)[0];

    // Delete associated files
    if (deleted.files) {
      Object.values(deleted.files).forEach(filename => {
        if (Array.isArray(filename)) {
          filename.forEach(fn => {
            const filePath = path.join(uploadsDir, fn);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          });
        } else if (filename) {
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }

    console.log(`✅ Safety review ${id} deleted`);

    res.json({
      success: true,
      message: 'Safety review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting safety review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting safety review'
    });
  }
});

// ========== ALSO SUPPORT /api/inspections for admin panel ==========

// Get all inspections (alias for safety-reviews)
app.get('/api/inspections', (req, res) => {
  try {
    const { status, q } = req.query;
    let filtered = safetyReviews.map(r => ({
      ...r,
      inspectionId: r.reviewId,
      building: r.buildingName
    }));

    if (status && status !== 'all') {
      filtered = filtered.filter(i => i.status === status);
    }

    if (q) {
      const searchLower = q.toLowerCase();
      filtered = filtered.filter(i =>
        (i.inspectionId && i.inspectionId.toLowerCase().includes(searchLower)) ||
        (i.buildingName && i.buildingName.toLowerCase().includes(searchLower)) ||
        (i.ownerName && i.ownerName.toLowerCase().includes(searchLower))
      );
    }

    res.json({ 
      success: true, 
      data: filtered 
    });
  } catch (error) {
    console.error('Error fetching inspections:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching inspections' 
    });
  }
});

// Get specific inspection
app.get('/api/inspections/:id', (req, res) => {
  try {
    const review = safetyReviews.find(r => 
      r.reviewId === req.params.id || r._id === req.params.id
    );
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...review,
        inspectionId: review.reviewId
      }
    });
  } catch (error) {
    console.error('Error fetching inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inspection'
    });
  }
});

// Update inspection status
app.patch('/api/inspections/:id/status', (req, res) => updateReviewStatus(req, res));
app.put('/api/inspections/:id/status', (req, res) => updateReviewStatus(req, res));

// Delete inspection
app.delete('/api/inspections/:id', (req, res) => {
  req.params.id = req.params.id; // Use same delete logic
  app._router.handle(Object.assign(req, { url: `/api/safety-reviews/${req.params.id}`, method: 'DELETE' }), res);
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🔥 Fire Safety Inspection Backend Server');
  console.log('='.repeat(60));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ API available at:`);
  console.log(`   - http://localhost:${PORT}/api/safety-reviews`);
  console.log(`   - http://localhost:${PORT}/api/inspections`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
});