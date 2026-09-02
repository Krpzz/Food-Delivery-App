import api from './api';

const register = async (formData) => {
  const { data } = await api.post('/auth/register', formData);
  return data;
};

const login = async (formData) => {
  const { data } = await api.post('/auth/login', formData);
  return data;
};

const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export default { register, login, getMe };
