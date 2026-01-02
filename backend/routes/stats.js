const express = require('express');
const router = express.Router();
const { getSiteStats } = require('../controllers/statsController');

// Public route - herkes site istatistiklerini görebilir
router.get('/', getSiteStats);

module.exports = router;