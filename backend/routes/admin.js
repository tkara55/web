const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserRole,
    getDashboardStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin, isModerator } = require('../middleware/admin');

// Tüm admin route'ları protected ve en az moderator yetkisi gerektirir
router.use(protect);

// Dashboard istatistikleri
router.get('/dashboard', isModerator, getDashboardStats);

// Kullanıcı yönetimi
router.get('/users', isModerator, getAllUsers);
router.get('/users/:id', isModerator, getUserById);
router.put('/users/:id', isAdmin, updateUser);
router.delete('/users/:id', isAdmin, deleteUser);
router.put('/users/:id/role', isAdmin, updateUserRole);

module.exports = router;