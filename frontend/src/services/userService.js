import api from './api';

const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

const updateProfile = async (payload) => {
  const { data } = await api.put('/users/profile', payload);
  return data;
};

const getAddresses = async () => {
  const { data } = await api.get('/users/addresses');
  return data;
};

const createAddress = async (payload) => {
  const { data } = await api.post('/users/addresses', payload);
  return data;
};

const updateAddress = async (id, payload) => {
  const { data } = await api.put(`/users/addresses/${id}`, payload);
  return data;
};

const deleteAddress = async (id) => {
  const { data } = await api.delete(`/users/addresses/${id}`);
  return data;
};

export default { getProfile, updateProfile, getAddresses, createAddress, updateAddress, deleteAddress };