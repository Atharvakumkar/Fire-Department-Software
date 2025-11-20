const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SafetyReview = require('../models/safetyReview');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/safety-reviews';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, PNG files are allowed'));
    }
  }
});

// ============================================================
// POST: Submit Safety Review
// ============================================================
router.post('/', upload.fields([
  { name: 'buildingPlan', maxCount: 1 },
  { name: 'equipmentLayout', maxCount: 1 },
  { name: 'electricalLayout', maxCount: 1 },
  { name: 'previousAudit', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      buildingName, buildingType, address, floors, occupancyLoad,
      yearConstruction, ownerName, contactNumber,
      fireExtinguishers, hydrants, smokeDetectors, sprinklers,
      fireAlarm, emergencyExits, firePump,
      wiringCondition, earthing, panelsAccessible,
      escapeRoutes, fireDoors, staircaseWidth,
      hazardousStorage, corridors, wasteDisposal
    } = req.body;

    // Validate required fields
    if (!buildingName || !buildingType || !address || !floors || !occupancyLoad || !yearConstruction || !ownerName || !contactNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields. Please fill all marked fields with *' 
      });
    }

    // Create new safety review
    const safetyReview = new SafetyReview({
      buildingName,
      buildingType,
      address,
      numberOfFloors: Number(floors), // FIXED: use numberOfFloors
      occupancyLoad: Number(occupancyLoad),
      yearConstruction: Number(yearConstruction),
      ownerName,
      contactNumber,
      
      fireProtection: {
        fireExtinguishers: fireExtinguishers === 'true' || fireExtinguishers === true,
        hydrants: hydrants === 'true' || hydrants === true,
        smokeDetectors: smokeDetectors === 'true' || smokeDetectors === true,
        sprinklers: sprinklers === 'true' || sprinklers === true,
        fireAlarm: fireAlarm === 'true' || fireAlarm === true,
        emergencyExits: emergencyExits === 'true' || emergencyExits === true,
        firePump: firePump === 'true' || firePump === true
      },
      
      electricalSafety: {
        wiringCondition: wiringCondition || 'good',
        earthing: earthing === 'true' || earthing === true,
        panelsAccessible: panelsAccessible === 'true' || panelsAccessible === true
      },
      
      structuralSafety: {
        escapeRoutes: escapeRoutes === 'true' || escapeRoutes === true,
        fireDoors: fireDoors === 'true' || fireDoors === true,
        staircaseWidth: staircaseWidth === 'true' || staircaseWidth === true
      },
      
      housekeepingStorage: {
        hazardousStorage: hazardousStorage === 'true' || hazardousStorage === true,
        corridors: corridors === 'true' || corridors === true,
        wasteDisposal: wasteDisposal === 'true' || wasteDisposal === true
      },

      documents: {
        buildingPlan: req.files?.buildingPlan?.[0]?.path,
        equipmentLayout: req.files?.equipmentLayout?.[0]?.path,
        electricalLayout: req.files?.electricalLayout?.[0]?.path,
        previousAudit: req.files?.previousAudit?.[0]?.path,
        additionalDocs: req.files?.additionalDocs?.[0]?.path
      },

      status: 'submitted' // FIXED: lowercase
    });

    // Save to database
    await safetyReview.save();

    res.status(201).json({
      success: true,
      message: 'Safety review submitted successfully',
      data: {
        reviewId: safetyReview.reviewId,
        submittedDate: safetyReview.createdAt,
        status: safetyReview.status
      }
    });
  } catch (error) {
    console.error('Error creating safety review:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error submitting safety review' 
    });
  }
});

// ============================================================
// GET: Fetch Safety Review by Review ID
// ============================================================
router.get('/review/:reviewId', async (req, res) => {
  try {
    const review = await SafetyReview.findOne({ reviewId: req.params.reviewId });
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found with this ID' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching review' 
    });
  }
});

// ============================================================
// GET: Statistics/Summary
// ============================================================
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await SafetyReview.countDocuments();
    const submitted = await SafetyReview.countDocuments({ status: 'submitted' });
    const approved = await SafetyReview.countDocuments({ status: 'approved' });
    const rejected = await SafetyReview.countDocuments({ status: 'rejected' });
    const reviewed = await SafetyReview.countDocuments({ status: 'under review' });

    res.status(200).json({
      success: true,
      data: {
        total,
        submitted,
        approved,
        rejected,
        reviewed
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching statistics' 
    });
  }
});

// ============================================================
// GET: Fetch All Safety Reviews
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { status, q } = req.query;
    let query = {};
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }
    
    // Search functionality
    if (q) {
      query.$or = [
        { buildingName: { $regex: q, $options: 'i' } },
        { ownerName: { $regex: q, $options: 'i' } },
        { reviewId: { $regex: q, $options: 'i' } }
      ];
    }
    
    const reviews = await SafetyReview.find(query)
      .select('reviewId buildingName buildingType address ownerName createdAt status numberOfFloors')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching reviews' 
    });
  }
});

// ============================================================
// PUT: Update Safety Review Status
// FIXED: Changed from PATCH to PUT to match frontend
// ============================================================
router.put('/:id/status', async (req, res) => {
  try {
    const { status, remarks, reviewedBy } = req.body;
    const validStatuses = ['submitted', 'under review', 'approved', 'rejected'];
    
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    let review;
    const updateData = { 
      status: status.toLowerCase(), 
      lastUpdated: Date.now() 
    };
    
    // Add optional fields if provided
    if (remarks !== undefined) updateData.remarks = remarks;
    if (reviewedBy !== undefined) updateData.reviewedBy = reviewedBy;
    
    // Try to find by MongoDB _id
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      review = await SafetyReview.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
    } else {
      // Try by reviewId
      review = await SafetyReview.findOneAndUpdate(
        { reviewId: req.params.id },
        updateData,
        { new: true }
      );
    }

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating status' 
    });
  }
});

// ============================================================
// PUT: Update Safety Review (Full Update)
// ============================================================
router.put('/:id', async (req, res) => {
  try {
    let review;
    const updateData = { ...req.body, lastUpdated: Date.now() };
    
    // Handle floors field mapping
    if (updateData.floors) {
      updateData.numberOfFloors = updateData.floors;
      delete updateData.floors;
    }
    
    // Try to find by MongoDB _id
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      review = await SafetyReview.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      // Try by reviewId
      review = await SafetyReview.findOneAndUpdate(
        { reviewId: req.params.id },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating review' 
    });
  }
});

// ============================================================
// GET: Fetch Single Safety Review by ID or Review ID
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    let review;
    
    // Try to find by MongoDB _id
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      review = await SafetyReview.findById(req.params.id);
    } else {
      // Try by reviewId
      review = await SafetyReview.findOne({ reviewId: req.params.id });
    }
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching review' 
    });
  }
});

// ============================================================
// DELETE: Delete Safety Review
// ============================================================
router.delete('/:id', async (req, res) => {
  try {
    let review;
    
    // Try to find by MongoDB _id
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      review = await SafetyReview.findByIdAndDelete(req.params.id);
    } else {
      // Try by reviewId
      review = await SafetyReview.findOneAndDelete({ reviewId: req.params.id });
    }
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error deleting review' 
    });
  }
});

module.exports = router;