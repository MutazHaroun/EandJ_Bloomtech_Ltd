const express = require('express');
const router = express.Router();
const { addWishlist, getWishlist, removeWishlist } = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, addWishlist);
router.get('/', authenticateToken, getWishlist);
router.delete('/:product_id', authenticateToken, removeWishlist);

module.exports = router;
