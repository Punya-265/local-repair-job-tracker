const Repair = require('../models/Repair');

const generateRepairId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `REP-${currentYear}-`;

  // Find latest repair for this year
  const latestRepair = await Repair.findOne({
    repairId: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let nextSequence = 10001;

  if (latestRepair && latestRepair.repairId) {
    const parts = latestRepair.repairId.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const generatedId = `${prefix}${String(nextSequence).padStart(5, '0')}`;
  return generatedId;
};

module.exports = {
  generateRepairId,
};
