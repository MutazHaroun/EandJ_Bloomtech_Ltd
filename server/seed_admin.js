const bcrypt = require('bcrypt');
const { pool } = require('./db');

const seedAdmin = async () => {
    try {
        console.log('Seeding default admin...');
        
        const email = 'admin@bloomtech.com';
        const rawPassword = 'Admin@123';
        const name = 'Default Admin';
        const role = 'admin';

        // Check if exists
        const exists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0) {
            console.log('Admin already exists. Seeding skipped.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(rawPassword, salt);

        await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
            [name, email, password_hash, role]
        );

        console.log('Default admin seeded successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();
