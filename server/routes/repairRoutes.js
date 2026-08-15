const express = require('express');
const { body } = require('express-validator');
const Repair = require('../models/Repair');
const {
  createRepair,
  getRepairs,
  getRepairById,
  getPublicRepairByTrackingId,
  updateRepairStatus,
  addDiagnosis,
  customerApproveReject,
  uploadRepairPhotos,
  recordPayment,
  updateRepair,
  deleteRepair,
} = require('../controllers/repairController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();
router.get('/track/:repairId', getPublicRepairByTrackingId);

const verifyCustomerOwnsRepair = async (req, res, next) => {
  try {
    const repair = await Repair.findOne({ repairId: req.params.repairId.toUpperCase() }).select('customer status');
    if (!repair) return res.status(404).json({ success: false, message: 'Repair job not found' });
    if (repair.customer.email !== req.user.email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to decide on this repair' });
    }
    if (repair.status !== 'Waiting for Approval') {
      return res.status(409).json({ success: false, message: 'This repair is not currently waiting for approval' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.post('/track/:repairId/decision', protect, authorize('customer'), verifyCustomerOwnsRepair, customerApproveReject);
router.use(protect);

router
  .route('/')
  .post(
    authorize('admin', 'technician'),
    [
      body('customer.name').trim().notEmpty().withMessage('Customer name is required'),
      body('customer.phone').trim().notEmpty().withMessage('Customer phone is required'),
      body('customer.email').isEmail().withMessage('Valid customer email is required'),
      body('device.type').notEmpty().withMessage('Device type is required'),
      body('device.brand').trim().notEmpty().withMessage('Device brand is required'),
      body('device.model').trim().notEmpty().withMessage('Device model is required'),
      body('reportedProblem').trim().notEmpty().withMessage('Reported problem description is required'),
      validate,
    ],
    createRepair
  )
  .get(authorize('admin', 'technician'), getRepairs);

router
  .route('/:id')
  .get(authorize('admin', 'technician'), getRepairById)
  .put(authorize('admin', 'technician'), updateRepair)
  .delete(authorize('admin'), deleteRepair);

router.patch('/:id/status', authorize('admin', 'technician'), updateRepairStatus);
router.post('/:id/diagnosis', authorize('admin', 'technician'), addDiagnosis);
router.post('/:id/photos', authorize('admin', 'technician'), upload.array('photos', 5), uploadRepairPhotos);
router.post(
  '/:id/payment',
  authorize('admin'),
  [
    body('amountPaid').optional().isFloat({ min: 0 }).withMessage('Payment amount must be zero or greater'),
    body('finalCost').optional().isFloat({ min: 0 }).withMessage('Final cost must be zero or greater'),
    body('paymentMethod').optional().isIn(['Cash', 'UPI', 'Card', 'Bank Transfer', 'Pending']).withMessage('Invalid payment method'),
    validate,
  ],
  recordPayment
);

module.exports = router;
