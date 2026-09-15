import api from './api';

const createReview = async (payload) => {
  const { data } = await api.post('/reviews', payload);
  return data;
};

const getRestaurantReviews = async (restaurantId) => {
  const { data } = await api.get(`/reviews/restaurant/${restaurantId}`);
  return data;
};

const getMyReviewForOrder = async (orderId) => {
  const { data } = await api.get(`/reviews/order/${orderId}`);
  return data;
};

export default { createReview, getRestaurantReviews, getMyReviewForOrder };
