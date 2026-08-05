const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema(
  {
    repairId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
    },
    device: {
      type: {
        type: String,
        required: true,
        enum: ['Laptop', 'Mobile', 'Tablet', 'Desktop', 'Appliance', 'Audio', 'Other'],
        default: 'Laptop',
      },
      brand: { type: String, required: true, trim: true },
      model: { type: String, required: true, trim: true },
      serialNumber: { type: String, default: '', trim: true },
      color: { type: String, default: '', trim: true },
    },
    reportedProblem: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: [
        'Received',
        'Diagnosing',
        'Waiting for Approval',
        'Approved',
        'Repairing',
        'Ready for Pickup',
        'Completed',
        'Rejected',
        'Cancelled',
      ],
      default: 'Received',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid'],
      default: 'Unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Pending'],
      default: 'Pending',
    },
    estimatedCompletionDate: {
      type: Date,
      default: null,
    },
    photos: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: '' },
        caption: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    customerDecision: {
      decision: {
        type: String,
        enum: ['Approved', 'Rejected', 'Pending'],
        default: 'Pending',
      },
      timestamp: { type: Date, default: null },
      note: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for super-fast search
repairSchema.index({ 'customer.phone': 1 });
repairSchema.index({ 'customer.name': 1 });
repairSchema.index({ 'device.serialNumber': 1 });
repairSchema.index({ createdAt: -1 });

// Helper virtual for balance due
repairSchema.virtual('balanceDue').get(function () {
  const cost = this.finalCost > 0 ? this.finalCost : this.estimatedCost;
  return Math.max(0, cost - this.amountPaid);
});

repairSchema.set('toJSON', { virtuals: true });
repairSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Repair', repairSchema);
