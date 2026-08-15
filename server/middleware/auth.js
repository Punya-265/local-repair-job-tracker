const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Add JWT_SECRET to server/.env.');
  }
  return process.env.JWT_SECRET;
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Token missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (!req.user.active) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated.',
      });
    }

    next();
  } catch (err) {
    if (err.message.includes('JWT_SECRET')) {
      return res.status(500).json({ success: false, message: err.message });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Invalid or expired token.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to perform this action`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
