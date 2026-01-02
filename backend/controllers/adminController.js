const User = require('../models/User');
const Manga = require('../models/Manga');
const Chapter = require('../models/Chapter');
const News = require('../models/News');
const Gallery = require('../models/Gallery');
const SiteStats = require('../models/SiteStats');

// @desc    Dashboard istatistiklerini getir
// @route   GET /api/admin/dashboard
// @access  Private (Moderator/Admin)
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalManga,
            totalChapters,
            totalNews,
            totalGallery,
            siteStats,
            recentUsers,
            popularManga
        ] = await Promise.all([
            User.countDocuments(),
            Manga.countDocuments(),
            Chapter.countDocuments(),
            News.countDocuments(),
            Gallery.countDocuments(),
            SiteStats.findById('site-stats'),
            User.find().sort({ createdAt: -1 }).limit(5).select('username email role createdAt'),
            Manga.find().sort({ viewCount: -1 }).limit(5).select('title slug viewCount coverImage')
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    users: totalUsers,
                    manga: totalManga,
                    chapters: totalChapters,
                    news: totalNews,
                    gallery: totalGallery,
                    visitors: siteStats ? siteStats.totalVisitors : 0,
                    onlineUsers: siteStats ? siteStats.getOnlineCount() : 0
                },
                recentUsers,
                popularManga
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Tüm kullanıcıları getir
// @route   GET /api/admin/users
// @access  Private (Moderator/Admin)
exports.getAllUsers = async (req, res, next) => {
    try {
        const { search, role, page = 1, limit = 20 } = req.query;

        let filter = {};

        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            filter.role = role;
        }

        const skip = (page - 1) * limit;

        const users = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    ID ile kullanıcı getir
// @route   GET /api/admin/users/:id
// @access  Private (Moderator/Admin)
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Kullanıcının istatistiklerini getir
        const [mangaCount, chapterCount, newsCount] = await Promise.all([
            Manga.countDocuments({ addedBy: user._id }),
            Chapter.countDocuments({ uploadedBy: user._id }),
            News.countDocuments({ author: user._id })
        ]);

        res.status(200).json({
            success: true,
            data: {
                user,
                stats: {
                    manga: mangaCount,
                    chapters: chapterCount,
                    news: newsCount
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Kullanıcı güncelle
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
    try {
        const { username, email, isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, isActive },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Kullanıcı sil
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Kendini silmeye çalışıyor mu?
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı silemezsiniz'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Kullanıcı başarıyla silindi'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Kullanıcı rolünü güncelle
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['user', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz rol'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Kendine rol atamaya çalışıyor mu?
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Kendi rolünüzü değiştiremezsiniz'
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};