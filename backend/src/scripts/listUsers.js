const mongoose = require('mongoose');
const User = require('../models/User');
const Position = require('../models/Position');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  const users = await User.find({}).select('email firstName lastName city position isAdmin').populate('position');
  
  console.log('\n📋 Existing users:');
  users.forEach((u, index) => {
    console.log(`${index + 1}. ${u.email}`);
    console.log(`   Name: ${u.firstName} ${u.lastName}`);
    console.log(`   City: ${u.city || 'N/A'}`);
    console.log(`   Position: ${u.position ? u.position.name : 'N/A'}`);
    console.log(`   Admin: ${u.isAdmin ? 'Yes' : 'No'}`);
    console.log('');
  });
  
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
})
.catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

