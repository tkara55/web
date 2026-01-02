const SiteStats = require('../models/SiteStats');

// @desc    Site istatistiklerini getir
// @route   GET /api/stats
// @access  Public
exports.getSiteStats = async (req, res, next) => {
  try {
    let stats = await SiteStats.findById('site-stats');

    if (!stats) {
      stats = new SiteStats({ _id: 'site-stats' });
      await stats.save();
    }

    // Eski inactive kullanıcıları temizle
    stats.cleanInactiveUsers();
    await stats.save();

    res.status(200).json({
      success: true,
      data: {
        totalVisitors: stats.totalVisitors,
        dailyVisitors: stats.dailyVisitors,
        onlineUsers: stats.getOnlineCount(),
        pageViews: stats.pageViews,
        lastReset: stats.lastReset
      }
    });
  } catch (error) {
    next(error);
  }
};