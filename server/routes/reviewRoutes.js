const express = require('express');
const router = express.Router();
const { addProductReview, getProductReviews, deleteReview } = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

router.post('/product/:product_id', authenticateToken, addProductReview);
router.get('/product/:product_id', getProductReviews);

router.delete('/:id', authenticateToken, deleteReview);

module.exports = router;
