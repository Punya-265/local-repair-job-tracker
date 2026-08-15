const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const repairRoutes = require('./routes/repairRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed'));
  },
  credentials: true,
}));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/api/health', (req, res) => res.status(200).json({
  status: 'online',
  database: 'connected',
  message: 'Local Repair Job Tracker API Service Running',
  timestamp: new Date(),
}));

app.use('/api/auth', authRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: `API Route Not Found - ${req.originalUrl}` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log('=======================================================');
    console.log(`[Repair Tracker Server running in ${process.env.NODE_ENV || 'development'} mode]`);
    console.log(`[Listening on Port]: http://localhost:${PORT}`);
    console.log('=======================================================');
  });
};

startServer().catch((error) => {
  console.error(`[Server Startup Error]: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => console.error(`[Unhandled Rejection]: ${err.message}`));
module.exports = app;
