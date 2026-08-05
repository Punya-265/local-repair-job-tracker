const Repair = require('../models/Repair');
const RepairHistory = require('../models/RepairHistory');
const User = require('../models/User');
const { generateRepairId } = require('../services/repairIdService');
const { sendNotificationEmail } = require('../services/emailService');
const { uploadImage } = require('../config/cloudinary');

// @desc    Create new repair job
// @route   POST /api/repairs
// @access  Private (Admin / Technician)
exports.createRepair = async (req, res, next) => {
  try {
    const {
      customer,
      device,
      reportedProblem,
      notes,
      assignedTechnician,
      priority,
      estimatedCost,
      estimatedCompletionDate,
    } = req.body;

    const repairId = await generateRepairId();

    const repair = await Repair.create({
      repairId,
      customer,
      device,
      reportedProblem,
      notes: notes || '',
      assignedTechnician: assignedTechnician || null,
      priority: priority || 'Medium',
      estimatedCost: estimatedCost || 0,
      finalCost: estimatedCost || 0,
      estimatedCompletionDate: estimatedCompletionDate || null,
      status: 'Received',
    });

    // Create initial history log
    await RepairHistory.create({
      repair: repair._id,
      previousStatus: '',
      newStatus: 'Received',
      changedBy: {
        name: req.user.name,
        role: req.user.role,
        userId: req.user._id,
      },
      note: 'Repair ticket created and device received in shop.',
    });

    // Send confirmation email to customer
    const trackingUrl = `${req.protocol}://${req.get('host')}/track/${repair.repairId}`;
    sendNotificationEmail({
      recipient: customer,
      repair,
      type: 'Repair Received',
      message: `Your device ${device.brand} ${device.model} has been received for repair. Tracking ID is ${repair.repairId}.`,
      trackingUrl,
    });

    res.status(201).json({
      success: true,
      repair,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all repairs with search, filter, and pagination
// @route   GET /api/repairs
// @access  Private (Admin / Technician)
exports.getRepairs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // If technician, filter by assigned technician if requested or default to assigned
    if (req.user.role === 'technician' && req.query.assignedToMe === 'true') {
      query.assignedTechnician = req.user._id;
    } else if (req.query.technician) {
      query.assignedTechnician = req.query.technician;
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Priority filter
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Device type filter
    if (req.query.deviceType) {
      query['device.type'] = req.query.deviceType;
    }

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { repairId: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.phone': searchRegex },
        { 'customer.email': searchRegex },
        { 'device.brand': searchRegex },
        { 'device.model': searchRegex },
        { 'device.serialNumber': searchRegex },
      ];
    }

    const total = await Repair.countDocuments(query);
    const repairs = await Repair.find(query)
      .populate('assignedTechnician', 'name email phone specialization')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: repairs.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      repairs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single repair by MongoDB ID
// @route   GET /api/repairs/:id
// @access  Private (Admin / Technician)
exports.getRepairById = async (req, res, next) => {
  try {
    const repair = await Repair.findById(req.params.id).populate(
      'assignedTechnician',
      'name email phone specialization'
    );

    if (!repair) {
      return res.status(404).json({ success: false, message: 'Repair job not found' });
    }

    const history = await RepairHistory.find({ repair: repair._id }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      repair,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public tracking repair info by repairId (e.g. REP-2026-00124)
// @route   GET /api/repairs/track/:repairId
// @access  Public (No Login Required)
exports.getPublicRepairByTrackingId = async (req, res, next) => {
  try {
    const repair = await Repair.findOne({ repairId: req.params.repairId.toUpperCase() }).populate(
      'assignedTechnician',
      'name specialization'
    );

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Repair Tracking ID. Please check your ticket number.',
      });
    }

    const history = await RepairHistory.find({ repair: repair._id }).sort({ timestamp: 1 });

    // Sanitized public object
    const publicData = {
      repairId: repair.repairId,
      customerName: repair.customer.name,
      device: {
        type: repair.device.type,
        brand: repair.device.brand,
        model: repair.device.model,
        color: repair.device.color,
      },
      reportedProblem: repair.reportedProblem,
      diagnosis: repair.diagnosis,
      status: repair.status,
      priority: repair.priority,
      estimatedCost: repair.estimatedCost,
      finalCost: repair.finalCost,
      amountPaid: repair.amountPaid,
      paymentStatus: repair.paymentStatus,
      estimatedCompletionDate: repair.estimatedCompletionDate,
      photos: repair.photos,
      customerDecision: repair.customerDecision,
      history: history.map((h) => ({
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        note: h.note,
        timestamp: h.timestamp,
        changedByName: h.changedBy ? h.changedBy.name : 'System',
      })),
      shopContact: {
        name: process.env.FROM_NAME || 'Local Repair Shop & Service Center',
        phone: '+91 98765 43210',
        email: process.env.FROM_EMAIL || 'service@repairshop.com',
        address: '123 Market Street, Main Town, Tech City',
        workingHours: 'Mon - Sat: 9:30 AM - 8:00 PM',
      },
    };

    res.status(200).json({
      success: true,
      repair: publicData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update repair status
// @route   PATCH /api/repairs/:id/status
// @access  Private (Admin / Technician)
exports.updateRepairStatus = async (req, res, next) => {
  try {
    const { status, note, estimatedCost, finalCost, estimatedCompletionDate, assignedTechnician } = req.body;

    const repair = await Repair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ success: false, message: 'Repair job not found' });
    }

    const previousStatus = repair.status;

    if (status) repair.status = status;
    if (estimatedCost !== undefined) repair.estimatedCost = estimatedCost;
    if (finalCost !== undefined) repair.finalCost = finalCost;
    if (estimatedCompletionDate) repair.estimatedCompletionDate = estimatedCompletionDate;
    if (assignedTechnician) repair.assignedTechnician = assignedTechnician;

    await repair.save();

    // Add History entry
    const historyEntry = await RepairHistory.create({
      repair: repair._id,
      previousStatus,
      newStatus: repair.status,
      changedBy: {
        name: req.user.name,
        role: req.user.role,
        userId: req.user._id,
      },
      note: note || `Status updated from ${previousStatus} to ${repair.status}`,
    });

    // Email notification logic based on status
    const trackingUrl = `${req.protocol}://${req.get('host')}/track/${repair.repairId}`;
    if (repair.status === 'Waiting for Approval') {
      sendNotificationEmail({
        recipient: repair.customer,
        repair,
        type: 'Approval Required',
        message: `Your device diagnosis is complete. An updated cost estimate of ₹${repair.finalCost || repair.estimatedCost} requires your approval.`,
        trackingUrl,
      });
    } else if (repair.status === 'Ready for Pickup') {
      sendNotificationEmail({
        recipient: repair.customer,
        repair,
        type: 'Ready for Pickup',
        message: `Great news! Your device ${repair.device.brand} ${repair.device.model} repair is completed and ready for pickup.`,
        trackingUrl,
      });
    }

    res.status(200).json({
      success: true,
      repair,
      historyEntry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update diagnosis and notes
// @route   POST /api/repairs/:id/diagnosis
// @access  Private (Admin / Technician)
exports.addDiagnosis = async (req, res, next) => {
  try {
    const { diagnosis, notes, estimatedCost, finalCost, status } = req.body;

    const repair = await Repair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ success: false, message: 'Repair job not found' });
    }

    if (diagnosis) repair.diagnosis = diagnosis;
    if (notes) repair.notes = notes;
    if (estimatedCost !== undefined) repair.estimatedCost = estimatedCost;
    if (finalCost !== undefined) repair.finalCost = finalCost;

    const oldStatus = repair.status;
    if (status && status !== oldStatus) {
      repair.status = status;
      await RepairHistory.create({
        repair: repair._id,
        previousStatus: oldStatus,
        newStatus: status,
        changedBy: {
          name: req.user.name,
          role: req.user.role,
          userId: req.user._id,
        },
        note: `Diagnosis updated: ${diagnosis || 'Updated repair diagnosis details'}`,
      });
    }

    await repair.save();

    res.status(200).json({
      success: true,
      repair,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer approve or reject repair cost estimate (Public endpoint)
// @route   POST /api/repairs/track/:repairId/decision
// @access  Public
exports.customerApproveReject = async (req, res, next) => {
  try {
    const { decision, note } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be Approved or Rejected' });
    }

    const repair = await Repair.findOne({ repairId: req.params.repairId.toUpperCase() });
    if (!repair) {
      return res.status(404).json({ success: false, message: 'Repair job not found' });
    }

    const previousStatus = repair.status;
    repair.customerDecision = {
      decision,
      timestamp: new Date(),
      note: note || '',
    };

    if (decision === 'Approved') {
      repair.status = 'Approved';
    } else {
      repair.status = 'Rejected';
    }

    await repair.save();

    // Log history
    await RepairHistory.create({
      repair: repair._id,
      previousStatus,
      newStatus: repair.status,
      changedBy: {
        name: `${repair.customer.name} (Customer)`,
        role: 'customer',
      },
      note: `Customer ${decision} the repair estimate of ₹${repair.finalCost || repair.estimatedCost}.${note ? ` Note: ${note}` : ''}`,
    });

    res.status(200).json({
      success: true,
      message: `Repair estimate ${decision.toLowerCase()} successfully`,
      repair,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload repair photos
// @route   POST /api/repairs/:id/photos
// @access  Private (Admin / Technician)
exports.uploadRepairPhotos = async (req, res, next) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ success: false, message: 'Repair job not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image file' });
    }

    const uploadedPhotos = [];

    for (const file of req.files) {
      const uploadResult = await uploadImage(file.path, 'repairs');
      uploadedPhotos.push({
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        caption: req.body.caption || 'Device condition photo',
        uploadedAt: new Date(),
      });
    }

    repair.photos.push(...uploadedPhotos);
    await repair.save();

    res.status(200).json({
      success: true,
      photos: repair.photos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record or update repair payment
// @route   POST /api/repairs/:id/payment
// @access  Private (Admin)
exports.recordPayment = async (req, res, next) => {
  try {
    const { amountPaid, paymentMethod, finalCost } = req.body;

    const repair = await Repair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ success: false, message: 'Repair job not found' });
    }

    if (finalCost !== undefined) {
      repair.finalCost = finalCost;
    }

    if (amountPaid !== undefined) {
      repair.amountPaid = (repair.amountPaid || 0) + Number(amountPaid);
    }

    if (paymentMethod) {
      repair.paymentMethod = paymentMethod;
    }

    const totalCost = repair.finalCost > 0 ? repair.finalCost : repair.estimatedCost;
    if (repair.amountPaid >= totalCost && totalCost > 0) {
      repair.paymentStatus = 'Paid';
    } else if (repair.amountPaid > 0) {
      repair.paymentStatus = 'Partially Paid';
    } else {
      repair.paymentStatus = 'Unpaid';
    }

    await repair.save();

    res.status(200).json({
      success: true,
      repair,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update entire repair details
// @route   PUT /api/repairs/:id
// @access  Private (Admin / Technician)
exports.updateRepair = async (req, res, next) => {
  try {
    const repair = await Repair.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!repair) {
      return res.status(404).json({ success: false, message: 'Repair job not found' });
    }

    res.status(200).json({
      success: true,
      repair,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete repair
// @route   DELETE /api/repairs/:id
// @access  Private (Admin)
exports.deleteRepair = async (req, res, next) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ success: false, message: 'Repair job not found' });
    }

    await repair.deleteOne();
    await RepairHistory.deleteMany({ repair: repair._id });

    res.status(200).json({
      success: true,
      message: 'Repair job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
