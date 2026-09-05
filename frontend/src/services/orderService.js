import api from './api';

const previewOrder = async (payload) => {
  const { data } = await api.post('/orders/preview', payload);
  return data;
};

const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data;
};

const getOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

const cancelOrder = async (id) => {
  const { data } = await api.put(`/orders/${id}/cancel`);
  return data;
};

const getRestaurantOrders = async (restaurantId, params = {}) => {
  const { data } = await api.get(`/orders/restaurant/${restaurantId}`, { params });
  return data;
};

const getRestaurantOrderStats = async (restaurantId) => {
  const { data } = await api.get(`/orders/restaurant/${restaurantId}/stats`);
  return data;
};

const updateOrderStatus = async (id, status) => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data;
};

export default {
  previewOrder,
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  getRestaurantOrderStats,
  updateOrderStatus,
};