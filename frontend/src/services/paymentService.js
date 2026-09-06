import api from './api';

const initiateEsewaPayment = async (orderId) => {
  const { data } = await api.post('/payments/esewa/initiate', { orderId });
  return data;
};

const verifyEsewaPayment = async (encodedData) => {
  const { data } = await api.post('/payments/esewa/verify', { data: encodedData });
  return data;
};

export default { initiateEsewaPayment, verifyEsewaPayment };