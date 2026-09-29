import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Customer Addresses API', () => {
  let customer1Token: string;
  let customer2Token: string;
  let customer1Id: string;
  let customer2Id: string;
  let address1Id: string;

  beforeAll(async () => {
    // Register Customer 1
    const res1 = await request(app).post('/api/auth/customer/register').send({
      name: 'Address Test Customer 1',
      email: 'addrcust1@example.com',
      phone: '9876500001',
      password: 'Password123!',
    });
    customer1Token = res1.body.data.accessToken;
    customer1Id = res1.body.data.customer.id;

    // Register Customer 2
    const res2 = await request(app).post('/api/auth/customer/register').send({
      name: 'Address Test Customer 2',
      email: 'addrcust2@example.com',
      phone: '9876500002',
      password: 'Password123!',
    });
    customer2Token = res2.body.data.accessToken;
    customer2Id = res2.body.data.customer.id;
  });

  afterAll(async () => {
    await prisma.customer.deleteMany({
      where: { id: { in: [customer1Id, customer2Id] } },
    });
  });

  it('POST /api/customer/addresses - should create a new address and set as default', async () => {
    const res = await request(app)
      .post('/api/customer/addresses')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        fullName: 'Address Test Customer 1',
        phone: '9876500001',
        addressLine1: '123 Luxury Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.address.isDefault).toBe(true);
    address1Id = res.body.data.address.id;
  });

  it('GET /api/customer/addresses - should list addresses for authenticated customer', async () => {
    const res = await request(app)
      .get('/api/customer/addresses')
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.addresses.length).toBe(1);
    expect(res.body.data.addresses[0].id).toBe(address1Id);
  });

  it('PATCH /api/customer/addresses/:id - should update address fields', async () => {
    const res = await request(app)
      .patch(`/api/customer/addresses/${address1Id}`)
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({
        city: 'Navi Mumbai',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.address.city).toBe('Navi Mumbai');
  });

  it('Ownership Isolation - Customer 2 cannot update Customer 1 address', async () => {
    const res = await request(app)
      .patch(`/api/customer/addresses/${address1Id}`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        city: 'Hacked City',
      });

    expect(res.status).toBe(404);
  });

  it('DELETE /api/customer/addresses/:id - should delete address', async () => {
    const res = await request(app)
      .delete(`/api/customer/addresses/${address1Id}`)
      .set('Authorization', `Bearer ${customer1Token}`);

    expect(res.status).toBe(200);
  });
});
