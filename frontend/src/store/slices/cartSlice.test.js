import { describe, it, expect, beforeEach, vi } from 'vitest';
import cartReducer, { addItem, incrementItem, decrementItem, removeItem, clearCart } from './cartSlice';

const momo = { menuItemId: 'momo1', name: 'Chicken Momo', price: 220, discount: 0, image: '', isVeg: false, restaurantId: 'r1', restaurantName: 'Momo Point' };
const chowmein = { menuItemId: 'chow1', name: 'Chicken Chowmein', price: 240, discount: 10, image: '', isVeg: false, restaurantId: 'r1', restaurantName: 'Momo Point' };
const otherRestaurantItem = { menuItemId: 'other1', name: 'Sekuwa', price: 450, discount: 0, image: '', isVeg: false, restaurantId: 'r2', restaurantName: 'Everest Grill' };

describe('cartSlice', () => {
  beforeEach(() => {
    const store = {};
    vi.stubGlobal('localStorage', {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => {
        store[k] = v;
      },
      removeItem: (k) => {
        delete store[k];
      },
    });
  });

  it('adding the first item sets the restaurant and creates one line with quantity 1', () => {
    const state = cartReducer(undefined, addItem(momo));
    expect(state.restaurantId).toBe('r1');
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
  });

  it('adding the same item again increments quantity instead of duplicating the line', () => {
    let state = cartReducer(undefined, addItem(momo));
    state = cartReducer(state, addItem(momo));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('adding a different item from the same restaurant adds a second line', () => {
    let state = cartReducer(undefined, addItem(momo));
    state = cartReducer(state, addItem(chowmein));
    expect(state.items).toHaveLength(2);
  });

  it('incrementItem increases quantity', () => {
    let state = cartReducer(undefined, addItem(chowmein));
    state = cartReducer(state, incrementItem('chow1'));
    expect(state.items[0].quantity).toBe(2);
  });

  it('decrementing to 0 removes the line and resets restaurant context if the cart is now empty', () => {
    let state = cartReducer(undefined, addItem(chowmein));
    state = cartReducer(state, decrementItem('chow1'));
    expect(state.items).toHaveLength(0);
    expect(state.restaurantId).toBeNull();
  });

  it('decrementing one line does not affect other lines', () => {
    let state = cartReducer(undefined, addItem(momo));
    state = cartReducer(state, addItem(chowmein));
    state = cartReducer(state, decrementItem('chow1'));
    expect(state.items.find((i) => i.menuItemId === 'momo1').quantity).toBe(1);
  });

  it('adding an item from a different restaurant replaces the cart rather than mixing items - the safety net for Section 9\'s restaurant validation rule', () => {
    let state = cartReducer(undefined, addItem(momo));
    state = cartReducer(state, addItem(otherRestaurantItem));
    expect(state.restaurantId).toBe('r2');
    expect(state.items).toHaveLength(1);
    expect(state.items[0].menuItemId).toBe('other1');
  });

  it('removeItem removes the line regardless of quantity', () => {
    let state = cartReducer(undefined, addItem(momo));
    state = cartReducer(state, incrementItem('momo1'));
    state = cartReducer(state, removeItem('momo1'));
    expect(state.items).toHaveLength(0);
  });

  it('removing the last item resets restaurantId and restaurantName', () => {
    let state = cartReducer(undefined, addItem(momo));
    state = cartReducer(state, removeItem('momo1'));
    expect(state.restaurantId).toBeNull();
    expect(state.restaurantName).toBe('');
  });

  it('clearCart empties everything', () => {
    let state = cartReducer(undefined, addItem(momo));
    state = cartReducer(state, addItem(chowmein));
    state = cartReducer(state, clearCart());
    expect(state.items).toHaveLength(0);
    expect(state.restaurantId).toBeNull();
  });
});
