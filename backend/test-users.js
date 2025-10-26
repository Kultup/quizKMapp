const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp')
  .then(() => {
    console.log('Connected to MongoDB');
    return checkUsers();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function checkUsers() {
  try {
    // Import User model
    const User = require('./src/models/User');
    
    // Count total users
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    // Get first few users
    const users = await User.find().limit(5).select('firstName lastName email');
    console.log('Sample users:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user._id}`);
    });
    
    if (userCount === 0) {
      console.log('\n⚠️  No users found in database. You may need to register a user first.');
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}