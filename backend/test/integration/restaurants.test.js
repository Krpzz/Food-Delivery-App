const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_do_not_use_in_production';

const { connect, clearDatabase, closeDatabase } = require('../setup');
const app = require('../../app');

const registerRestaurantOwner = async (email) => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Owner',
    email,
    phone: '9811111111',
    password: 'password123',
    role: 'RESTAURANT',
  });
  return res.body.token;
};

describe('Restaurants', () => {
  before(connect);
  after(closeDatabase);
  beforeEach(clearDatabase);

  test('a new restaurant defaults to isApproved: false, even if the request tries to set it true', async () => {
    const token = await registerRestaurantOwner('owner1@example.com');

    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test Restaurant')
      .field('address', 'Somewhere')
      .field('city', 'Kathmandu')
      .field('phone', '014000000')
      .field('isApproved', 'true');

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.restaurant.isApproved, false);
  });

  test('an unapproved restaurant does not appear in public browsing', async () => {
    const token = await registerRestaurantOwner('owner2@example.com');
    await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Hidden Restaurant')
      .field('address', 'Somewhere')
      .field('city', 'Kathmandu')
      .field('phone', '014000001');

    const res = await request(app).get('/api/restaurants');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.restaurants.find((r) => r.name === 'Hidden Restaurant'), undefined);
  });

  test('an owner cannot update a restaurant they do not own', async () => {
    const ownerAToken = await registerRestaurantOwner('ownerA@example.com');
    const ownerBToken = await registerRestaurantOwner('ownerB@example.com');

    const createRes = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${ownerAToken}`)
      .field('name', "Owner A's Restaurant")
      .field('address', 'Somewhere')
      .field('city', 'Kathmandu')
      .field('phone', '014000002');

    const restaurantId = createRes.body.restaurant._id;

    const updateRes = await request(app)
      .put(`/api/restaurants/${restaurantId}`)
      .set('Authorization', `Bearer ${ownerBToken}`)
      .field('name', 'Hijacked Name');

    assert.strictEqual(updateRes.status, 403);
  });

  test('an owner can update their own restaurant, but still cannot flip isApproved via update', async () => {
    const token = await registerRestaurantOwner('owner3@example.com');
    const createRes = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Original Name')
      .field('address', 'Somewhere')
      .field('city', 'Kathmandu')
      .field('phone', '014000003');

    const restaurantId = createRes.body.restaurant._id;

    const updateRes = await request(app)
      .put(`/api/restaurants/${restaurantId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Updated Name')
      .field('isApproved', 'true');

    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.restaurant.name, 'Updated Name');
    assert.strictEqual(updateRes.body.restaurant.isApproved, false);
  });

  test('a customer cannot create a restaurant', async () => {
    const customerRes = await request(app).post('/api/auth/register').send({
      name: 'Just A Customer',
      email: 'customer@example.com',
      phone: '9822222222',
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${customerRes.body.token}`)
      .field('name', 'Should Not Work')
      .field('address', 'Somewhere')
      .field('city', 'Kathmandu')
      .field('phone', '014000004');

    assert.strictEqual(res.status, 403);
  });
});
