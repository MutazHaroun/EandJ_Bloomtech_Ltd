require('dotenv').config();
const { pool } = require('./db');
const { cloudinary } = require('./config/cloudinary');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

async function seedProducts() {
    try {
        console.log('🌱 Starting product seeder...');
        
        // 1. Read Excel
        const excelPath = path.join(__dirname, '../my_products/New Microsoft Excel Worksheet.xlsx');
        const workbook = xlsx.readFile(excelPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        // 2. Read Images
        const imgDir = path.join(__dirname, '../my_products');
        const files = fs.readdirSync(imgDir);
        const images = files.filter(f => f.match(/\.(png|jpg|jpeg)$/i));
        
        const MAX_PRODUCTS = Math.min(30, data.length, images.length);
        console.log(`Found ${data.length} plants and ${images.length} images. Limiting to ${MAX_PRODUCTS}.`);

        let successCount = 0;

        for (let i = 0; i < MAX_PRODUCTS; i++) {
            const product = data[i];
            const imageName = images[i];
            const imagePath = path.join(imgDir, imageName);

            const name = product['Names'] || `Plant ${i}`;
            const price = product['Sales/Unit'] || 5000;
            const stock_quantity = product[' Opening Stock '] || 10;
            const category = 'flowers'; // default
            const description = `Beautiful ${name} to brighten up your space.`;

            console.log(`Uploading [${i+1}/${MAX_PRODUCTS}]: ${name} (${imageName})...`);

            try {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(imagePath, {
                    folder: 'eandj_bloomtech'
                });

                // Insert to Database
                await pool.query(
                    'INSERT INTO products (name, description, category, price, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
                    [name, description, category, price, stock_quantity, result.secure_url]
                );
                
                successCount++;
            } catch (err) {
                console.error(`❌ Failed to upload/insert ${name}:`, err.message);
            }
        }
        
        console.log(`✅ Successfully seeded ${successCount} products!`);
        process.exit(0);
    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

seedProducts();
