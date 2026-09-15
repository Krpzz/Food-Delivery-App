const { test, describe } = require('node:test');
const assert = require('node:assert');
const calculateOrderTotal = require('../../utils/calculateOrderTotal');

describe('calculateOrderTotal', () => {
  test('applies per-item discount correctly to the subtotal', () => {
    const result = calculateOrderTotal({
      items: [
        { price: 220, discount: 0, quantity: 2 },
        { price: 240, discount: 10, quantity: 1 },
      ],
    });
    assert.strictEqual(result.subtotal, 656);
  });

  test('delivery fee is a flat 60', () => {
    const result = calculateOrderTotal({ items: [{ price: 100, discount: 0, quantity: 1 }] });
    assert.strictEqual(result.deliveryFee, 60);
  });

  test('service fee is 2% of subtotal, rounded', () => {
    const result = calculateOrderTotal({ items: [{ price: 656, discount: 0, quantity: 1 }] });
    assert.strictEqual(result.serviceFee, 13);
  });

  test('tax is 13% of subtotal, rounded (Nepal VAT)', () => {
    const result = calculateOrderTotal({ items: [{ price: 656, discount: 0, quantity: 1 }] });
    assert.strictEqual(result.tax, 85);
  });

  test('no coupon means zero discount', () => {
    const result = calculateOrderTotal({ items: [{ price: 100, discount: 0, quantity: 1 }] });
    assert.strictEqual(result.discount, 0);
  });

  test('total equals subtotal + fees - discount', () => {
    const result = calculateOrderTotal({
      items: [
        { price: 220, discount: 0, quantity: 2 },
        { price: 240, discount: 10, quantity: 1 },
      ],
    });
    assert.strictEqual(result.total, result.subtotal + result.deliveryFee + result.serviceFee + result.tax - result.discount);
  });

  test('percentage coupon applies exactly at its cap', () => {
    const result = calculateOrderTotal({
      items: [{ price: 1000, discount: 0, quantity: 1 }],
      coupon: { discountType: 'PERCENTAGE', discountValue: 20, maximumDiscount: 200 },
    });
    assert.strictEqual(result.discount, 200);
  });

  test('percentage coupon is capped by maximumDiscount even when the raw percentage is higher', () => {
    const result = calculateOrderTotal({
      items: [{ price: 2000, discount: 0, quantity: 1 }],
      coupon: { discountType: 'PERCENTAGE', discountValue: 20, maximumDiscount: 200 },
    });
    assert.strictEqual(result.discount, 200);
  });

  test('flat coupon larger than the subtotal is capped at the subtotal, never applied raw', () => {
    const result = calculateOrderTotal({
      items: [{ price: 50, discount: 0, quantity: 1 }],
      coupon: { discountType: 'FLAT', discountValue: 500 },
    });
    assert.strictEqual(result.discount, 50);
    assert.ok(result.total >= 0, 'total must never go negative even with an oversized flat coupon');
  });

  test('flat coupon under the subtotal applies at face value', () => {
    const result = calculateOrderTotal({
      items: [{ price: 1000, discount: 0, quantity: 1 }],
      coupon: { discountType: 'FLAT', discountValue: 50 },
    });
    assert.strictEqual(result.discount, 50);
  });

  test('getEffectivePrice matches the ratio used internally by calculateOrderTotal', () => {
    const item = { price: 220, discount: 10 };
    assert.strictEqual(calculateOrderTotal.getEffectivePrice(item), 198);
    const result = calculateOrderTotal({ items: [{ ...item, quantity: 1 }] });
    assert.strictEqual(result.subtotal, 198);
  });
});
