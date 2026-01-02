// Global hata yakalama middleware'i
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log hatası (development için)
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Mongoose duplicate key hatası
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Bu ${field} zaten kullanılıyor`;
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose validation hatası
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose cast hatası (geçersiz ObjectId)
  if (err.name === 'CastError') {
    const message = 'Geçersiz ID formatı';
    error = {
      message,
      statusCode: 400
    };
  }

  // JWT hatası
  if (err.name === 'JsonWebTokenError') {
    const message = 'Geçersiz token';
    error = {
      message,
      statusCode: 401
    };
  }

  // JWT süresi dolmuş
  if (err.name === 'TokenExpiredError') {
    const message = 'Token süresi dolmuş';
    error = {
      message,
      statusCode: 401
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Sunucu hatası',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 hatası
const notFound = (req, res, next) => {
  const error = new Error(`Bulunamadı - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };