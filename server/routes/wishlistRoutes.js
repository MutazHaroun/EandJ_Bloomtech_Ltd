const express = require('express');
const router = express.Router();
const { addWishlist, getWishlist, removeWishlist, getPublicWishlist } = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getWishlist);
router.post('/', authenticateToken, addWishlist);
router.delete('/:product_id', authenticateToken, removeWishlist);

// Public route for shareable wishlists
router.get('/public/:userId', getPublicWishlist);

module.exports = router;
