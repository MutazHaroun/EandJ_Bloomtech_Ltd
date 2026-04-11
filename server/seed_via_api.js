require('dotenv').config();
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const FormData = require('form-data');
const fetch = require('node-fetch'); // we'll use node-fetch or native fetch in node 18+

async function seedViaAPI() {
    console.log('🚀 Starting remote cloud seeder via Live API...');

    // 1. Generate local Admin JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'local-seeder', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Generated Admin Authorization Token.');

    // 2. Read Excel
    const excelPath = path.join(__dirname, '../my_products/New Microsoft Excel Worksheet.xlsx');
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    // 3. Read Images (JPG/PNG < 10MB)
    const imgDir = path.join(__dirname, '../my_products');
    const files = fs.readdirSync(imgDir);
    // Find all images, prefer jpg since user compressed to jpg
    const images = files.filter(f => f.match(/\.(png|jpg|jpeg)$/i)).sort();
    
    const MAX_PRODUCTS = Math.min(30, data.length, images.length);
    console.log(`📊 Found ${data.length} plants and ${images.length} images. Processing first ${MAX_PRODUCTS}.`);

    let successCount = 0;

    for (let i = 0; i < MAX_PRODUCTS; i++) {
        const product = data[i];
        const imageName = images[i];
        const imagePath = path.join(imgDir, imageName);

        const name = product['Names'] || `Plant ${i}`;
        const price = product['Sales/Unit'] || 5000;
        const stock_quantity = product[' Opening Stock '] || 10;
        const category = 'flowers';
        const description = `Beautiful ${name}.`;

        console.log(`\n⏳ Uploading [${i+1}/${MAX_PRODUCTS}]: ${name} with image ${imageName}...`);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', price.toString());
            formData.append('category', category);
            formData.append('stock_quantity', stock_quantity.toString());
            formData.append('description', description);
            formData.append('image', fs.createReadStream(imagePath));

            const response = await fetch('https://eandj-bloomtech-ltd.onrender.com/api/products', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const resultText = await response.text();

            if (response.ok) {
                console.log(`✅ Success: ${name} added live!`);
                successCount++;
            } else {
                console.error(`❌ Failed API response for ${name}:`, response.status, resultText);
            }
        } catch (err) {
            console.error(`❌ Network error for ${name}:`, err.message);
        }
        
        // Sleep for 1 second between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n🎉 Process Complete! Successfully seeded ${successCount} products to live database.`);
    process.exit(0);
}

seedViaAPI();
