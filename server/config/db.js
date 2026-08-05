const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning]: Local MongoDB connection failed (${error.message}).`);
    console.log(`[MongoDB Fallback]: Starting embedded MongoMemoryServer for instant zero-setup execution...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`[MongoDB Connected (In-Memory)]: ${conn.connection.host}`);
    } catch (memErr) {
      console.error(`[MongoDB Error]: Memory server failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
