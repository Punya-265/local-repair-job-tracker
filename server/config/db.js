const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  try {
    if (mongoUri) {
      const conn = await mongoose.connect(mongoUri);
      console.log(`[MongoDB Connected]: ${conn.connection.host}`);
      return;
    }

    console.log('[MongoDB]: No MONGODB_URI found. Starting temporary in-memory database...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const conn = await mongoose.connect(mongoServer.getUri());
    console.log(`[MongoDB Connected (Temporary)]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
