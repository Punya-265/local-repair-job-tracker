const User = require('../models/User');
const Repair = require('../models/Repair');

// @desc    Get all technicians/staff
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const roleFilter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(roleFilter).sort({ createdAt: -1 });

    // Attach active job count to each user
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

    res.status(200).json({
      success: true,
      users: usersWithWorkload,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new technician / staff user
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, specialization } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'technician',
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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, phone, specialization, role, active, password } = req.body;
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (specialization) fieldsToUpdate.specialization = specialization;
    if (role) fieldsToUpdate.role = role;
    if (active !== undefined) fieldsToUpdate.active = active;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (password) {
      user.password = password;
    }

    Object.assign(user, fieldsToUpdate);
    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
