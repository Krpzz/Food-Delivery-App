import api from './api';

const previewOrder = async (payload) => {
  const { data } = await api.post('/orders/preview', payload);
  return data;
};

export default { previewOrder };