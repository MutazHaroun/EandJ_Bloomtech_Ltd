const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  const form = new FormData();
  form.append('name', 'Test Product ' + Date.now());
  form.append('description', 'Test Description');
  form.append('category', 'flowers');
  form.append('price', '500');
  form.append('stock_quantity', '10');
  
  fs.writeFileSync('dummy.jpg', 'fake image data');
  form.append('image', fs.createReadStream('dummy.jpg'));

  console.log('Sending request...');
  try {
    const res = await fetch('http://localhost:5001/api/products', {
      method: 'POST',
      body: form,
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNvbWUtaWQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU4ODc5MzYsImV4cCI6MTc3NTk3NDMzNn0.KiDImb3_jbu8FonVr3jeCkFLOD5iq170IbUyFBXgEc4'
      }
    });
    const text = await res.text();
    console.log('Response:', res.status, text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
testUpload();
