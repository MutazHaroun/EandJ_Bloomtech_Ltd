const { pool } = require('./db');
require('dotenv').config();

const products = [
    // ---------------- FLOWERS & INDOOR PLANTS ----------------
    {
        name: 'Monstera Deliciosa',
        description: 'A striking tropical plant with characteristic split leaves. Perfect for adding a bold statement to any indoor space.',
        category: 'flowers',
        price: 35000,
        stock_quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.8
    },
    {
        name: 'Snake Plant (Sansevieria)',
        description: 'An incredibly resilient succulent that thrives on neglect. Excellent for purifying indoor air and perfect for beginners.',
        category: 'flowers',
        price: 25000,
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.5
    },
    {
        name: 'Peace Lily',
        description: 'Elegant white blooms and dark green leaves. Known for its air-purifying qualities and ability to thrive in lower light conditions.',
        category: 'flowers',
        price: 28000,
        stock_quantity: 20,
        image_url: 'https://images.unsplash.com/photo-1593854832551-0730040db402?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.7
    },
    {
        name: 'Bird of Paradise (Strelitzia)',
        description: 'Known for its spectacular bird-like orange and blue flowers, this tropical plant brings an exotic feel to your garden or bright indoor space.',
        category: 'flowers',
        price: 45000,
        stock_quantity: 12,
        image_url: 'https://images.unsplash.com/photo-1555581122-c4e883e582e0?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.9
    },
    {
        name: 'ZZ Plant',
        description: 'Virtually indestructible with waxy, dark green leaves that reflect sunlight and brighten rooms. Ideal for low-light environments.',
        category: 'flowers',
        price: 30000,
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.8
    },
    {
        name: 'Bougainvillea (Potted)',
        description: 'Vibrant, colorful bracts that bloom continuously. A staple of Rwandan landscaping, perfect for climbing walls or trellises.',
        category: 'flowers',
        price: 18000,
        stock_quantity: 40,
        image_url: 'https://images.unsplash.com/photo-1517596568195-2fe9a32c69cf?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.6
    },
    {
        name: 'White Orchid (Phalaenopsis)',
        description: 'A classic and graceful orchid with long-lasting white blooms. Makes a perfect premium gift or centerpiece.',
        category: 'flowers',
        price: 55000,
        stock_quantity: 8,
        image_url: 'https://images.unsplash.com/photo-1565578152541-1188151ffef7?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.9
    },
    {
        name: 'Aloe Vera',
        description: 'A medicinal marvel and beautiful succulent. Excellent for soothing burns and cuts while looking great on a windowsill.',
        category: 'flowers',
        price: 15000,
        stock_quantity: 60,
        image_url: 'https://images.unsplash.com/photo-1596547609652-9cb5d8d73bba?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.4
    },

    // ---------------- TREES ----------------
    {
        name: 'Hass Avocado Tree (Grafted)',
        description: 'A grafted Hass avocado tree ready to plant. Starts producing rich, buttery fruit in just 3-4 years.',
        category: 'trees',
        price: 45000,
        stock_quantity: 10,
        image_url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.9
    },
    {
        name: 'Mango Tree (Tommy Atkins)',
        description: 'A robust mango tree variety known for its large, colorful, and delicious fruit. Thrives in Rwandan climate.',
        category: 'trees',
        price: 42000,
        stock_quantity: 12,
        image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.6
    },
    {
        name: 'Ficus Lyrata (Fiddle Leaf Fig)',
        description: 'A popular indoor tree featuring large, deeply veined, violin-shaped leaves. Adds instant architectural height.',
        category: 'trees',
        price: 55000,
        stock_quantity: 8,
        image_url: 'https://images.unsplash.com/photo-1597055181300-d3dbed1d0e53?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.7
    },
    {
        name: 'Meyer Lemon Tree',
        description: 'Produces sweet-tart lemons year-round. Highly fragrant blossoms and adaptable to container growing.',
        category: 'trees',
        price: 38000,
        stock_quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1590005024862-6b67679a29fd?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.8
    },
    {
        name: 'Jacaranda Tree Seedling',
        description: 'The iconic tree that paints the streets purple! A fast-growing ornamental shade tree perfect for large gardens.',
        category: 'trees',
        price: 25000,
        stock_quantity: 20,
        image_url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.5
    },
    {
        name: 'Papaya Tree',
        description: 'A fast-growing tropical fruit tree that produces sweet papayas within its first year. Great for edible landscaping.',
        category: 'trees',
        price: 15000,
        stock_quantity: 35,
        image_url: 'https://images.unsplash.com/photo-1616421360061-9c17223b2c99?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.3
    },

    // ---------------- TOOLS ----------------
    {
        name: 'Professional Pruning Shears',
        description: 'High-carbon steel blades with ergonomic aluminum handles. Designed for clean cuts on tough branches.',
        category: 'tools',
        price: 18000,
        stock_quantity: 50,
        image_url: 'https://images.unsplash.com/photo-1416879590554-15db5b5a2bf3?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.4
    },
    {
        name: 'Heavy Duty Gardening Trowel',
        description: 'Stainless steel hand trowel with a comfortable grip. Perfect for digging, planting, and turning earth.',
        category: 'tools',
        price: 12000,
        stock_quantity: 100,
        image_url: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.8
    },
    {
        name: 'Premium Watering Can',
        description: 'A 5-liter galvanized steel watering can. Rust-resistant and perfectly balanced for a steady pour.',
        category: 'tools',
        price: 32000,
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1589417387258-208b04a8b835?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.9
    },
    {
        name: 'Organic Compost Mix (50L)',
        description: 'Rich, black, nutrient-dense organic compost. Perfectly balanced to revitalize garden soil and potted plants.',
        category: 'tools',
        price: 15000,
        stock_quantity: 150,
        image_url: 'https://images.unsplash.com/photo-1457530378978-8bac673b8062?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.7
    },
    {
        name: 'Brass Plant Mister',
        description: 'An elegant vintage-style brass mister. Ideal for increasing humidity for your delicate tropical indoor plants.',
        category: 'tools',
        price: 22000,
        stock_quantity: 40,
        image_url: 'https://images.unsplash.com/photo-1616231454178-f7bde56fa089?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.6
    },
    {
        name: 'Leather Gardening Gloves',
        description: 'Tough yet supple leather gloves. Protects against thorns, blisters, and soil while offering excellent dexterity.',
        category: 'tools',
        price: 14000,
        stock_quantity: 80,
        image_url: 'https://images.unsplash.com/photo-1598902595995-177b9499ad69?q=80&w=1000&auto=format&fit=crop',
        average_rating: 4.5
    }
];

const seedProducts = async () => {
    try {
        console.log('Clearing existing products...');
        await pool.query('DELETE FROM products');

        console.log('Seeding products...');
        for (const product of products) {
            await pool.query(
                `INSERT INTO products (name, description, category, price, stock_quantity, image_url, average_rating)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    product.name,
                    product.description,
                    product.category,
                    product.price,
                    product.stock_quantity,
                    product.image_url,
                    product.average_rating
                ]
            );
        }
        
        console.log(`Successfully seeded ${products.length} products!`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding products:', err);
        process.exit(1);
    }
};

seedProducts();
