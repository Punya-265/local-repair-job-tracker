const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const mongoose = require('mongoose');
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

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production') {
    try {
      const url = new URL(origin);
      return (
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
        (url.protocol === 'http:' || url.protocol === 'https:')
      );
    } catch {
      return false;
    }
  }
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed'));
  },
  credentials: true,
}));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// The server starts listening immediately. Database initialization can take
// time (especially when the development in-memory MongoDB binary is starting),
// so API requests wait for the database instead of failing with ECONNREFUSED.
let databaseReady = false;
let databaseError = null;
const databaseReadyPromise = connectDB()
  .then(() => {
    databaseReady = true;
    console.log('[Database Ready]: API requests can now use the database.');
  })
  .catch((error) => {
    databaseError = error;
    console.error(`[Database Startup Error]: ${error.message}`);
  });

app.get('/api/health', (req, res) => {
  let database = 'starting';
  if (mongoose.connection.readyState === 1) database = 'connected';
  else if (databaseError) database = 'error';

  res.status(200).json({
    status: 'online',
    database,
    message: databaseError
      ? `Database unavailable: ${databaseError.message}`
      : database === 'starting'
        ? 'API is online; database is still starting.'
        : 'Local Repair Job Tracker API Service Running',
    timestamp: new Date(),
  });
});

// Hold database-dependent API requests until MongoDB is ready. This makes
// startup reliable even if the in-memory development database takes time to boot.
app.use('/api', async (req, res, next) => {
  try {
    await databaseReadyPromise;
    if (databaseReady) return next();
    return res.status(503).json({
      success: false,
      message: databaseError?.message || 'Database is still starting. Please try again shortly.',
    });
  } catch (error) {
    return next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: `API Route Not Found - ${req.originalUrl}` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log('=======================================================');
    console.log(`[Repair Tracker Server running in ${process.env.NODE_ENV || 'development'} mode]`);
    console.log(`[Listening on Port]: http://localhost:${PORT}`);
    console.log('[Database Status]: Starting in the background...');
    console.log('=======================================================');
  });
};

process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});

startServer();

module.exports = app;
