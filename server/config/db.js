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

  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI is not configured. Add your MongoDB Atlas connection string to server/.env. Persistent storage is required.'
    );
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    await createDemoUsers();
  } catch (error) {
    console.error(`[MongoDB Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
