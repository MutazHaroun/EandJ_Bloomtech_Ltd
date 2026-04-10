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

// 1. إعداد التخزين (Storage Configuration)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // تأكد من إنشاء مجلد باسم uploads في جذر مجلد server
    },
    filename: (req, file, cb) => {
        // تسمية الملف: الوقت الحالي + الامتداد الأصلي (مثال: 1711884123456.jpg)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// 2. إعداد الفلتر (تأكد أن الملف المرفوع هو صورة فقط)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 100 * 1024 * 1024, // تم رفع الحد إلى 15 ميجابايت ليتناسب مع صور الهاتف عالية الجودة
        files: 1 // ضمان رفع ملف واحد فقط في المرة الواحدة
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
