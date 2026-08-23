const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const connectDB = require('../config/db');
const User = require('../models/User');

jest.setTimeout(30000);

describe('Auth & User Registration / Login Flow', () => {
  const adminEmail = 'nschocodelight333@gmail.com';
  const adminPassword = 'AdminChoco2026!';

  const customerEmail = 'skshafiullashakhadar@gmail.com';
  const customerPassword = 'UserChoco2026!';

  const newEmail = 'newtestcustomer@chocodelight.com';
  const newPassword = 'NewUserPassword2026!';

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteOne({ email: newEmail });
    await mongoose.connection.close();
  });

  test('Protected route /api/orders/my-orders returns 401 JSON when unauthenticated', async () => {
    const res = await request(app).get('/api/orders/my-orders');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
  });

  test('Admin route /api/admin/reviews returns 401 JSON when unauthenticated', async () => {
    const res = await request(app).get('/api/admin/reviews');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Login succeeds for PERMANENT ADMIN nschocodelight333@gmail.com', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: adminEmail,
      password: adminPassword,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(adminEmail);
    expect(res.body.user.role).toBe('admin');
  });

  test('Login succeeds for CUSTOMER skshafiullashakhadar@gmail.com', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: customerEmail,
      password: customerPassword,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(customerEmail);
    expect(res.body.user.role).toBe('customer');
  });

  test('Login succeeds with uppercase and whitespace in email input', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: '  NSCHOCODELIGHT333@gmail.com ',
      password: adminPassword,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(adminEmail);
  });

  test('Login fails with incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: adminEmail,
      password: 'WrongPassword123!',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  test('Full end-to-end flow: Register brand new customer user and log in immediately', async () => {
    // 1. Register
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'New Test Customer',
      email: newEmail,
      password: newPassword,
      phone: '9876543210',
    });
    expect(regRes.statusCode).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.token).toBeDefined();
    expect(regRes.body.user.email).toBe(newEmail);
    expect(regRes.body.user.role).toBe('customer');

    // 2. Login immediately after
    const loginRes = await request(app).post('/api/auth/login').send({
      email: newEmail,
      password: newPassword,
    });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.user.email).toBe(newEmail);
  });
});
