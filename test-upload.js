const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testUpload() {
  const form = new FormData();
  form.append('name', 'Test Product ' + Date.now());
  form.append('description', 'Test Description');
  form.append('category', 'flowers');
  form.append('price', '500');
  form.append('stock_quantity', '10');
  
  // We need a dummy image
  fs.writeFileSync('dummy.jpg', 'fake image data');
  form.append('image', fs.createReadStream('dummy.jpg'));

  console.log('Sending request...');
  try {
    const res = await fetch('https://eandj-bloomtech-ltd.onrender.com/api/products', {
      method: 'POST',
      body: form,
      // Note: we don't have authenticateToken here because we don't have a valid JWT
      // Wait, the route has `authenticateToken` and `isAdmin`! So it will return 401 Unauthorized.
    });
    const text = await res.text();
    console.log('Response:', res.status, text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
testUpload();
