const { pool } = require('../db');

// Sync local cart with cloud (Overwrite or Merge)
const syncCart = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.user.id;
        const { cart } = req.body; // Array of items [{product_id, quantity}]

        await client.query('BEGIN');

        // Delete existing
        await client.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

        // Insert new
        for (let item of cart) {
            await client.query(
                `INSERT INTO cart_items (user_id, product_id, quantity) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (user_id, product_id) 
                 DO UPDATE SET quantity = EXCLUDED.quantity`, 
                [user_id, item.product_id, item.quantity]
            );
        }

        // Fetch populated cart
        const result = await client.query(`
            SELECT c.product_id, c.quantity, p.name, p.price, p.image_url 
            FROM cart_items c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = $1
        `, [user_id]);

        await client.query('COMMIT');
        
        res.json({ cart: result.rows });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Sync Cart Error:", err);
        res.status(500).json({ error: 'Server error syncing cart' });
    } finally {
        client.release();
    }
};

const getCart = async (req, res) => {
    try {
        const user_id = req.user.id;
        const result = await pool.query(`
            SELECT c.product_id, c.quantity, p.name, p.price, p.image_url 
            FROM cart_items c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = $1
        `, [user_id]);
        res.json({ cart: result.rows });
    } catch (err) {
        console.error("Get Cart Error:", err);
        res.status(500).json({ error: 'Server error getting cart' });
    }
};

module.exports = { syncCart, getCart };
