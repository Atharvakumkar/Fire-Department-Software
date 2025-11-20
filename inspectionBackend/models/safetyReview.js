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
  // FIXED: Use 'numberOfFloors' to match admin panel expectations
  numberOfFloors: { 
    type: Number, 
    required: [true, 'Number of floors is required'],
    min: [1, 'Floors must be at least 1']
  },
  // ADDED: Keep 'floors' as virtual getter for backward compatibility
  floors: {
    type: Number,
    get: function() { return this.numberOfFloors; },
    set: function(v) { this.numberOfFloors = v; }
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
  // FIXED: Changed to 'createdAt' for consistency
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  // ADDED: Keep submittedDate as alias
  submittedDate: {
    type: Date,
    get: function() { return this.createdAt; }
  },
  // FIXED: Changed enum values to match lowercase
  status: { 
    type: String, 
    enum: ['submitted', 'under review', 'approved', 'rejected'], 
    default: 'submitted'
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
}, {
  // Enable virtuals in JSON
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// ADDED: Virtual for statusClass used in admin panel
safetyReviewSchema.virtual('statusClass').get(function() {
  const statusMap = {
    'submitted': 'bg-yellow-600',
    'under review': 'bg-blue-600',
    'approved': 'bg-green-600',
    'rejected': 'bg-red-600'
  };
  return statusMap[this.status] || 'bg-gray-600';
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
safetyReviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SafetyReview', safetyReviewSchema);