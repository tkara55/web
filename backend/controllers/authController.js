const User = require('../models/User');
const { sendTokenResponse } = require('../utils/jwt');

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Bu kullanıcı adı veya email zaten kullanılıyor'
            });
        }

        const user = await User.create({
            username,
            email,
            password
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Sunucu hatası'
        });
    }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email ve şifre gereklidir'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }

        // isActive kontrolü ekle
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.'
            });
        }

        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Sunucu hatası'
        });
    }
};

// @desc    Kullanıcı çıkışı
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Başarıyla çıkış yapıldı'
    });
};

// @desc    Mevcut kullanıcıyı getir
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};

// @desc    Profil güncelle
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;

        const fieldsToUpdate = {};
        if (username) fieldsToUpdate.username = username;
        if (email) fieldsToUpdate.email = email;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Sunucu hatası'
        });
    }
};

// @desc    Şifre güncelle
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mevcut şifre yanlış'
            });
        }

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Sunucu hatası'
        });
    }
};