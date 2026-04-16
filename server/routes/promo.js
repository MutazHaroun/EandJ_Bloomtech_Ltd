const express = require('express');
const router = express.Router();
const { createPromo, validatePromo, getAllPromos, togglePromoStatus, deletePromo } = require('../controllers/promoController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/validate', validatePromo);

// Admin only routes
router.post('/', verifyToken, isAdmin, createPromo);
router.get('/', verifyToken, isAdmin, getAllPromos);
router.put('/:id/toggle', verifyToken, isAdmin, togglePromoStatus);
router.delete('/:id', verifyToken, isAdmin, deletePromo);

module.exports = router;
