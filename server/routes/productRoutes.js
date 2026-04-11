const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/productController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const { storage } = require('../config/cloudinary');

const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10 MB limit for safety
        files: 1
    } 
});

// --- المسارات ---

router.get('/', getAllProducts);
router.get('/:id', getProductById);

// 3. تحديث مسارات الإضافة والتعديل لاستقبال الصورة
// ملاحظة: 'image' هو الاسم الذي أرسلناه من الفرونت-إند في FormData
router.post('/', authenticateToken, isAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), updateProduct);

router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

module.exports = router;
