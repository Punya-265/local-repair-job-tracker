const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createCustomerRepair, getMyRepairs } = require('../controllers/customerController');

const router = express.Router();
router.use(protect, authorize('customer'));
router.get('/repairs', getMyRepairs);
router.post('/repairs', createCustomerRepair);

module.exports = router;
