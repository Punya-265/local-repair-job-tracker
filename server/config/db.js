const mongoose = require('mongoose');

const demoUsers = [
  {
    name: 'Rajesh Kumar (Shop Owner)',
    email: 'admin@repairshop.com',
    phone: '+91 98765 00001',
    password: 'admin123',
    role: 'admin',
    specialization: 'Shop Manager & Hardware Engineer',
  },
  {
    name: 'Alex Rivera',
    email: 'tech.alex@repairshop.com',
    phone: '+91 98765 00002',
    password: 'tech123',
    role: 'technician',
    specialization: 'Laptop Motherboard & BGA Repair',
  },
  {
    name: 'Samantha Lee',
    email: 'tech.sam@repairshop.com',
    phone: '+91 98765 00003',
    password: 'tech123',
    role: 'technician',
    specialization: 'Smartphone Screen & Micro-soldering',
  },
];

const createDemoUsers = async () => {
  const User = require('../models/User');
  for (const userData of demoUsers) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      await User.create(userData);
      console.log(`[Demo User Created]: ${userData.email}`);
    }
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  // Try the configured MongoDB first. This is the normal/persistent mode.
  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[MongoDB Connected]: ${conn.connection.host}`);
      await createDemoUsers();
      return;
    } catch (error) {
      console.warn(`[MongoDB Atlas unavailable]: ${error.message}`);
      console.warn('[Database Fallback]: Starting an in-memory MongoDB for local development...');
    }
  } else {
    console.warn('[MONGODB_URI missing]: Starting an in-memory MongoDB for local development...');
  }

  // Development fallback: lets the application run even when Atlas/IP access
  // is not configured. Data is temporary and is lost when the server stops.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MongoDB connection failed in production. Check MONGODB_URI and Atlas network access.');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    const conn = await mongoose.connect(memoryServer.getUri('repair_tracker'));
    console.log(`[MongoDB Memory Connected]: ${conn.connection.host}`);
    console.log('[WARNING]: Using temporary in-memory database. Data will be lost when the server stops.');
    await createDemoUsers();
  } catch (fallbackError) {
    throw new Error(`MongoDB connection failed and local fallback could not start: ${fallbackError.message}`);
  }
};

module.exports = connectDB;
