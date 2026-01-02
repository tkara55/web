const jwt = require('jsonwebtoken');

// JWT token oluştur
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 gün geçerli
  );
};

// Token'ı cookie'ye kaydet ve response gönder
const sendTokenResponse = (user, statusCode, res) => {
  // Token oluştur
  const token = generateToken(user._id);

  // Cookie seçenekleri
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün
    httpOnly: true, // XSS koruması
    secure: process.env.NODE_ENV === 'production', // HTTPS'de çalış
    sameSite: 'strict' // CSRF koruması
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
};

// Token'ı doğrula
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  sendTokenResponse,
  verifyToken
};