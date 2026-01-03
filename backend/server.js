const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');

// Config
dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session yapılandırması (online kullanıcı sayısı için)
app.use(session({
  secret: process.env.SESSION_SECRET || 'manga-site-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // production'da true olmalı
    maxAge: 24 * 60 * 60 * 1000 // 24 saat
  }
}));

// Static dosyalar (resim galerisi için)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/manga-site')
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

// Ziyaretçi tracking middleware
const { trackVisitor } = require('./middleware/visitor');
app.use(trackVisitor);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/manga', require('./routes/manga'));
app.use('/api/news', require('./routes/news'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/admin', require('./routes/admin'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Manga Site API çalışıyor!',
    stats: req.siteStats
  });
});

// 404 handler
const { notFound } = require('./utils/errorHandler');
app.use(notFound);

// Error handling middleware
const { errorHandler } = require('./utils/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});