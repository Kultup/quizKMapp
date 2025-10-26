const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./src/models/User');

async function createUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp');
        console.log('Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ email: 'gorodok048@gmail.com' });
        if (existingUser) {
            console.log('User already exists, updating password...');
            
            // Hash the new password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash('Qa123456', saltRounds);
            
            // Update the user's password
            await User.findByIdAndUpdate(existingUser._id, {
                passwordHash: hashedPassword
            });
            
            console.log('✅ User password updated successfully!');
        } else {
            // Create new user
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash('Qa123456', saltRounds);

            const user = await User.create({
                firstName: 'Тестовий',
                lastName: 'Користувач',
                city: 'Київ',
                position: 'Тестер',
                email: 'gorodok048@gmail.com',
                passwordHash: hashedPassword,
                isActive: true,
                isAdmin: false,
                totalScore: 0,
                testsCompleted: 0,
                registrationDate: new Date(),
                lastLogin: null
            });

            console.log('✅ User created successfully!');
            console.log('📧 Email:', user.email);
            console.log('🔑 Password: Qa123456');
        }

    } catch (error) {
        console.error('❌ Error creating user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
createUser();