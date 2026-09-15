const { test, describe } = require('node:test');
const assert = require('node:assert');
const { VALID_TRANSITIONS, CANCELLABLE_STATUSES, generateOrderNumber } = require('../../controllers/orderController');

describe('order status transitions', () => {
  test('a new order (CONFIRMED) can only move to ACCEPTED or REJECTED', () => {
    assert.deepStrictEqual(VALID_TRANSITIONS.CONFIRMED.sort(), ['ACCEPTED', 'REJECTED'].sort());
  });

  test('ACCEPTED can only move to PREPARING', () => {
    assert.deepStrictEqual(VALID_TRANSITIONS.ACCEPTED, ['PREPARING']);
  });

  test('PREPARING can only move to READY', () => {
    assert.deepStrictEqual(VALID_TRANSITIONS.PREPARING, ['READY']);
  });

  test('READY can only move to COMPLETED', () => {
    assert.deepStrictEqual(VALID_TRANSITIONS.READY, ['COMPLETED']);
  });

  test('an order cannot skip straight from CONFIRMED to PREPARING', () => {
    assert.ok(!VALID_TRANSITIONS.CONFIRMED.includes('PREPARING'));
  });

  test('an order cannot move backwards from PREPARING to ACCEPTED', () => {
    assert.ok(!VALID_TRANSITIONS.PREPARING.includes('ACCEPTED'));
  });

  test('COMPLETED has no further transitions defined', () => {
    assert.strictEqual(VALID_TRANSITIONS.COMPLETED, undefined);
  });
});

describe('order cancellation eligibility', () => {
  test('PENDING_PAYMENT, CONFIRMED, and ACCEPTED orders are cancellable', () => {
    assert.deepStrictEqual(CANCELLABLE_STATUSES.sort(), ['ACCEPTED', 'CONFIRMED', 'PENDING_PAYMENT'].sort());
  });

  test('PREPARING is not cancellable - the restaurant has already started cooking', () => {
    assert.ok(!CANCELLABLE_STATUSES.includes('PREPARING'));
  });

  test('COMPLETED is not cancellable', () => {
    assert.ok(!CANCELLABLE_STATUSES.includes('COMPLETED'));
  });
});

describe('generateOrderNumber', () => {
  test('matches the expected ORD-<timestamp36>-<8 hex chars> format', () => {
    assert.match(generateOrderNumber(), /^ORD-[0-9A-Z]+-[0-9A-F]{8}$/);
  });

  test('produces no collisions across 50,000 generations', () => {
    const numbers = new Set();
    for (let i = 0; i < 50000; i++) numbers.add(generateOrderNumber());
    assert.strictEqual(numbers.size, 50000);
  });
});
