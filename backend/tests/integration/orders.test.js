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
const Coupon = require('../../models/Coupon');

const setupOrderFixture = async () => {
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
    isOpen: true,
  });

  const menuItem = await MenuItem.create({
    restaurant: restaurant._id,
    name: 'Test Item',
    price: 500,
    isAvailable: true,
  });

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

  return { restaurant, menuItem, customerToken, customerId: customerRes.body.user._id, address, ownerToken: ownerRes.body.token };
};

describe('Order creation', () => {
  before(connect);
  after(closeDatabase);
  beforeEach(clearDatabase);

  test('charges the real database price, ignoring any price the client sends', async () => {
    const { restaurant, menuItem, customerToken, address } = await setupOrderFixture();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: restaurant._id.toString(),
        items: [{ menuItemId: menuItem._id.toString(), quantity: 2, price: 1 }],
        addressId: address._id.toString(),
        paymentMethod: 'COD',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.order.items[0].price, 500);
    assert.strictEqual(res.body.order.subtotal, 1000);
    assert.notStrictEqual(res.body.order.total, 2);
  });

  test('rejects an order that references a menu item belonging to a different restaurant', async () => {
    const { customerToken, address } = await setupOrderFixture();

    const otherOwnerRes = await request(app).post('/api/auth/register').send({
      name: 'Other Owner',
      email: 'other-owner@example.com',
      phone: '9833333333',
      password: 'password123',
      role: 'RESTAURANT',
    });

    const restaurantA = await Restaurant.create({
      owner: otherOwnerRes.body.user._id,
      name: 'Restaurant A',
      address: 'A',
      city: 'Kathmandu',
      phone: '014000001',
      isApproved: true,
    });
    const restaurantB = await Restaurant.create({
      owner: otherOwnerRes.body.user._id,
      name: 'Restaurant B',
      address: 'B',
      city: 'Kathmandu',
      phone: '014000002',
      isApproved: true,
    });
    const itemFromB = await MenuItem.create({ restaurant: restaurantB._id, name: 'Item B', price: 300, isAvailable: true });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: restaurantA._id.toString(),
        items: [{ menuItemId: itemFromB._id.toString(), quantity: 1 }],
        addressId: address._id.toString(),
        paymentMethod: 'COD',
      });

    assert.strictEqual(res.status, 400);
  });

  test('rejects placing an order against another customer\'s saved address', async () => {
    const { restaurant, menuItem, customerToken } = await setupOrderFixture();

    const otherCustomerRes = await request(app).post('/api/auth/register').send({
      name: 'Other Customer',
      email: 'other-customer@example.com',
      phone: '9844444444',
      password: 'password123',
    });
    const otherAddress = await Address.create({
      user: otherCustomerRes.body.user._id,
      name: 'Other',
      phone: '9844444444',
      city: 'Kathmandu',
      area: 'Thamel',
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: restaurant._id.toString(),
        items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
        addressId: otherAddress._id.toString(),
        paymentMethod: 'COD',
      });

    assert.strictEqual(res.status, 404);
  });

  test('a COD order is CONFIRMED immediately; an ESEWA order starts PENDING_PAYMENT', async () => {
    const { restaurant, menuItem, customerToken, address } = await setupOrderFixture();

    const codRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: restaurant._id.toString(),
        items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
        addressId: address._id.toString(),
        paymentMethod: 'COD',
      });
    assert.strictEqual(codRes.body.order.status, 'CONFIRMED');

    const esewaRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: restaurant._id.toString(),
        items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
        addressId: address._id.toString(),
        paymentMethod: 'ESEWA',
      });
    assert.strictEqual(esewaRes.body.order.status, 'PENDING_PAYMENT');
  });

  test('an expired coupon is rejected even though the discount math would otherwise work', async () => {
    const { restaurant, menuItem, customerToken, address } = await setupOrderFixture();

    await Coupon.create({
      code: 'EXPIRED10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      expiryDate: new Date('2020-01-01'),
    });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: restaurant._id.toString(),
        items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
        addressId: address._id.toString(),
        paymentMethod: 'COD',
        couponCode: 'EXPIRED10',
      });

    assert.strictEqual(res.status, 400);
  });

  test('a restaurant owner cannot skip an order straight from CONFIRMED to COMPLETED', async () => {
    const { restaurant, menuItem, customerToken, address, ownerToken } = await setupOrderFixture();

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: restaurant._id.toString(),
        items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
        addressId: address._id.toString(),
        paymentMethod: 'COD',
      });
    const orderId = orderRes.body.order._id;

    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'COMPLETED' });

    assert.strictEqual(res.status, 400);
  });

  test('a different restaurant owner cannot update this order\'s status', async () => {
    const { restaurant, menuItem, customerToken, address } = await setupOrderFixture();

    const otherOwnerRes = await request(app).post('/api/auth/register').send({
      name: 'Unrelated Owner',
      email: 'unrelated@example.com',
      phone: '9855555555',
      password: 'password123',
      role: 'RESTAURANT',
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
    const orderId = orderRes.body.order._id;

    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${otherOwnerRes.body.token}`)
      .send({ status: 'ACCEPTED' });

    assert.strictEqual(res.status, 403);
  });
});
