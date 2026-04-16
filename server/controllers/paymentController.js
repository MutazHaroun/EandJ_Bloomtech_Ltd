const { pool } = require('../db');
const crypto = require('crypto');
const axios = require('axios');
const emailService = require('../services/emailService');

/**
 * دالة مساعدة للحصول على Access Token من MTN
 * تستخدم مفاتيح البيئة التي قمنا بتوليدها في ملف .env
 */
const getMomoToken = async () => {
    try {
        const userId = process.env.MOMO_API_USER_ID;
        const apiKey = process.env.MOMO_API_KEY;
        const subKey = process.env.MOMO_SUBSCRIPTION_KEY;

        // تشفير المفاتيح باستخدام Base64 للمصادقة
        const auth = Buffer.from(`${userId}:${apiKey}`).toString('base64');
        
        const response = await axios.post(`${process.env.MOMO_BASE_URL}/collection/token/`, {}, {
            headers: {
                'Authorization': `Basic ${auth}`, 
                'Ocp-Apim-Subscription-Key': subKey
            }
        });
        
        const token = response.data.access_token;

        console.log("✅ MTN Access Token generated");
        // --- السطر المطلوب لنسخ التوكن ---
        console.log("🔑 Full Token (Copy this):", token); 
        // -------------------------------

        return token;
    } catch (err) {
        console.error('❌ MTN Token Auth Error:', err.response?.data || err.message);
        throw new Error('Authentication with MTN failed');
    }
};


// 1. معالجة طلب الدفع الابتدائي (Request To Pay)
const processPayment = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { order_id } = req.body;
        const user_id = req.user ? req.user.id : null;

        // جلب تفاصيل الطلب من قاعدة البيانات
        const orderRes = await client.query(
            'SELECT * FROM orders WHERE id = $1', 
            [order_id]
        );
        
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderRes.rows[0];

        // جلب رقم الهاتف
        let phone_number = order.guest_phone;
        
        // إذا كان يملك حساب، خذ رقمه
        if (user_id && !phone_number) {
            const userRes = await client.query('SELECT phone FROM users WHERE id = $1', [user_id]);
            if (userRes.rows.length > 0) phone_number = userRes.rows[0].phone;
        }

        if (!phone_number) {
            return res.status(400).json({ error: 'Phone number not provided.' });
        }
        
        
        // تنظيف الرقم ليتوافق مع متطلبات MTN API (إزالة + وأي مسافات)
        phone_number = phone_number.replace(/\D/g, '');
        // إذا كان لا يبدأ بمفتاح رواندا، نضيفه
        if (phone_number.startsWith('0')) {
            phone_number = '250' + phone_number.substring(1);
        } else if (!phone_number.startsWith('250') && phone_number.length === 9) {
            phone_number = '250' + phone_number;
        }
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }


        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Order is already processed' });
        }

       // الحصول على التوكن قبل إرسال الطلب
const token = await getMomoToken();
const xReferenceId = crypto.randomUUID(); 
// MTN Sandbox يتطلب externalId قصير أو رقمي غالباً، نأخذ الجزء الأول من UUID الطلب
const externalId = order_id.toString().split('-')[0]; 

// --- أضف هذه السطور هنا لمراقبة البيانات في الـ Terminal ---
console.log("------------------------------------------");
console.log(`🆔 Order ID: ${order_id}`);
console.log(`🔑 X-Reference-Id: ${xReferenceId}`);
console.log(`📂 External-Id: ${externalId}`);
console.log(`📱 Phone: ${phone_number}`);
console.log("------------------------------------------");
// ------------------------------------------------------

console.log(`🚀 Sending RequestToPay for Order: ${order_id} using phone: ${phone_number}`);

// إرسال الطلب الفعلي لـ MTN
await axios.post(`${process.env.MOMO_BASE_URL}/collection/v1_0/requesttopay`, {
    amount: order.total_amount.toString(),
    currency: "EUR", 
    externalId: externalId,
    payer: { partyIdType: "MSISDN", partyId: phone_number },
    payerMessage: "Payment for EJ Bloomtech Order",
    payeeNote: "Thank you for shopping"
}, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'X-Reference-Id': xReferenceId,
        'X-Target-Environment': process.env.MOMO_TARGET_ENV,
        'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY
    }
});


        // تسجيل الدفعة بحالة 'pending' بانتظار الـ Webhook أو رد الزبون
        await client.query('BEGIN');
        await client.query(
            'INSERT INTO payments (order_id, phone_number, transaction_id, status, amount) VALUES ($1, $2, $3, $4, $5)',
            [order_id, phone_number, xReferenceId, 'pending', order.total_amount]
        );
        await client.query('COMMIT'); 

        res.json({
            message: 'Payment request sent. Please check your phone to confirm.',
            referenceId: xReferenceId,
            status: 'pending'
        });

    } catch (err) {
        if (client) await client.query('ROLLBACK'); 
        console.error('❌ MoMo API Process Error:', err.response?.data || err.message);
        res.status(500).json({ error: 'MTN service communication error' });
    } finally {
        if (client) client.release(); 
    }
};

