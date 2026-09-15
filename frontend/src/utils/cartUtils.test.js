import { describe, it, expect } from 'vitest';
import { getItemEffectivePrice, getCartSubtotal, getCartItemCount } from './cartUtils';

describe('cartUtils', () => {
  it('returns the original price when there is no discount', () => {
    expect(getItemEffectivePrice({ price: 200, discount: 0 })).toBe(200);
  });

  it('applies a percentage discount and rounds to the nearest rupee', () => {
    expect(getItemEffectivePrice({ price: 240, discount: 10 })).toBe(216);
  });

  it('sums effective price times quantity across all cart items', () => {
    const items = [
      { price: 220, discount: 0, quantity: 2 },
      { price: 240, discount: 10, quantity: 1 },
    ];
    expect(getCartSubtotal(items)).toBe(220 * 2 + 216);
  });

  it('counts total quantity across all items, not line count', () => {
    const items = [{ quantity: 2 }, { quantity: 3 }];
    expect(getCartItemCount(items)).toBe(5);
  });

  it('an empty cart has zero subtotal and zero item count', () => {
    expect(getCartSubtotal([])).toBe(0);
    expect(getCartItemCount([])).toBe(0);
  });
});
