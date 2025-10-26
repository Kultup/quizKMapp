const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./src/models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Admin user credentials
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      city: 'System',
      position: 'Administrator',
      email: 'admin@quizapp.com',
      phone: '+1234567890',
      password: 'admin123', // Change this to a secure password
      isAdmin: true
    };

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminData.password, saltRounds);

    // Create admin user
    const adminUser = await User.create({
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      city: adminData.city,
      position: adminData.position,
      email: adminData.email,
      phone: adminData.phone,
      passwordHash: passwordHash,
      isAdmin: true,
      isActive: true
    });

    console.log('Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Please change the password after first login.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();