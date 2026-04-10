const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getMyOrders, 
    getAllOrders, 
    updateOrderStatus, 
    getOrderByTracking // استيراد الدالة الجديدة
} = require('../controllers/orderController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// 1. مسارات المستخدم (User Routes)
router.post('/', authenticateToken, createOrder);
router.get('/me', authenticateToken, getMyOrders);

// 2. مسار التتبع (Public Route)
// ملاحظة: هذا المسار يجب أن يكون عاماً ليتمكن العميل من التتبع برقم التتبع فقط
router.get('/track/:tracking_number', getOrderByTracking);

// 3. مسارات المسؤول (Admin Routes)
router.get('/', authenticateToken, isAdmin, getAllOrders);
router.put('/:id/status', authenticateToken, isAdmin, updateOrderStatus);

module.exports = router;

