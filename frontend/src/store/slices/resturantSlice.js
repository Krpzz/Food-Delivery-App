import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import restaurantService from '../../services/resturantService';

const initialState = {
  myRestaurants: [],
  activeRestaurantId: null,
  isLoading: false,
  error: null,
};

export const fetchMyRestaurants = createAsyncThunk('restaurant/fetchMine', async (_, thunkAPI) => {
  try {
    return await restaurantService.getMyRestaurants();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createRestaurant = createAsyncThunk('restaurant/create', async (formData, thunkAPI) => {
  try {
    return await restaurantService.createRestaurant(formData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateRestaurant = createAsyncThunk('restaurant/update', async ({ id, formData }, thunkAPI) => {
  try {
    return await restaurantService.updateRestaurant(id, formData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setActiveRestaurant: (state, action) => {
      state.activeRestaurantId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRestaurants = action.payload.restaurants;
        if (!state.activeRestaurantId && action.payload.restaurants.length > 0) {
          state.activeRestaurantId = action.payload.restaurants[0]._id;
        }
      })
      .addCase(fetchMyRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.myRestaurants.push(action.payload.restaurant);
        state.activeRestaurantId = action.payload.restaurant._id;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        const idx = state.myRestaurants.findIndex((r) => r._id === action.payload.restaurant._id);
        if (idx !== -1) state.myRestaurants[idx] = action.payload.restaurant;
      });
  },
});

export const { setActiveRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;