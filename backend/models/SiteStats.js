const mongoose = require('mongoose');

const siteStatsSchema = new mongoose.Schema({
  // Benzersiz kayıt için (tek bir dokuman olacak)
  _id: {
    type: String,
    default: 'site-stats'
  },
  
  // Toplam ziyaretçi sayısı
  totalVisitors: {
    type: Number,
    default: 0
  },
  
  // Günlük ziyaretçi sayısı
  dailyVisitors: {
    type: Number,
    default: 0
  },
  
  // Son güncelleme tarihi (günlük sayacı sıfırlamak için)
  lastReset: {
    type: Date,
    default: Date.now
  },
  
  // Online kullanıcılar (session ID'leri)
  onlineUsers: [{
    sessionId: String,
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Sayfa görüntülenme sayısı
  pageViews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Online kullanıcı sayısını döndüren metod
siteStatsSchema.methods.getOnlineCount = function() {
  // Son 5 dakikada aktif olanları say
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.onlineUsers.filter(user => 
    user.lastActivity > fiveMinutesAgo
  ).length;
};

// Eski online kullanıcıları temizleyen metod
siteStatsSchema.methods.cleanInactiveUsers = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  this.onlineUsers = this.onlineUsers.filter(user => 
    user.lastActivity > fiveMinutesAgo
  );
};

module.exports = mongoose.model('SiteStats', siteStatsSchema);