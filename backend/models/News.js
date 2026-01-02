const mongoose = require('mongoose');
const slugify = require('slugify');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Haber başlığı gereklidir'],
    trim: true
  },

  // Slugify - URL dostu başlık
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },

  content: {
    type: String,
    required: [true, 'Haber içeriği gereklidir']
  },

  summary: {
    type: String,
    maxlength: 200
  },

  coverImage: {
    type: String
  },

  category: {
    type: String,
    enum: ['Duyuru', 'Haber', 'Güncelleme', 'Etkinlik', 'Genel'],
    default: 'Genel'
  },

  // Kim yazdı
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  viewCount: {
    type: Number,
    default: 0
  },

  isPinned: {
    type: Boolean,
    default: false
  },

  isPublished: {
    type: Boolean,
    default: true
  },

  publishDate: {
    type: Date,
    default: Date.now
  },

  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Slug otomatik oluşturma
// Slug otomatik oluşturma
newsSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      locale: 'tr'
    });
  }
});

// Görüntülenme sayısını artır
newsSchema.methods.incrementViews = async function () {
  this.viewCount += 1;
  return await this.save();
};

// Summary otomatik oluşturma
newsSchema.pre('save', function () {
  if (this.isModified('content') && !this.summary) {
    this.summary = this.content.substring(0, 197) + '...';
  }
});

module.exports = mongoose.model('News', newsSchema);