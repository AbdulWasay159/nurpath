require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Create admin
  const existing = await User.findOne({ email: 'admin@nurpath.app' });
  let admin;
  if (!existing) {
    admin = await User.create({
      name: 'NurPath Admin',
      email: 'admin@nurpath.app',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('✅ Admin created: admin@nurpath.app / Admin@123');
  } else {
    admin = existing;
    console.log('ℹ️  Admin already exists');
  }

  console.log('\n🚀 Seed complete!');
  console.log('Admin login: admin@nurpath.app | Admin@123');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
