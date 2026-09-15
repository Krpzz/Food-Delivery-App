const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_do_not_use_in_production';
process.env.SEED_ADMIN_EMAIL = 'admin@example.com';

const { connect, clearDatabase, closeDatabase } = require('../setup');
const app = require('../../app');
const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');

const createAdmin = async () => {
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    phone: '9800000099',
    password: 'password123',
    role: 'ADMIN',
  });
  const loginRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
  return { admin, token: loginRes.body.token };
};

describe('Admin access control', () => {
  before(connect);
  after(closeDatabase);
  beforeEach(clearDatabase);

  test('an unauthenticated request to any admin route is rejected', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    assert.strictEqual(res.status, 401);
  });

  test('a logged-in customer cannot access admin routes', async () => {
    const customerRes = await request(app).post('/api/auth/register').send({
      name: 'Customer',
      email: 'customer@example.com',
      phone: '9822222222',
      password: 'password123',
    });

    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${customerRes.body.token}`);
    assert.strictEqual(res.status, 403);
  });

  test('a logged-in restaurant owner cannot access admin routes', async () => {
    const ownerRes = await request(app).post('/api/auth/register').send({
      name: 'Owner',
      email: 'owner@example.com',
      phone: '9811111111',
      password: 'password123',
      role: 'RESTAURANT',
    });

    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${ownerRes.body.token}`);
    assert.strictEqual(res.status, 403);
  });

  test('an admin can approve a pending restaurant, and it then appears in public browsing', async () => {
    const { token } = await createAdmin();

    const ownerRes = await request(app).post('/api/auth/register').send({
      name: 'Owner',
      email: 'owner2@example.com',
      phone: '9833333333',
      password: 'password123',
      role: 'RESTAURANT',
    });

    const restaurant = await Restaurant.create({
      owner: ownerRes.body.user._id,
      name: 'Pending Restaurant',
      address: 'Somewhere',
      city: 'Kathmandu',
      phone: '014000000',
      isApproved: false,
    });

    const approveRes = await request(app)
      .put(`/api/admin/restaurants/${restaurant._id}/approve`)
      .set('Authorization', `Bearer ${token}`);
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.body.restaurant.isApproved, true);

    const browseRes = await request(app).get('/api/restaurants');
    assert.ok(browseRes.body.restaurants.some((r) => r.name === 'Pending Restaurant'));
  });

  test('an admin cannot deactivate their own account', async () => {
    const { admin, token } = await createAdmin();

    const res = await request(app).put(`/api/admin/users/${admin._id}/toggle-active`).set('Authorization', `Bearer ${token}`);
    assert.strictEqual(res.status, 400);
  });

  test('a deactivated user is immediately blocked from further requests', async () => {
    const { token: adminToken } = await createAdmin();

    const customerRes = await request(app).post('/api/auth/register').send({
      name: 'To Deactivate',
      email: 'deactivateme@example.com',
      phone: '9844444444',
      password: 'password123',
    });

    await request(app)
      .put(`/api/admin/users/${customerRes.body.user._id}/toggle-active`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${customerRes.body.token}`);
    assert.strictEqual(res.status, 401);
  });
});
