const { pool } = require('../db');

// 1. إنشاء طلب جديد (Checkout & Guest)
const createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        const user_id = req.user ? req.user.id : null;
        const { items, guest_email, guest_phone } = req.body; 

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain items' });
        }

        await client.query('BEGIN');

        let total_amount = 0;
        const processedItems = [];

        // التحقق من المخزون وحساب المجموع
        for (const item of items) {
            const productRes = await client.query('SELECT name, price, stock_quantity FROM products WHERE id = $1', [item.product_id]);
            if (productRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: `Product ${item.product_id} not found` });
            }
            const product = productRes.rows[0];
            
            if (product.stock_quantity < item.quantity) {
                 await client.query('ROLLBACK');
                 return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
            }

            total_amount += product.price * item.quantity;
            processedItems.push({
                product_id: item.product_id,
                name: product.name,
                quantity: item.quantity,
                price_at_purchase: product.price
            });
        }

        // --- التعديل هنا: توليد رقم تتبع تلقائي فريد ---
        const tracking_number = `TRK-BLOOM-${Math.random().toString(36).substr(2, 7).toUpperCase()}`;

        // إدخال الطلب مع رقم التتبع الجديد
        const orderRes = await client.query(
            'INSERT INTO orders (user_id, total_amount, status, tracking_number, guest_email, guest_phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, total_amount, 'pending', tracking_number, user_id ? null : guest_email, user_id ? null : guest_phone]
        );
        const order = orderRes.rows[0];

        // إدخال العناصر وتحديث المخزون
        for (const pItem of processedItems) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                [order.id, pItem.product_id, pItem.quantity, pItem.price_at_purchase]
            );

            await client.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                [pItem.quantity, pItem.product_id]
            );
        }

        await client.query('COMMIT');
        
        // إرجاع الرد مع كائن الطلب الذي يحتوي الآن على tracking_number
        res.status(201).json({ 
            message: 'Order created successfully', 
            order, 
            items: processedItems 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in createOrder:', err);
        res.status(500).json({ error: 'Server error creating order' });
    } finally {
        client.release();
    }
};

// 2. جلب طلبات المستخدم الحالي
const getMyOrders = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const ordersRes = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
        
        let orders = ordersRes.rows;
        
        for (let i = 0; i < orders.length; i++) {
             const itemsRes = await pool.query(`
                 SELECT oi.*, p.name, p.image_url 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = $1`, 
                 [orders[i].id]
             );
             orders[i].items = itemsRes.rows;
        }
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching user orders' });
    }
};

// 3. جلب طلب واحد عن طريق رقم التتبع (Track Order)
const getOrderByTracking = async (req, res) => {
    try {
        if (!req.params.tracking_number) {
            return res.status(400).json({ error: 'Tracking number is required' });
        }

        // تحويل المدخلات لأحرف كبيرة وتجهيزها
        const tracking_number = req.params.tracking_number.trim().toUpperCase();
        
        // البحث باستخدام الحالة الموحدة للأحرف لضمان التطابق
        const orderRes = await pool.query(
            'SELECT * FROM orders WHERE UPPER(tracking_number) = $1', 
            [tracking_number]
        );
        
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Tracking number not found' });
        }

        const order = orderRes.rows[0];

        const itemsRes = await pool.query(`
            SELECT oi.*, p.name, p.image_url 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = $1`, 
            [order.id]
        );

        order.items = itemsRes.rows;
        res.json(order);

    } catch (err) {
        console.error('Error in getOrderByTracking:', err);
        res.status(500).json({ error: 'Server error fetching tracking details' });
    }
};

// Admin: جلب كافة الطلبات
const getAllOrders = async (req, res) => {
    try {
        const ordersRes = await pool.query(`
            SELECT o.*, u.name as user_name, u.email as user_email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC`);
        res.json(ordersRes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching all orders' });
    }
};

// Admin: تحديث حالة الطلب
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tracking_number } = req.body;
        
        let queryStr = 'UPDATE orders SET status = $1';
        let values = [status, id];

        if (tracking_number !== undefined) {
             queryStr += `, tracking_number = $3`;
             values.push(tracking_number.trim().toUpperCase());
        }

        queryStr += ` WHERE id = $2 RETURNING *`;
        
        const result = await pool.query(queryStr, values);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating order status' });
    }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getOrderByTracking };
