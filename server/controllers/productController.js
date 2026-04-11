const { pool } = require('../db');

// ================= CREATE PRODUCT =================
const createProduct = async (req, res) => {
    try {
        const { name, description, category, price, stock_quantity } = req.body;
        
        let image_url = req.file ? req.file.path : req.body.image_url || '';

        const result = await pool.query(
            'INSERT INTO products (name, description, category, price, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, category, price, stock_quantity, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error in createProduct:", err);
        res.status(500).json({ error: 'Server error creating product' });
    }
};

// ================= UPDATE PRODUCT =================
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, price, stock_quantity } = req.body;
        
        // التحقق من وجود المنتج أولاً لجلب الصورة القديمة إذا لم يتم رفع واحدة جديدة
        const currentProduct = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
        if (currentProduct.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

        let image_url = currentProduct.rows[0].image_url; // القيمة الافتراضية هي الصورة القديمة

        if (req.file) {
            image_url = req.file.path; // Cloudinary URL
        } else if (req.body.image_url) {
            image_url = req.body.image_url;
        }

        const result = await pool.query(
            'UPDATE products SET name = $1, description = $2, category = $3, price = $4, stock_quantity = $5, image_url = $6 WHERE id = $7 RETURNING *',
            [name, description, category, price, stock_quantity, image_url, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error in updateProduct:", err);
        res.status(500).json({ error: 'Server error updating product' });
    }
};

// ================= GET ALL PRODUCTS =================
const getAllProducts = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 10 } = req.query;
        let queryStr = 'SELECT * FROM products WHERE 1=1';
        let values = [];
        let count = 1;

        if (search) {
            queryStr += ` AND name ILIKE $${count}`;
            values.push(`%${search}%`);
            count++;
        }

        if (category) {
            queryStr += ` AND category = $${count}`;
            values.push(category);
            count++;
        }

        queryStr += ` ORDER BY created_at DESC LIMIT $${count} OFFSET $${count + 1}`;
        values.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const productsRes = await pool.query(queryStr, values);
        
        const products = productsRes.rows;

        // عدد المنتجات الكلي
        let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
        let countValues = [];
        if (search) {
            countQuery += ` AND name ILIKE $1`;
            countValues.push(`%${search}%`);
            if (category) {
                countQuery += ` AND category = $2`;
                countValues.push(category);
            }
        } else if (category) {
            countQuery += ` AND category = $1`;
            countValues.push(category);
        }

        const totalResult = await pool.query(countQuery, countValues);

        res.json({
            products,
            pagination: {
                total: parseInt(totalResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching products' });
    }
};

// ================= GET PRODUCT BY ID =================
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const productRes = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (productRes.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

        const product = productRes.rows[0];
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching product' });
    }
};

// ================= DELETE PRODUCT =================
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting product' });
    }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };

