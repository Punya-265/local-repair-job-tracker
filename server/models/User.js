const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please add a name'], trim: true },
    email: { type: String, required: [true, 'Please add an email'], unique: true, lowercase: true, trim: true, match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'] },
    phone: { type: String, required: [true, 'Please add a phone number'], trim: true },
    password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'technician', 'customer'], default: 'customer' },
    specialization: { type: String, default: 'General Hardware & Electronics' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  // For local development, allow the project to run without requiring the
  // student to configure a secret before testing the application. Production
  // still requires an explicit JWT_SECRET.
  const secret = process.env.JWT_SECRET || (
    process.env.NODE_ENV !== 'production'
      ? 'local-development-jwt-secret-change-for-production'
      : null
  );

  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Add JWT_SECRET to server/.env.');
  }

  return jwt.sign(
    { id: this._id, role: this.role, email: this.email, name: this.name },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = mongoose.model('User', userSchema);
