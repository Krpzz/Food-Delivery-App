const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_do_not_use_in_production';

const { connect, clearDatabase, closeDatabase } = require('../setup');
const app = require('../../app');
const Restaurant = require('../../models/Restaurant');
const MenuItem = require('../../models/MenuItem');
const Address = require('../../models/Address');
const Order = require('../../models/Order');

const createCompletedOrder = async () => {
  const ownerRes = await request(app).post('/api/auth/register').send({
    name: 'Owner',
    email: 'owner@example.com',
    phone: '9811111111',
    password: 'password123',
    role: 'RESTAURANT',
  });
  const restaurant = await Restaurant.create({
    owner: ownerRes.body.user._id,
    name: 'Test Restaurant',
    address: 'Somewhere',
    city: 'Kathmandu',
    phone: '014000000',
    isApproved: true,
  });
  const menuItem = await MenuItem.create({ restaurant: restaurant._id, name: 'Item', price: 300, isAvailable: true });

  const customerRes = await request(app).post('/api/auth/register').send({
    name: 'Customer',
    email: 'customer@example.com',
    phone: '9822222222',
    password: 'password123',
  });
  const customerToken = customerRes.body.token;

  const address = await Address.create({
    user: customerRes.body.user._id,
    name: 'Customer',
    phone: '9822222222',
    city: 'Kathmandu',
    area: 'Baluwatar',
  });

  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      restaurantId: restaurant._id.toString(),
      items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
      addressId: address._id.toString(),
      paymentMethod: 'COD',
    });

  await Order.findByIdAndUpdate(orderRes.body.order._id, { status: 'COMPLETED' });

  return { orderId: orderRes.body.order._id, restaurantId: restaurant._id, customerToken };
};

describe('Reviews', () => {
  before(connect);
  after(closeDatabase);
  beforeEach(clearDatabase);

  test('cannot review an order that is not completed', async () => {
    const ownerRes = await request(app).post('/api/auth/register').send({
      name: 'Owner',
      email: 'owner@example.com',
      phone: '9811111111',
      password: 'password123',
      role: 'RESTAURANT',
    });
    const restaurant = await Restaurant.create({
      owner: ownerRes.body.user._id,
      name: 'Test Restaurant',
      address: 'Somewhere',
      city: 'Kathmandu',
      phone: '014000000',
      isApproved: true,
    });
    const menuItem = await MenuItem.create({ restaurant: restaurant._id, name: 'Item', price: 300, isAvailable: true });
    const customerRes = await request(app).post('/api/auth/register').send({
      name: 'Customer',
      email: 'customer@example.com',
      phone: '9822222222',
      password: 'password123',
    });
    const address = await Address.create({
      user: customerRes.body.user._id,
      name: 'Customer',
      phone: '9822222222',
      city: 'Kathmandu',
      area: 'Baluwatar',
    });
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerRes.body.token}`)
      .send({
        restaurantId: restaurant._id.toString(),
        items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
        addressId: address._id.toString(),
        paymentMethod: 'COD',
      });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerRes.body.token}`)
      .send({ orderId: orderRes.body.order._id, rating: 5, comment: 'Too soon' });

    assert.strictEqual(res.status, 400);
  });

  test('can review a completed order, and the restaurant rating updates', async () => {
    const { orderId, restaurantId, customerToken } = await createCompletedOrder();

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, rating: 4, comment: 'Pretty good' });

    assert.strictEqual(res.status, 201);

    const restaurant = await Restaurant.findById(restaurantId);
    assert.strictEqual(restaurant.rating, 4);
    assert.strictEqual(restaurant.ratingCount, 1);
  });

  test('cannot review the same order twice', async () => {
    const { orderId, customerToken } = await createCompletedOrder();

    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, rating: 5, comment: 'First review' });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, rating: 1, comment: 'Trying again' });

    assert.strictEqual(res.status, 409);
  });

  test('rejects a rating outside the 1-5 range', async () => {
    const { orderId, customerToken } = await createCompletedOrder();

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, rating: 7 });

    assert.strictEqual(res.status, 400);
  });
});
