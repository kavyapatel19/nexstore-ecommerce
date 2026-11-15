const mongoose = require('mongoose');
const memoryStore = require('./memoryStore');

// Disable command buffering so Mongoose never hangs when disconnected
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kavya_ecommerce';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    memoryStore.isMemoryMode = false;
  } catch (error) {
    memoryStore.isMemoryMode = true;
    console.log(`---------------------------------------------------------------------`);
    console.log(`[Database Notice]: No active local MongoDB server detected on port 27017.`);
    console.log(`[In-Memory Store]: Activated automatic embedded database fallback!`);
    console.log(`[Status]: All Auth, RBAC, Catalog, Cart, and Orders will run in-memory.`);
    console.log(`[Tip]: To persist to real MongoDB, provide a valid MONGO_URI in .env.`);
    console.log(`---------------------------------------------------------------------`);
  }
};

module.exports = connectDB;
