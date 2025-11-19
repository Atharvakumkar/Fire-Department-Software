// create_admin.js
// Usage: node create_admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname'; // override with Atlas URI
const adminData = {
  username: 'admin',
  password: 'admin123',
  role: 'admin'
};

// Minimal Admin schema — will create a collection named 'admins' if not present.
// If your app uses a different collection name or extra required fields, tell me or paste the Admin model.
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ username: adminData.username });
    if (existing) {
      console.log('Admin already exists:', existing.username);
      process.exit(0);
    }

    const hash = await bcrypt.hash(adminData.password, 10);
    const admin = new Admin({
      username: adminData.username,
      password: hash,
      role: adminData.role
    });

    await admin.save();
    console.log('Admin created:', admin.username);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
