const express = require('express');
const router = express.Router();
const {
  getAllNews,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');
const { protect, optionalAuth } = require('../middleware/auth');
const { isModerator } = require('../middleware/admin');
const { uploadSingle, handleMulterError } = require('../middleware/upload');

router.route('/')
  .get(optionalAuth, getAllNews)
  .post(protect, isModerator, uploadSingle('newsImage'), handleMulterError, createNews);

router.route('/:slug')
  .get(optionalAuth, getNewsBySlug)
  .put(protect, isModerator, uploadSingle('newsImage'), handleMulterError, updateNews)
  .delete(protect, isModerator, deleteNews);

module.exports = router;