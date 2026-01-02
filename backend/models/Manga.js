const mongoose = require('mongoose');
const slugify = require('slugify');

const mangaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Manga başlığı gereklidir'],
        trim: true
    },

    // Slugify - URL dostu başlık (Kriter)
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },

    description: {
        type: String,
        required: [true, 'Açıklama gereklidir']
    },

    author: {
        type: String,
        required: true
    },

    artist: {
        type: String
    },

    coverImage: {
        type: String,
        required: true
    },

    genres: [{
        type: String,
        enum: ['Aksiyon', 'Macera', 'Komedi', 'Drama', 'Fantastik', 'Korku',
            'Romantik', 'Bilim Kurgu', 'Slice of Life', 'Spor', 'Gerilim']
    }],

    status: {
        type: String,
        enum: ['Devam Ediyor', 'Tamamlandı', 'Askıda'],
        default: 'Devam Ediyor'
    },

    releaseYear: {
        type: Number
    },

    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },

    viewCount: {
        type: Number,
        default: 0
    },

    // Kim ekledi
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Slug otomatik oluşturma (Slugify kriteri)
mangaSchema.pre('save', function () {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
            locale: 'tr'
        });
    }
});

// Virtual - Bölüm sayısını döndür
mangaSchema.virtual('chapterCount', {
    ref: 'Chapter',
    localField: '_id',
    foreignField: 'manga',
    count: true
});

// Görüntülenme sayısını artır
mangaSchema.methods.incrementViews = async function () {
    this.viewCount += 1;
    return await this.save();
};

module.exports = mongoose.model('Manga', mangaSchema);