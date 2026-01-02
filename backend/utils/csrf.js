const csrf = require('csurf');

// CSRF koruması middleware'i
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// CSRF token'ı oluştur ve gönder
const generateCsrfToken = (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken()
  });
};

// CSRF hata yakalama
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Geçersiz CSRF token. Sayfayı yenileyip tekrar deneyin.'
    });
  }
  next(err);
};

module.exports = {
  csrfProtection,
  generateCsrfToken,
  csrfErrorHandler
};