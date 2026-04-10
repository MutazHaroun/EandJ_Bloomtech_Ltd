const { pool } = require('../db');

const addProductReview = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const { product_id } = req.params;
        const { rating, comment } = req.body;

        // Check if user already reviewed
        const existingReview = await pool.query('SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2', [user_id, product_id]);
        if (existingReview.rows.length > 0) {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }

        const newReview = await pool.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, product_id, rating, comment]
        );

        // Update average_rating in products table
        const avgQuery = await pool.query('SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = $1', [product_id]);
        const avgRating = avgQuery.rows[0].avg_rating || 0;

        await pool.query('UPDATE products SET average_rating = $1 WHERE id = $2', [avgRating, product_id]);

        res.status(201).json(newReview.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding review' });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const { product_id } = req.params;
        const reviews = await pool.query(
            'SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC',
            [product_id]
        );
        res.json(reviews.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching reviews' });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const role = req.user.role;

        const reviewRes = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
        if (reviewRes.rows.length === 0) return res.status(404).json({ error: 'Review not found' });

        const review = reviewRes.rows[0];

        // Ensure user is the author or admin
        if (review.user_id !== user_id && role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

        // Recalculate average rating
        const avgQuery = await pool.query('SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = $1', [review.product_id]);
        const avgRating = avgQuery.rows[0].avg_rating || 0;
        await pool.query('UPDATE products SET average_rating = $1 WHERE id = $2', [avgRating, review.product_id]);

        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting review' });
    }
};

module.exports = { addProductReview, getProductReviews, deleteReview };
