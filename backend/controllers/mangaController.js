const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');

// @desc    Tüm mangaları getir
// @route   GET /api/manga
// @access  Public
exports.getAllManga = async (req, res, next) => {
  try {
    const { search, genre, status, sort, page = 1, limit = 12 } = req.query;

    // Filtre oluştur
    let filter = { isPublished: true };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (genre) {
      filter.genres = genre;
    }

    if (status) {
      filter.status = status;
    }

    // Sıralama
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { viewCount: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    // Pagination
    const skip = (page - 1) * limit;

    const manga = await Manga.find(filter)
      .populate('addedBy', 'username')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Manga.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: manga.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: manga
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Slug ile manga getir
// @route   GET /api/manga/:slug
// @access  Public
exports.getMangaBySlug = async (req, res, next) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.slug })
      .populate('addedBy', 'username avatar')
      .populate({
        path: 'chapterCount'
      });

    if (!manga) {
      return res.status(404).json({
        success: false,
        message: 'Manga bulunamadı'
      });
    }

    // Görüntülenme sayısını artır
    await manga.incrementViews();

    res.status(200).json({
      success: true,
      data: manga
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Yeni manga oluştur
// @route   POST /api/manga
// @access  Private (Moderator/Admin)
exports.createManga = async (req, res, next) => {
  try {
    // Kapak resmini ekle
    if (req.file) {
      req.body.coverImage = `/${req.file.path}`;
    }

    // Genres array'e çevir
    if (req.body['genres[]']) {
      req.body.genres = Array.isArray(req.body['genres[]']) 
        ? req.body['genres[]'] 
        : [req.body['genres[]']];
      delete req.body['genres[]'];
    }

    req.body.addedBy = req.user.id;

    const manga = await Manga.create(req.body);

    res.status(201).json({
      success: true,
      data: manga
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manga güncelle
// @route   PUT /api/manga/:slug
// @access  Private (Moderator/Admin)
exports.updateManga = async (req, res, next) => {
  try {
    let manga = await Manga.findOne({ slug: req.params.slug });

    if (!manga) {
      return res.status(404).json({
        success: false,
        message: 'Manga bulunamadı'
      });
    }

    // Yeni kapak resmi varsa ekle
    if (req.file) {
      req.body.coverImage = `/${req.file.path}`;
    }

    manga = await Manga.findByIdAndUpdate(manga._id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: manga
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manga sil
// @route   DELETE /api/manga/:slug
// @access  Private (Moderator/Admin)
exports.deleteManga = async (req, res, next) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.slug });

    if (!manga) {
      return res.status(404).json({
        success: false,
        message: 'Manga bulunamadı'
      });
    }

    // İlgili bölümleri de sil
    await Chapter.deleteMany({ manga: manga._id });

    await manga.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Manga başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mangaya ait bölümleri getir
// @route   GET /api/manga/:slug/chapters
// @access  Public
exports.getChaptersByManga = async (req, res, next) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.slug });

    if (!manga) {
      return res.status(404).json({
        success: false,
        message: 'Manga bulunamadı'
      });
    }

    const chapters = await Chapter.find({ 
      manga: manga._id,
      isPublished: true
    })
      .populate('uploadedBy', 'username')
      .sort({ chapterNumber: 1 });

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Slug ile bölüm getir
// @route   GET /api/manga/:mangaSlug/chapters/:chapterSlug
// @access  Public
exports.getChapterBySlug = async (req, res, next) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.mangaSlug });

    if (!manga) {
      return res.status(404).json({
        success: false,
        message: 'Manga bulunamadı'
      });
    }

    const chapter = await Chapter.findOne({
      manga: manga._id,
      slug: req.params.chapterSlug
    })
      .populate('manga', 'title slug coverImage')
      .populate('uploadedBy', 'username');

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Bölüm bulunamadı'
      });
    }

    // Görüntülenme sayısını artır
    await chapter.incrementViews();

    res.status(200).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Yeni bölüm oluştur
// @route   POST /api/manga/:slug/chapters
// @access  Private (Moderator/Admin)
exports.createChapter = async (req, res, next) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.slug });

    if (!manga) {
      return res.status(404).json({
        success: false,
        message: 'Manga bulunamadı'
      });
    }

    // Sayfa resimlerini ekle
    if (req.files && req.files.length > 0) {
      req.body.pages = req.files.map((file, index) => ({
        pageNumber: index + 1,
        imagePath: `/${file.path}`
      }));
    }

    req.body.manga = manga._id;
    req.body.uploadedBy = req.user.id;

    const chapter = await Chapter.create(req.body);

    res.status(201).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bölüm güncelle
// @route   PUT /api/manga/:mangaSlug/chapters/:chapterSlug
// @access  Private (Moderator/Admin)
exports.updateChapter = async (req, res, next) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.mangaSlug });

    if (!manga) {
      return res.status(404).json({
        success: false,
        message: 'Manga bulunamadı'
      });
    }

    let chapter = await Chapter.findOne({
      manga: manga._id,
      slug: req.params.chapterSlug
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Bölüm bulunamadı'
      });
    }

    chapter = await Chapter.findByIdAndUpdate(chapter._id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bölüm sil
// @route   DELETE /api/manga/:mangaSlug/chapters/:chapterSlug
// @access  Private (Moderator/Admin)
exports.deleteChapter = async (req, res, next) => {
  try {
    const manga = await Manga.findOne({ slug: req.params.mangaSlug });

    if (!manga) {
      return res.status(404).json({
        success: false,
        message: 'Manga bulunamadı'
      });
    }

    const chapter = await Chapter.findOne({
      manga: manga._id,
      slug: req.params.chapterSlug
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Bölüm bulunamadı'
      });
    }

    await chapter.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bölüm başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
};