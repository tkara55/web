const News = require('../models/News');

// @desc    Tüm haberleri getir
// @route   GET /api/news
// @access  Public
exports.getAllNews = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    let filter = { isPublished: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const news = await News.find(filter)
      .populate('author', 'username avatar')
      .sort({ isPinned: -1, publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Slug ile haber getir
// @route   GET /api/news/:slug
// @access  Public
exports.getNewsBySlug = async (req, res, next) => {
  try {
    const news = await News.findOne({ slug: req.params.slug })
      .populate('author', 'username avatar');

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }

    // Görüntülenme sayısını artır
    await news.incrementViews();

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Yeni haber oluştur
// @route   POST /api/news
// @access  Private (Moderator/Admin)
exports.createNews = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.coverImage = `/${req.file.path}`;
    }

    req.body.author = req.user.id;

    const news = await News.create(req.body);

    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Haber güncelle
// @route   PUT /api/news/:slug
// @access  Private (Moderator/Admin)
exports.updateNews = async (req, res, next) => {
  try {
    let news = await News.findOne({ slug: req.params.slug });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }

    if (req.file) {
      req.body.coverImage = `/${req.file.path}`;
    }

    news = await News.findByIdAndUpdate(news._id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Haber sil
// @route   DELETE /api/news/:slug
// @access  Private (Moderator/Admin)
exports.deleteNews = async (req, res, next) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }

    await news.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Haber başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
};