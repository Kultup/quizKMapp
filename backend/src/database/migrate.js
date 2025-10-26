const { connectToDatabase } = require('./connection');

const migrate = async () => {
  try {
    console.log('Starting MongoDB connection...');
    await connectToDatabase();
    console.log('MongoDB connection completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
