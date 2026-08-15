const Repair = require('../models/Repair');
const RepairHistory = require('../models/RepairHistory');
const { generateRepairId } = require('../services/repairIdService');

exports.createCustomerRepair = async (req, res, next) => {
  try {
    const { device, reportedProblem, notes } = req.body;
    if (!device?.type || !device?.brand || !device?.model || !reportedProblem) {
      return res.status(400).json({ success: false, message: 'Device type, brand, model and problem are required' });
    }
    const repairId = await generateRepairId();
    const repair = await Repair.create({
      repairId,
      customer: { name: req.user.name, phone: req.user.phone, email: req.user.email },
      device,
      reportedProblem,
      notes: notes || '',
      status: 'Received',
      priority: 'Medium',
    });
    await RepairHistory.create({
      repair: repair._id,
      previousStatus: '',
      newStatus: 'Received',
      changedBy: { name: req.user.name, role: 'customer', userId: req.user._id },
      note: 'Repair request submitted by customer.',
    });
    res.status(201).json({ success: true, repair });
  } catch (error) { next(error); }
};

exports.getMyRepairs = async (req, res, next) => {
  try {
    const repairs = await Repair.find({ 'customer.email': req.user.email.toLowerCase() })
      .populate('assignedTechnician', 'name specialization')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, repairs });
  } catch (error) { next(error); }
};
