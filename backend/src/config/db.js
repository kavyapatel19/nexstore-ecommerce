const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kavya_ecommerce', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // If running in development without local mongo, log informative warning
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Warning: Make sure MongoDB service is running locally or specify valid MONGO_URI in .env');
    }
  }
};

module.exports = connectDB;

