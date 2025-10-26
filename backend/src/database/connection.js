const mongoose = require('mongoose');

let isConnected = false;

const connectToDatabase = async () => {
  try {
    if (isConnected) {
      console.log('MongoDB already connected');
      return;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('Connected to MongoDB successfully');
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const createIndexes = async () => {
  try {
    // User indexes

    await mongoose.connection.db.collection('users').createIndex({ city: 1 });
    await mongoose.connection.db.collection('users').createIndex({ isActive: 1 });
    
    // Question indexes
    await mongoose.connection.db.collection('questions').createIndex({ categoryId: 1 });
    await mongoose.connection.db.collection('questions').createIndex({ isActive: 1 });
    await mongoose.connection.db.collection('questions').createIndex({ difficultyLevel: 1 });
    
    // Quiz attempt indexes
    await mongoose.connection.db.collection('userquizattempts').createIndex({ userId: 1 });
    await mongoose.connection.db.collection('userquizattempts').createIndex({ quizId: 1 });
    await mongoose.connection.db.collection('userquizattempts').createIndex({ createdAt: -1 });
    
    // User answer indexes
    await mongoose.connection.db.collection('useranswers').createIndex({ attemptId: 1 });
    await mongoose.connection.db.collection('useranswers').createIndex({ questionId: 1 });
    
    // Notification indexes
    await mongoose.connection.db.collection('notifications').createIndex({ userId: 1 });
    await mongoose.connection.db.collection('notifications').createIndex({ isRead: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

const disconnectFromDatabase = async () => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  mongoose
};