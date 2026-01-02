const SiteStats = require('../models/SiteStats');

// Ziyaretçi ve online kullanıcı tracking
const trackVisitor = async (req, res, next) => {
  try {
    // Session ID al veya oluştur
    if (!req.session.visitorId) {
      req.session.visitorId = req.sessionID;
      req.session.isNewVisitor = true;
    }

    // SiteStats dokümanını bul veya oluştur
    let stats = await SiteStats.findById('site-stats');

    if (!stats) {
      stats = new SiteStats({ _id: 'site-stats' });
      await stats.save();
    }

    // Günlük sayacı sıfırlama (eğer yeni gün başladıysa)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (stats.lastReset < today) {
      stats.dailyVisitors = 0;
      stats.lastReset = today;
    }

    // Yeni ziyaretçiyse sayacı artır
    if (req.session.isNewVisitor) {
      stats.totalVisitors += 1;
      stats.dailyVisitors += 1;
      req.session.isNewVisitor = false;
    }

    // Sayfa görüntülenme sayısını artır
    stats.pageViews += 1;

    // Online kullanıcıyı güncelle veya ekle
    const userIndex = stats.onlineUsers.findIndex(
      u => u.sessionId === req.session.visitorId
    );

    if (userIndex > -1) {
      // Mevcut kullanıcının son aktivite zamanını güncelle
      stats.onlineUsers[userIndex].lastActivity = new Date();
    } else {
      // Yeni online kullanıcı ekle
      stats.onlineUsers.push({
        sessionId: req.session.visitorId,
        lastActivity: new Date()
      });
    }

    // Eski inactive kullanıcıları temizle
    stats.cleanInactiveUsers();

    // Veritabanına kaydet - version conflict'i göz ardı et
    try {
      await stats.save();
    } catch (saveError) {
      // Version error'ü sessizce geç
      if (saveError.name !== 'VersionError') {
        console.error('Stats save error:', saveError);
      }
    }

    // İstatistikleri request'e ekle (ihtiyaç olursa kullanmak için)
    req.siteStats = {
      totalVisitors: stats.totalVisitors,
      dailyVisitors: stats.dailyVisitors,
      onlineUsers: stats.getOnlineCount(),
      pageViews: stats.pageViews
    };

    next();
  } catch (error) {
    console.error('Visitor tracking hatası:', error);
    // Hata olsa bile devam et
    next();
  }
};

module.exports = { trackVisitor };