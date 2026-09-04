import api from './api';

const getMenuItems = async (params = {}) => {
  const { data } = await api.get('/menu', { params });
  return data;
};

const getCategories = async () => {
  const { data } = await api.get('/menu/categories');
  return data;
};

const createCategory = async (formData) => {
  const { data } = await api.post('/menu/categories', formData);
  return data;
};

const getMenuItemsByRestaurant = async (restaurantId, params = {}) => {
  const { data } = await api.get(`/menu/restaurant/${restaurantId}`, { params });
  return data;
};

const getMenuItem = async (id) => {
  const { data } = await api.get(`/menu/${id}`);
  return data;
};

const createMenuItem = async (formData) => {
  const { data } = await api.post('/menu', formData);
  return data;
};

const updateMenuItem = async (id, formData) => {
  const { data } = await api.put(`/menu/${id}`, formData);
  return data;
};

const deleteMenuItem = async (id) => {
  const { data } = await api.delete(`/menu/${id}`);
  return data;
};

export default {
  getCategories,
  createCategory,
  getMenuItems,
  getMenuItemsByRestaurant,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};