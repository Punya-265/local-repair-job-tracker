const User = require('../models/User');
const Repair = require('../models/Repair');

exports.getUsers = async (req, res, next) => {
  try {
    // Admin staff screen must never accidentally include customers.
    const requestedRole = req.query.role;
    const roleFilter = requestedRole
      ? { role: requestedRole }
      : { role: { $in: ['admin', 'technician'] } };

    const users = await User.find(roleFilter).sort({ createdAt: -1 });
    const usersWithWorkload = await Promise.all(
      users.map(async (u) => {
        const activeJobsCount = await Repair.countDocuments({
          assignedTechnician: u._id,
          status: { $nin: ['Completed', 'Cancelled', 'Rejected'] },
        });
        const completedJobsCount = await Repair.countDocuments({
          assignedTechnician: u._id,
          status: 'Completed',
        });
        return {
          ...u.toObject(),
          activeJobsCount,
          completedJobsCount,
        };
      })
    );

    res.status(200).json({ success: true, users: usersWithWorkload });
  } catch (error) {
    next(error);
  }
};

// Admin staff creation intentionally creates technicians only.
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, specialization } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: 'technician',
      specialization: specialization || 'General Electronics Repair',
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        specialization: user.specialization,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, phone, specialization, role, active, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (role && !['admin', 'technician'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Staff role must be admin or technician' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (specialization) user.specialization = specialization;
    if (role) user.role = role;
    if (active !== undefined) user.active = Boolean(active);
    if (password) {
      if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      user.password = password;
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    next(error);
  }
};
