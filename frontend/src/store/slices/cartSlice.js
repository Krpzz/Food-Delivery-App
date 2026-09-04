import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'khajago_cart';

const loadCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persist = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        items: state.items,
      })
    );
  } catch {
    
  }
};

const stored = loadCart();

const initialState = {
  restaurantId: stored?.restaurantId || null,
  restaurantName: stored?.restaurantName || '',
  items: stored?.items || [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
   
    addItem: (state, action) => {
      const { menuItemId, name, price, discount, image, isVeg, restaurantId, restaurantName } = action.payload;

      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = [];
      }

      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;

      const existing = state.items.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ menuItemId, name, price, discount, image, isVeg, quantity: 1 });
      }
      persist(state);
    },
    incrementItem: (state, action) => {
      const item = state.items.find((i) => i.menuItemId === action.payload);
      if (item) item.quantity += 1;
      persist(state);
    },
    decrementItem: (state, action) => {
      const item = state.items.find((i) => i.menuItemId === action.payload);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.menuItemId !== action.payload);
        }
      }
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = '';
      }
      persist(state);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.menuItemId !== action.payload);
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = '';
      }
      persist(state);
    },
    clearCart: (state) => {
      state.restaurantId = null;
      state.restaurantName = '';
      state.items = [];
      persist(state);
    },
  },
});

export const { addItem, incrementItem, decrementItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;