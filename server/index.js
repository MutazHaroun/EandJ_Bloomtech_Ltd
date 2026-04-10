const express = require('express');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config();

const app = express();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// ════════════ MIDDLEWARES ════════════
app.use(cors());

// تعديل: رفع حد استقبال بيانات JSON (مهم للمصفوفات والبيانات الطويلة)
app.use(express.json({ limit: '20mb' }));

// تعديل: رفع حد استقبال بيانات Form-data (ضروري جداً لرفع الصور كبيرة الحجم)
app.use(express.urlencoded({ limit: '20mb', extended: true })); 

// ═══ السطر الأهم لعرض الصور ═══
// يجعل مجلد uploads متاحاً للوصول العام لرؤية صور المنتجات في المتصفح
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ════════════ ROUTES ════════════
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'E&J Bloomtech Backend Running' });
});

// ════════════ SERVER START ════════════
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
