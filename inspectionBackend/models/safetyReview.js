const mongoose = require('mongoose');

const safetyReviewSchema = new mongoose.Schema({
  // Building Information
  buildingName: { 
    type: String, 
    required: [true, 'Building name is required'],
    trim: true
  },
  buildingType: { 
    type: String, 
    enum: ['residential', 'commercial', 'industrial', 'mixed', 'other'], 
    required: [true, 'Building type is required']
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'],
    trim: true
  },
  floors: { 
    type: Number, 
    required: [true, 'Number of floors is required'],
    min: [1, 'Floors must be at least 1']
  },
  occupancyLoad: { 
    type: Number, 
    required: [true, 'Occupancy load is required'],
    min: [1, 'Occupancy load must be at least 1']
  },
  yearConstruction: { 
    type: Number, 
    required: [true, 'Year of construction is required'],
    min: [1900, 'Year must be 1900 or later'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  ownerName: { 
    type: String, 
    required: [true, 'Owner name is required'],
    trim: true
  },
  contactNumber: { 
    type: String, 
    required: [true, 'Contact number is required'],
    trim: true
  },

  // Fire Safety Infrastructure Checklist
  fireProtection: {
    fireExtinguishers: { type: Boolean, default: false },
    hydrants: { type: Boolean, default: false },
    smokeDetectors: { type: Boolean, default: false },
    sprinklers: { type: Boolean, default: false },
    fireAlarm: { type: Boolean, default: false },
    emergencyExits: { type: Boolean, default: false },
    firePump: { type: Boolean, default: false }
  },
  
  electricalSafety: {
    wiringCondition: { 
      type: String, 
      enum: ['good', 'average', 'poor'], 
      default: 'good' 
    },
    earthing: { type: Boolean, default: false },
    panelsAccessible: { type: Boolean, default: false }
  },
  
  structuralSafety: {
    escapeRoutes: { type: Boolean, default: false },
    fireDoors: { type: Boolean, default: false },
    staircaseWidth: { type: Boolean, default: false }
  },
  
  housekeepingStorage: {
    hazardousStorage: { type: Boolean, default: false },
    corridors: { type: Boolean, default: false },
    wasteDisposal: { type: Boolean, default: false }
  },

  // Document Upload
  documents: {
    buildingPlan: { type: String, default: null },
    equipmentLayout: { type: String, default: null },
    electricalLayout: { type: String, default: null },
    previousAudit: { type: String, default: null },
    additionalDocs: { type: String, default: null }
  },

  // Metadata
  reviewId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  submittedDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'Approved', 'Rejected'], 
    default: 'Submitted'
  },
  remarks: { 
    type: String, 
    default: '' 
  },
  reviewedBy: { 
    type: String, 
    default: '' 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save hook to generate Review ID
safetyReviewSchema.pre('save', async function(next) {
  if (!this.reviewId) {
    try {
      const count = await mongoose.model('SafetyReview').countDocuments();
      this.reviewId = `SR-${Date.now()}-${count + 1}`;
    } catch (error) {
      console.error('Error generating Review ID:', error);
    }
  }
  this.lastUpdated = Date.now();
  next();
});

// Index for faster queries
safetyReviewSchema.index({ reviewId: 1 });
safetyReviewSchema.index({ buildingName: 1 });
safetyReviewSchema.index({ status: 1 });
safetyReviewSchema.index({ submittedDate: -1 });

module.exports = mongoose.model('SafetyReview', safetyReviewSchema);