// 2. معالجة الـ Webhook (عندما يوافق الزبون على الدفع)
const handleMomoWebhook = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { externalId, status, financialTransactionId } = req.body;
        
        console.log(`📡 Webhook Received: Status ${status} for ID ${externalId}`);

        await client.query('BEGIN');

        if (status === 'SUCCESSFUL') {
            const tracking_number = 'TRK-BLOOM-' + crypto.randomBytes(3).toString('hex').toUpperCase() + Date.now().toString().slice(-4);
            
            // تحديث الطلب ليصبح مدفوعاً وإضافة رقم التتبع
            await client.query(
                "UPDATE orders SET status = 'paid', tracking_number = $1 WHERE id::text LIKE $2",
                [tracking_number, `${externalId}%`]
            );

            // تحديث سجل الدفعة بنجاح العملية
            await client.query(
                "UPDATE payments SET status = 'success', transaction_id = $1 WHERE order_id::text LIKE $2",
                [financialTransactionId || 'SUCCESS', `${externalId}%`]
            );
            
            // Add Loyalty Points (1 point for every 100 RWF)
            const orderTotalRes = await client.query("SELECT total_amount, user_id FROM orders WHERE id::text LIKE $1", [`${externalId}%`]);
            if(orderTotalRes.rows.length > 0 && orderTotalRes.rows[0].user_id) {
                 const pointsEarned = Math.floor(orderTotalRes.rows[0].total_amount / 100); 
                 await client.query("UPDATE users SET loyalty_points = COALESCE(loyalty_points, 0) + $1 WHERE id = $2", [pointsEarned, orderTotalRes.rows[0].user_id]);
                 console.log(`🎁 Added ${pointsEarned} loyalty points to User ${orderTotalRes.rows[0].user_id}`);
            }

            // --- Send Order Confirmation Email ---
            try {
                const orderDataForEmailRes = await client.query(`
                    SELECT o.total_amount, o.tracking_number, o.guest_email, u.email as user_email
                    FROM orders o
                    LEFT JOIN users u ON o.user_id = u.id
                    WHERE o.id::text LIKE $1
                `, [`${externalId}%`]);

                if(orderDataForEmailRes.rows.length > 0) {
                    const oData = orderDataForEmailRes.rows[0];
                    const targetEmail = oData.user_email || oData.guest_email;
                    if(targetEmail) {
                        emailService.sendOrderConfirmation(targetEmail, {
                            total_amount: oData.total_amount,
                            tracking_number: oData.tracking_number
                        });
                    }
                }
            } catch(e) {
                console.error("Error sending mock email", e);
            }

            console.log("✅ Order updated to PAID via Webhook");
        } else {
            // في حال فشل الدفع أو إلغائه من الزبون
            await client.query("UPDATE orders SET status = 'failed' WHERE id::text LIKE $1", [`${externalId}%`]);
            await client.query("UPDATE payments SET status = 'failed' WHERE order_id::text LIKE $1", [`${externalId}%`]);
        }

        await client.query('COMMIT');
        res.status(200).send(); 

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('❌ Webhook Error:', err);
        res.status(500).send();
    } finally {
        if (client) client.release();
    }
};

// 3. جلب حالة الدفع لطلب معين
const getOrderPaymentStatus = async (req, res) => {
    try {
        const { order_id } = req.params;
        const paymentRes = await pool.query(
            'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC', 
            [order_id]
        );
        res.json(paymentRes.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching payment status' });
    }
};

// 4. تتبع الطلب عبر رقم التتبع
const trackOrder = async (req, res) => {
    try {
        const { tracking_number } = req.params;
        const orderRes = await pool.query(`
            SELECT o.*, u.name as customer_name,
            json_agg(json_build_object('name', p.name, 'quantity', oi.quantity, 'image_url', p.image_url)) as items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.tracking_number = $1
            GROUP BY o.id, u.name
        `, [tracking_number]);
        
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Tracking number not found' });
        }
        res.json(orderRes.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Tracking system error' });
    }
};

module.exports = { processPayment, getOrderPaymentStatus, trackOrder, handleMomoWebhook };

