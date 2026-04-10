const express = require('express');
const router = express.Router();
const { 
    processPayment, 
    getOrderPaymentStatus, 
    trackOrder, 
    handleMomoWebhook // إضافة الدالة الجديدة هنا
} = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// 1. مسار تنفيذ عملية الدفع (محمي)
router.post('/pay', authenticateToken, processPayment);

// 2. مسار جلب حالة الدفع لطلب محدد (محمي)
router.get('/order/:order_id', authenticateToken, getOrderPaymentStatus);

// 3. مسار تتبع الطلب عبر رقم التتبع (عام - لكي يتمكن أي شخص لديه الكود من التتبع)
router.get('/track/:tracking_number', trackOrder);

// ══════════════════════════════════════════════════
// 4. مسار الـ WEBHOOK الخاص بـ MTN MoMo (عام)
// ملاحظة: هذا المسار يجب أن يكون عاماً (بدون authenticateToken) 
// لأن بوابة الدفع الخارجية هي من تقوم بمراسلته.
// ══════════════════════════════════════════════════
router.post('/webhook/momo', handleMomoWebhook);

module.exports = router;
