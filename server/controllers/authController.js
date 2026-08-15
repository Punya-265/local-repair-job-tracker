const User = require('../models/User');

// Register a customer
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email: normalizedEmail, phone, password, role: 'customer' });
    const token = user.getSignedJwtToken();
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    if (!user.active) return res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact shop admin.' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, specialization: user.specialization } });
  } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
  try { const user = await User.findById(req.user.id); res.status(200).json({ success: true, user }); } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, specialization } = req.body;
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (specialization) fieldsToUpdate.specialization = specialization;
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};
