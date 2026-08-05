const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
    },
    repair: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repair',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'Repair Received',
        'Diagnosis Completed',
        'Approval Required',
        'Repair Approved',
        'Ready for Pickup',
        'Repair Completed',
        'Custom Notification',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'mocked'],
      default: 'sent',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
