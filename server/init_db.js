const { pool } = require('./db');
require('dotenv').config();

const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      phone VARCHAR(50),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(50) CHECK (category IN ('flowers', 'trees', 'tools')),
      price DECIMAL NOT NULL,
      stock_quantity INT DEFAULT 0,
      image_url VARCHAR(255),
      average_rating DECIMAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      total_amount DECIMAL NOT NULL,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
      tracking_number VARCHAR(100) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      quantity INT NOT NULL,
      price_at_purchase DECIMAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      provider VARCHAR(100) DEFAULT 'MTN MoMo',
      phone_number VARCHAR(50) NOT NULL,
      transaction_id VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
      amount DECIMAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      rating INT CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wishlists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, product_id)
  );
`;

const initDB = async () => {
    try {
        console.log('Initializing database schema...');
        await pool.query(createTablesQuery);
        console.log('Database schema created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating database schema:', err);
        process.exit(1);
    }
};

initDB();
