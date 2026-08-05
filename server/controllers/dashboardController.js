const Repair = require('../models/Repair');
const User = require('../models/User');

// @desc    Get Admin Dashboard Stats and Charts
// @route   GET /api/dashboard/stats
// @access  Private (Admin / Technician)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const now = new Date();

    // Metric counts
    const totalActiveRepairs = await Repair.countDocuments({
      status: { $nin: ['Completed', 'Cancelled', 'Rejected'] },
    });

    const repairsReceivedToday = await Repair.countDocuments({
      createdAt: { $gte: todayStart },
    });

    const diagnosingCount = await Repair.countDocuments({ status: 'Diagnosing' });
    const waitingForApprovalCount = await Repair.countDocuments({ status: 'Waiting for Approval' });
    const inProgressCount = await Repair.countDocuments({ status: 'Repairing' });
    const readyForPickupCount = await Repair.countDocuments({ status: 'Ready for Pickup' });
    const completedCount = await Repair.countDocuments({ status: 'Completed' });

    // Overdue repairs: completion date is past and not ready/completed
    const overdueCount = await Repair.countDocuments({
      estimatedCompletionDate: { $lt: now },
      status: { $nin: ['Ready for Pickup', 'Completed', 'Cancelled', 'Rejected'] },
    });

    // Total revenue (sum of amountPaid across all repairs)
    const revenueResult = await Repair.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$amountPaid' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Repairs by status chart data
    const statusDistributionRaw = await Repair.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const repairsByStatus = statusDistributionRaw.map((item) => ({
      name: item._id,
      count: item.count,
    }));

    // Repairs & Revenue over last 7 days chart data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyStatsRaw = await Repair.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          repairsCount: { $sum: 1 },
          revenue: { $sum: '$amountPaid' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format 7 day timeline
    const repairsOverTime = [];
    const revenueOverTime = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const found = dailyStatsRaw.find((item) => item._id === dateStr);
      repairsOverTime.push({
        date: dayLabel,
        count: found ? found.repairsCount : 0,
      });
      revenueOverTime.push({
        date: dayLabel,
        revenue: found ? found.revenue : 0,
      });
    }

    // Recent 5 active repairs for quick dashboard table
    const recentRepairs = await Repair.find()
      .populate('assignedTechnician', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalActiveRepairs,
        repairsReceivedToday,
        diagnosingCount,
        waitingForApprovalCount,
        inProgressCount,
        readyForPickupCount,
        completedCount,
        totalRevenue,
        overdueCount,
      },
      charts: {
        repairsByStatus,
        repairsOverTime,
        revenueOverTime,
      },
      recentRepairs,
    });
  } catch (error) {
    next(error);
  }
};
