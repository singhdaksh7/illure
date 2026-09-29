import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Customer Authentication API', () => {
  const testCustomer = {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '9876543210',
    password: 'CustomerPassword123!',
  };

  const testCustomer2 = {
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '9876543211',
    password: 'CustomerPassword123!',
  };

  beforeAll(async () => {
    await prisma.customer.deleteMany({
      where: { email: { in: [testCustomer.email, testCustomer2.email] } },
    });
  });

  afterAll(async () => {
    await prisma.customer.deleteMany({
      where: { email: { in: [testCustomer.email, testCustomer2.email] } },
    });
  });

  it('POST /api/auth/customer/register - should register a new customer', async () => {
    const res = await request(app).post('/api/auth/customer/register').send(testCustomer);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.customer).toHaveProperty('id');
    expect(res.body.data.customer.email).toBe(testCustomer.email);
    expect(res.body.data.customer.name).toBe(testCustomer.name);
    expect(res.body.data.accessToken).toBeDefined();

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('customer_refresh_token');
  });

  it('POST /api/auth/customer/register - should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/customer/register').send({
      ...testCustomer2,
      email: testCustomer.email,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/customer/login - should authenticate customer with valid credentials', async () => {
    const res = await request(app).post('/api/auth/customer/login').send({
      emailOrPhone: testCustomer.email,
      password: testCustomer.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/auth/customer/login - should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/customer/login').send({
      emailOrPhone: testCustomer.email,
      password: 'WrongPassword123!',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/customer/me - should return customer profile', async () => {
    const loginRes = await request(app).post('/api/auth/customer/login').send({
      emailOrPhone: testCustomer.email,
      password: testCustomer.password,
    });
    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/auth/customer/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.customer.email).toBe(testCustomer.email);
  });

  it('POST /api/auth/customer/refresh - should refresh session and return new token', async () => {
    const loginRes = await request(app).post('/api/auth/customer/login').send({
      emailOrPhone: testCustomer.email,
      password: testCustomer.password,
    });

    const cookieHeader = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/customer/refresh')
      .set('Cookie', cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/auth/customer/logout - should clear refresh cookie and revoke session', async () => {
    const loginRes = await request(app).post('/api/auth/customer/login').send({
      emailOrPhone: testCustomer.email,
      password: testCustomer.password,
    });
    const cookieHeader = loginRes.headers['set-cookie'];

    const res = await request(app)
      .post('/api/auth/customer/logout')
      .set('Cookie', cookieHeader);

    expect(res.status).toBe(200);
  });
});
