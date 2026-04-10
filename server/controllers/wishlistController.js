const { pool } = require('../db');

const addWishlist = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const { product_id } = req.body;

        const result = await pool.query(
            'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
            [user_id, product_id]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({ message: 'Product is already in your wishlist.' });
        }

        res.status(201).json({ message: 'Added to wishlist', wishlist: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding to wishlist' });
    }
};

const getWishlist = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const result = await pool.query(
            'SELECT w.id as wishlist_id, p.* FROM wishlists w JOIN products p ON w.product_id = p.id WHERE w.user_id = $1 ORDER BY w.created_at DESC',
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching wishlist' });
    }
};

const removeWishlist = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const { product_id } = req.params;

        await pool.query('DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2', [user_id, product_id]);
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error removing from wishlist' });
    }
};

module.exports = { addWishlist, getWishlist, removeWishlist };
