const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_do_not_use_in_production';

const { connect, clearDatabase, closeDatabase } = require('../setup');
const app = require('../../app');
const User = require('../../models/User');

describe('Auth', () => {
  before(connect);
  after(closeDatabase);
  beforeEach(clearDatabase);

  test('registers a new customer and returns a usable token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      phone: '9800000000',
      password: 'password123',
    });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'CUSTOMER');
    assert.strictEqual(res.body.user.password, undefined);
  });

  test('cannot self-assign the ADMIN role at registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sneaky',
      email: 'sneaky@example.com',
      phone: '9800000001',
      password: 'password123',
      role: 'ADMIN',
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.user.role, 'CUSTOMER');

    const stored = await User.findOne({ email: 'sneaky@example.com' });
    assert.strictEqual(stored.role, 'CUSTOMER');
  });

  test('rejects login with the wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'wrongpass@example.com',
      phone: '9800000002',
      password: 'correctpassword',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'wrongpassword',
    });

    assert.strictEqual(res.status, 401);
  });

  test('a deactivated account is rejected on the next authenticated request', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'To Deactivate',
      email: 'deactivate@example.com',
      phone: '9800000003',
      password: 'password123',
    });
    const token = registerRes.body.token;

    await User.findOneAndUpdate({ email: 'deactivate@example.com' }, { isActive: false });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    assert.strictEqual(res.status, 401);
  });

  test('an unauthenticated request to a protected route is rejected', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
  });
});
