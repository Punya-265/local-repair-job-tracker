const express = require('express');
const { body } = require('express-validator');
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

// Public customer tracking is read-only.
router.get('/track/:repairId', getPublicRepairByTrackingId);

// Customer decisions require an authenticated customer account.
router.post('/track/:repairId/decision', protect, authorize('customer'), customerApproveReject);

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
router.post('/:id/payment', authorize('admin'), recordPayment);

module.exports = router;
