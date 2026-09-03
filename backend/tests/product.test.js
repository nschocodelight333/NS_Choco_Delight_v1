const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const Product = require('../models/Product');

describe('Product Controller & API Safeguards', () => {
  beforeAll(async () => {
    await connectDB();
    // Ensure test product exists
    await Product.create({
      name: 'Test Dark Chocolate',
      description: 'Handcrafted dark chocolate for unit testing',
      category: 'Normal Shape or Heart',
      price: 150,
      stock: 20,
    });
  });

  afterAll(async () => {
    await Product.deleteMany({ name: 'Test Dark Chocolate' });
    await mongoose.connection.close();
  });

  test('GET /api/products returns products list successfully', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test('GET /api/products with special regex characters search does not crash', async () => {
    const res = await request(app).get('/api/products?search=Dark%2B%2A%28%5B');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test('GET /api/products with non-matching category returns products fallback cleanly', async () => {
    const res = await request(app).get('/api/products?category=UnknownNonExistentCat');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });
});
