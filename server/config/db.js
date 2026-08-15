const mongoose = require('mongoose');

let mongoServer = null;

const createDemoUsers = async () => {
  const User = require('../models/User');
  const existingUser = await User.findOne({ email: 'admin@repairshop.com' });

  if (existingUser) return;

  await User.create([
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
  ]);

  console.log('[Demo Users Created]');
  console.log('Admin: admin@repairshop.com / admin123');
  console.log('Technician: tech.alex@repairshop.com / tech123');
};

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
    mongoServer = await MongoMemoryServer.create();
    const conn = await mongoose.connect(mongoServer.getUri());
    console.log(`[MongoDB Connected (Temporary)]: ${conn.connection.host}`);

    await createDemoUsers();
  } catch (error) {
    console.error(`[MongoDB Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
