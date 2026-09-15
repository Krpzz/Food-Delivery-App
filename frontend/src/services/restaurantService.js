import api from './api';

const getRestaurants = async (params = {}) => {
  const { data } = await api.get('/restaurants', { params });
  return data;
};

const getRestaurantById = async (id) => {
  const { data } = await api.get(`/restaurants/${id}`);
  return data;
};

const getMyRestaurants = async () => {
  const { data } = await api.get('/restaurants/mine');
  return data;
};

// formData is a FormData instance so it can carry the logo/coverImage files
// alongside the text fields in a single multipart request.
const createRestaurant = async (formData) => {
  const { data } = await api.post('/restaurants', formData);
  return data;
};

const updateRestaurant = async (id, formData) => {
  const { data } = await api.put(`/restaurants/${id}`, formData);
  return data;
};

export default { getRestaurants, getRestaurantById, getMyRestaurants, createRestaurant, updateRestaurant };
