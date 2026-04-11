const express = require('express');
const { createProduct } = require('./controllers/productController');
const { storage } = require('./config/cloudinary');
const multer = require('multer');

async function debugUpload() {
  const req = {
    body: { name: 't', description: 't', category: 'flowers', price: '100', stock_quantity: '10' },
    file: { path: 'http://cloudinary.com/fake.jpg' },
  };
  const res = {
    status: (code) => ({ json: (data) => console.log('Status', code, data) }),
    json: (data) => console.log('JSON', data)
  };
  await createProduct(req, res);
}
debugUpload();
