const Gallery = require('../models/Gallery');

// @desc    Tüm galeri resimlerini getir
// @route   GET /api/gallery
// @access  Public
exports.getAllGalleryImages = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    let filter = { isPublished: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const images = await Gallery.find(filter)
      .populate('uploadedBy', 'username avatar')
      .populate('relatedManga', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Gallery.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: images.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: images
    });
  } catch (error) {
    next(error);
  }
};

// @desc    ID ile galeri resmi getir
// @route   GET /api/gallery/:id
// @access  Public
exports.getGalleryImageById = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id)
      .populate('uploadedBy', 'username avatar')
      .populate('relatedManga', 'title slug');

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    // Görüntülenme sayısını artır
    await image.incrementViews();

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Galeriye resim yükle
// @route   POST /api/gallery
// @access  Private (Moderator/Admin)
exports.uploadGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resim dosyası gereklidir'
      });
    }

    req.body.imagePath = `/${req.file.path}`;
    req.body.uploadedBy = req.user.id;

    const image = await Gallery.create(req.body);

    res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Galeri resmi güncelle
// @route   PUT /api/gallery/:id
// @access  Private (Moderator/Admin)
exports.updateGalleryImage = async (req, res, next) => {
  try {
    let image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    image = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Galeri resmi sil
// @route   DELETE /api/gallery/:id
// @access  Private (Moderator/Admin)
exports.deleteGalleryImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    await image.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resim başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resmi beğen/beğenmekten vazgeç
// @route   POST /api/gallery/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    await image.toggleLike(req.user.id);

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
};