const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const AnalysisLog = require('../models/AnalysisLog');

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();
    const analysisCount = await AnalysisLog.countDocuments();

    res.status(200).json({
        users: userCount,
        analyses: analysisCount,
    });
});

module.exports = {
    getSystemStats,
};
