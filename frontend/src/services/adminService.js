import api from './api';

const getDashboard = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};

const getUsers = async (params = {}) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

const toggleUserActive = async (id) => {
  const { data } = await api.put(`/admin/users/${id}/toggle-active`);
  return data;
};

const getRestaurants = async (params = {}) => {
  const { data } = await api.get('/admin/restaurants', { params });
  return data;
};

const approveRestaurant = async (id) => {
  const { data } = await api.put(`/admin/restaurants/${id}/approve`);
  return data;
};

const suspendRestaurant = async (id) => {
  const { data } = await api.put(`/admin/restaurants/${id}/suspend`);
  return data;
};

const getOrders = async (params = {}) => {
  const { data } = await api.get('/admin/orders', { params });
  return data;
};

const getCategories = async () => {
  const { data } = await api.get('/admin/categories');
  return data;
};

const getCoupons = async () => {
  const { data } = await api.get('/admin/coupons');
  return data;
};

const createCoupon = async (payload) => {
  const { data } = await api.post('/admin/coupons', payload);
  return data;
};

const updateCoupon = async (id, payload) => {
  const { data } = await api.put(`/admin/coupons/${id}`, payload);
  return data;
};

const deleteCoupon = async (id) => {
  const { data } = await api.delete(`/admin/coupons/${id}`);
  return data;
};

export default {
  getDashboard,
  getUsers,
  toggleUserActive,
  getRestaurants,
  approveRestaurant,
  suspendRestaurant,
  getOrders,
  getCategories,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
