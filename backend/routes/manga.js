const express = require('express');
const router = express.Router();
const {
  getAllManga,
  getMangaBySlug,
  createManga,
  updateManga,
  deleteManga,
  getChaptersByManga,
  getChapterBySlug,
  createChapter,
  updateChapter,
  deleteChapter
} = require('../controllers/mangaController.js');
const { protect, optionalAuth } = require('../middleware/auth');
const { isModerator } = require('../middleware/admin');
const { uploadSingle, uploadMultiple, handleMulterError } = require('../middleware/upload');

// Manga routes
router.route('/')
  .get(optionalAuth, getAllManga)
  .post(protect, isModerator, uploadSingle('coverImage'), handleMulterError, createManga);

router.route('/:slug')
  .get(optionalAuth, getMangaBySlug)
  .put(protect, isModerator, uploadSingle('coverImage'), handleMulterError, updateManga)
  .delete(protect, isModerator, deleteManga);

// Chapter routes
router.route('/:slug/chapters')
  .get(optionalAuth, getChaptersByManga)
  .post(protect, isModerator, uploadMultiple('pages', 100), handleMulterError, createChapter);

router.route('/:mangaSlug/chapters/:chapterSlug')
  .get(optionalAuth, getChapterBySlug)
  .put(protect, isModerator, updateChapter)
  .delete(protect, isModerator, deleteChapter);

module.exports = router;