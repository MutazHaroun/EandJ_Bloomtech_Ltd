const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const emailService = require('../services/emailService');
require('dotenv').config();

const register = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        // التحقق من وجود المستخدم مسبقاً
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email.' });
        }

        // تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // تم التعديل هنا: العودة لاستخدام phone لتطابق قاعدة البيانات (مع تمريره للفرونت إند)
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone as phone_number',
            [name, email, password_hash, phone, address]
        );

        // Send mock welcome email asynchronously
        emailService.sendWelcomeEmail(email, name);

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Server error during registration', detail: error.detail, code: error.code });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userObj = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userObj.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = userObj.rows[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // توليد JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone_number: user.phone || user.phone_number // دعم الحالتين
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { name, phone, address } = req.body;

        const updatedUser = await pool.query(
            'UPDATE users SET name = $1, phone = $2, address = $3 WHERE id = $4 RETURNING id, name, email, phone as phone_number, address, role',
            [name, phone, address, id]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user: updatedUser.rows[0] });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error during profile update' });
    }
};

const getMe = async (req, res) => {
    try {
        // تم التعديل هنا: جلب phone as phone_number
        const userObj = await pool.query(
            'SELECT id, name, email, phone as phone_number, address, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (userObj.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user: userObj.rows[0] });
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
};

module.exports = { register, login, updateProfile, getMe };

