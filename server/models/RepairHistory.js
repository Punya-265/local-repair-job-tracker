const mongoose = require('mongoose');

const repairHistorySchema = new mongoose.Schema(
  {
    repair: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repair',
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      default: '',
    },
    newStatus: {
      type: String,
      required: true,
    },
    changedBy: {
      name: { type: String, required: true, default: 'System' },
      role: { type: String, default: 'system' },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RepairHistory', repairHistorySchema);
