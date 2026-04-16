const { pool } = require('../db');

// Create a new promo code
const createPromo = async (req, res) => {
    try {
        const { code, discount_percentage, expiration_date } = req.body;
        
        const result = await pool.query(
            'INSERT INTO promo_codes (code, discount_percentage, expiration_date) VALUES ($1, $2, $3) RETURNING *',
            [code.toUpperCase(), discount_percentage, expiration_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating promo:", err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Promo code already exists' });
        }
        res.status(500).json({ error: 'Server error creating promo' });
    }
};

// Validate a promo code
const validatePromo = async (req, res) => {
    try {
        const { code } = req.body;
        
        const result = await pool.query(
            'SELECT * FROM promo_codes WHERE code = $1 AND is_active = true',
            [code.toUpperCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid or inactive promo code' });
        }

        const promo = result.rows[0];
        if (promo.expiration_date && new Date(promo.expiration_date) < new Date()) {
            return res.status(400).json({ error: 'Promo code has expired' });
        }

        res.json({ discount_percentage: promo.discount_percentage, code: promo.code });
    } catch (err) {
        console.error("Error validating promo:", err);
        res.status(500).json({ error: 'Server error validating promo' });
    }
};

// Get all promos (admin)
const getAllPromos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching promos' });
    }
};

// Toggle promo active status
const togglePromoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE promo_codes SET is_active = NOT is_active WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Promo not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error toggling promo' });
    }
};

const deletePromo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM promo_codes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Promo not found' });
        res.json({ message: 'Promo deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting promo' });
    }
}

module.exports = { createPromo, validatePromo, getAllPromos, togglePromoStatus, deletePromo };
