const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resim başlığı gereklidir'],
    trim: true
  },
  
  description: {
    type: String
  },
  
  imagePath: {
    type: String,
    required: [true, 'Resim yolu gereklidir']
  },
  
  // Resim hangi mangaya ait (opsiyonel)
  relatedManga: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manga'
  },
  
  category: {
    type: String,
    enum: ['Fan Art', 'Manga Kapak', 'Karakter', 'Wallpaper', 'Diğer'],
    default: 'Diğer'
  },
  
  // Kim yükledi
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  viewCount: {
    type: Number,
    default: 0
  },
  
  likes: {
    type: Number,
    default: 0
  },
  
  // Beğenenler
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  isPublished: {
    type: Boolean,
    default: true
  },
  
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Görüntülenme sayısını artır
gallerySchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  return await this.save();
};

// Beğeni ekle/kaldır
gallerySchema.methods.toggleLike = async function(userId) {
  const index = this.likedBy.indexOf(userId);
  
  if (index > -1) {
    // Beğeniyi kaldır
    this.likedBy.splice(index, 1);
    this.likes -= 1;
  } else {
    // Beğeni ekle
    this.likedBy.push(userId);
    this.likes += 1;
  }
  
  return await this.save();
};

module.exports = mongoose.model('Gallery', gallerySchema);