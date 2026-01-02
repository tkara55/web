const mongoose = require('mongoose');
const slugify = require('slugify');

const chapterSchema = new mongoose.Schema({
  manga: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manga',
    required: true
  },
  
  chapterNumber: {
    type: Number,
    required: [true, 'Bölüm numarası gereklidir']
  },
  
  title: {
    type: String,
    trim: true
  },
  
  // Slugify - URL dostu başlık
  slug: {
    type: String,
    lowercase: true
  },
  
  // Bölüm sayfaları (resim yolları)
  pages: [{
    pageNumber: Number,
    imagePath: String
  }],
  
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Kim ekledi
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isPublished: {
    type: Boolean,
    default: true
  },
  
  publishDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index - aynı mangada aynı bölüm numarası olmasın
chapterSchema.index({ manga: 1, chapterNumber: 1 }, { unique: true });

// Slug otomatik oluşturma
chapterSchema.pre('save', function() {
  if (this.isModified('title') && this.title) {
    this.slug = slugify(this.title, { 
      lower: true, 
      strict: true,
      locale: 'tr'
    });
  } else {
    this.slug = `bolum-${this.chapterNumber}`;
  }
});

// Görüntülenme sayısını artır
chapterSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  return await this.save();
};

module.exports = mongoose.model('Chapter', chapterSchema);