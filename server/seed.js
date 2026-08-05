const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Repair = require('./models/Repair');
const RepairHistory = require('./models/RepairHistory');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeding]: Cleaning existing database collections...');
    await User.deleteMany({});
    await Repair.deleteMany({});
    await RepairHistory.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seeding]: Creating Admin & Technician users...');
    const admin = await User.create({
      name: 'Rajesh Kumar (Shop Owner)',
      email: 'admin@repairshop.com',
      phone: '+91 98765 00001',
      password: 'admin123',
      role: 'admin',
      specialization: 'Shop Manager & Hardware Engineer',
    });

    const techAlex = await User.create({
      name: 'Alex Rivera',
      email: 'tech.alex@repairshop.com',
      phone: '+91 98765 00002',
      password: 'tech123',
      role: 'technician',
      specialization: 'Laptop Motherboard & BGA Repair',
    });

    const techSam = await User.create({
      name: 'Samantha Lee',
      email: 'tech.sam@repairshop.com',
      phone: '+91 98765 00003',
      password: 'tech123',
      role: 'technician',
      specialization: 'Smartphone Screen & Micro-soldering',
    });

    console.log('[Seeding]: Creating sample Repair Jobs with histories...');

    const sampleRepairs = [
      {
        repairId: 'REP-2026-00101',
        customer: {
          name: 'Aarav Sharma',
          phone: '+91 99887 76655',
          email: 'aarav.sharma@example.com',
        },
        device: {
          type: 'Laptop',
          brand: 'Dell',
          model: 'XPS 15 9520',
          serialNumber: 'DLXPS-9520-2024X',
          color: 'Silver Grey',
        },
        reportedProblem: 'Laptop overheating, fan making loud rattling noise, and random thermal shutdowns during video editing.',
        diagnosis: 'CPU/GPU thermal paste dried out completely. Dust buildup clogging cooling fins. Exhaust fan bearing defective.',
        assignedTechnician: techAlex._id,
        status: 'Waiting for Approval',
        priority: 'High',
        estimatedCost: 1500,
        finalCost: 2800,
        amountPaid: 500,
        paymentStatus: 'Partially Paid',
        paymentMethod: 'UPI',
        estimatedCompletionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
            public_id: 'seed_photo_1',
            caption: 'Dust blockage in heat sink assemble',
            uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        ],
        history: [
          { status: 'Received', note: 'Device received at front counter.' },
          { status: 'Diagnosing', note: 'Technician opened chassis and disassembled heat sink.' },
          { status: 'Waiting for Approval', note: 'Additional cost required for replacement silent cooling fan.' },
        ],
      },
      {
        repairId: 'REP-2026-00102',
        customer: {
          name: 'Priya Patel',
          phone: '+91 98761 23456',
          email: 'priya.patel@example.com',
        },
        device: {
          type: 'Mobile',
          brand: 'Apple',
          model: 'iPhone 13 Pro',
          serialNumber: 'DN6FX102N601',
          color: 'Sierra Blue',
        },
        reportedProblem: 'Cracked front OLED screen and glass back cover after dropping on concrete. Touch digitizer partially unresponsive.',
        diagnosis: 'OLED panel shattered. Original Apple screen assembly replacement needed. Battery health 89%.',
        assignedTechnician: techSam._id,
        status: 'Repairing',
        priority: 'Urgent',
        estimatedCost: 8500,
        finalCost: 8500,
        amountPaid: 8500,
        paymentStatus: 'Paid',
        paymentMethod: 'Card',
        customerDecision: { decision: 'Approved', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
        estimatedCompletionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
            public_id: 'seed_photo_2',
            caption: 'Shattered front screen panel',
            uploadedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
          },
        ],
        history: [
          { status: 'Received', note: 'Ticket created with cracked screen deposit.' },
          { status: 'Diagnosing', note: 'Inspected internal display flex cables.' },
          { status: 'Waiting for Approval', note: 'Sent screen replacement quote ₹8500.' },
          { status: 'Approved', note: 'Customer approved repair on tracking link.' },
          { status: 'Repairing', note: 'New original OLED display installed, testing TrueTone sensor.' },
        ],
      },
      {
        repairId: 'REP-2026-00103',
        customer: {
          name: 'Rohan Verma',
          phone: '+91 91234 56789',
          email: 'rohan.verma@example.com',
        },
        device: {
          type: 'Laptop',
          brand: 'Lenovo',
          model: 'ThinkPad T14 Gen 2',
          serialNumber: 'PF2K89001',
          color: 'Matte Black',
        },
        reportedProblem: 'Keyboard liquid spill (coffee). Spacebar and ENTER keys sticking, non-functional key row (ASDF).',
        diagnosis: 'Liquid ingress underneath keyboard membrane. Corrosion on ribbon cable connector.',
        assignedTechnician: techAlex._id,
        status: 'Ready for Pickup',
        priority: 'Medium',
        estimatedCost: 2200,
        finalCost: 2200,
        amountPaid: 2200,
        paymentStatus: 'Paid',
        paymentMethod: 'UPI',
        customerDecision: { decision: 'Approved', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        estimatedCompletionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
            public_id: 'seed_photo_3',
            caption: 'Replaced backlit spill-resistant keyboard assembly',
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
        history: [
          { status: 'Received', note: 'Laptop received.' },
          { status: 'Diagnosing', note: 'Ultrasonic cleaning of liquid residue on motherboard.' },
          { status: 'Waiting for Approval', note: 'Quoted OEM keyboard unit.' },
          { status: 'Approved', note: 'Customer approved estimate.' },
          { status: 'Repairing', note: 'Swapped keyboard assembly and stress tested.' },
          { status: 'Ready for Pickup', note: 'Passed post-repair diagnostic QA test.' },
        ],
      },
      {
        repairId: 'REP-2026-00104',
        customer: {
          name: 'Neha Kapoor',
          phone: '+91 97654 32109',
          email: 'neha.kapoor@example.com',
        },
        device: {
          type: 'Tablet',
          brand: 'Samsung',
          model: 'Galaxy Tab S8',
          serialNumber: 'SM-X700-44129',
          color: 'Graphite',
        },
        reportedProblem: 'Device will not charge or turn on. USB-C port feels loose and wobbly when cable inserted.',
        diagnosis: 'Broken USB-C charging port pins due to physical strain.',
        assignedTechnician: techSam._id,
        status: 'Completed',
        priority: 'Low',
        estimatedCost: 1200,
        finalCost: 1200,
        amountPaid: 1200,
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        customerDecision: { decision: 'Approved', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000) },
        estimatedCompletionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        photos: [],
        history: [
          { status: 'Received', note: 'Tablet received.' },
          { status: 'Diagnosing', note: 'Microscope check confirmed broken connector pins.' },
          { status: 'Approved', note: 'Approved verbally at counter.' },
          { status: 'Repairing', note: 'Micro-soldered new Type-C port connector.' },
          { status: 'Ready for Pickup', note: 'Notified customer.' },
          { status: 'Completed', note: 'Customer picked up tablet and settled invoice in full.' },
        ],
      },
      {
        repairId: 'REP-2026-00105',
        customer: {
          name: 'Vikram Singh',
          phone: '+91 94567 89012',
          email: 'vikram.singh@example.com',
        },
        device: {
          type: 'Desktop',
          brand: 'Custom Gaming PC',
          model: 'Intel i7-13700K / RTX 4070',
          serialNumber: 'RIG-2023-CUSTOM-99',
          color: 'Black RGB',
        },
        reportedProblem: 'Blue Screen of Death (BSOD) continuously on Windows boot up. Memory management error code.',
        diagnosis: 'Diagnosing RAM modules in slot 2 and slot 4.',
        assignedTechnician: techAlex._id,
        status: 'Diagnosing',
        priority: 'High',
        estimatedCost: 800,
        finalCost: 800,
        amountPaid: 0,
        paymentStatus: 'Unpaid',
        estimatedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        photos: [],
        history: [
          { status: 'Received', note: 'Desktop tower received at workbench.' },
          { status: 'Diagnosing', note: 'Running MemTest86 diagnostic suite.' },
        ],
      },
    ];

    for (const rData of sampleRepairs) {
      const historyList = rData.history;
      delete rData.history;

      const repairDoc = await Repair.create(rData);

      for (const h of historyList) {
        await RepairHistory.create({
          repair: repairDoc._id,
          previousStatus: h.previousStatus || '',
          newStatus: h.status,
          changedBy: {
            name: techAlex.name,
            role: 'technician',
            userId: techAlex._id,
          },
          note: h.note,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)),
        });
      }
    }

    console.log('=======================================================');
    console.log('[Database Seeding Complete Successfully!]');
    console.log('=======================================================');
    console.log('Default Login Credentials:');
    console.log('  👑 Admin:       admin@repairshop.com / admin123');
    console.log('  🔧 Technician 1: tech.alex@repairshop.com / tech123');
    console.log('  🔧 Technician 2: tech.sam@repairshop.com / tech123');
    console.log('  🔍 Customer Sample Tracking ID: REP-2026-00101');
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
