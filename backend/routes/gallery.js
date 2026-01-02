const express = require('express');
const router = express.Router();
const {
  getAllGalleryImages,
  getGalleryImageById,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  toggleLike
} = require('../controllers/galleryController');
const { protect, optionalAuth } = require('../middleware/auth');
const { isModerator } = require('../middleware/admin');
const { uploadSingle, handleMulterError } = require('../middleware/upload');

router.route('/')
  .get(optionalAuth, getAllGalleryImages)
  .post(protect, isModerator, uploadSingle('galleryImage'), handleMulterError, uploadGalleryImage);

router.route('/:id')
  .get(optionalAuth, getGalleryImageById)
  .put(protect, isModerator, updateGalleryImage)
  .delete(protect, isModerator, deleteGalleryImage);

router.route('/:id/like')
  .post(protect, toggleLike);

module.exports = router;