const express = require('express');
const router = express.Router();
const { syncCart, getCart } = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getCart);
router.post('/sync', authenticateToken, syncCart);

module.exports = router;
