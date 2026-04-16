const express = require('express');
const router = express.Router();
const { createPromo, validatePromo, getAllPromos, togglePromoStatus, deletePromo } = require('../controllers/promoController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/validate', validatePromo);

// Admin only routes
router.post('/', authenticateToken, isAdmin, createPromo);
router.get('/', authenticateToken, isAdmin, getAllPromos);
router.put('/:id/toggle', authenticateToken, isAdmin, togglePromoStatus);
router.delete('/:id', authenticateToken, isAdmin, deletePromo);

module.exports = router;
