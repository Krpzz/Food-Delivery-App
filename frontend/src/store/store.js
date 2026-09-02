import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // cartSlice and restaurantSlice are added in the Cart and Customer System phases.
  },
});
