const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

const recalculateRestaurantRating = async (restaurantId) => {
  const [stats] = await Review.aggregate([
    { $match: { restaurant: restaurantId } },
    { $group: { _id: '$restaurant', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: stats ? Math.round(stats.avgRating * 10) / 10 : 0,
    ratingCount: stats ? stats.count : 0,
  });
};

const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { orderId, rating, comment } = req.body;

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'You can only review completed orders' });
    }

    const existing = await Review.findOne({ customer: req.user._id, order: order._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already reviewed this order' });
    }

    const review = await Review.create({
      customer: req.user._id,
      restaurant: order.restaurant,
      order: order._id,
      rating,
      comment,
    });

    await recalculateRestaurantRating(order.restaurant);

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

const getRestaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

const getMyReviewForOrder = async (req, res, next) => {
  try {
    const review = await Review.findOne({ order: req.params.orderId, customer: req.user._id });
    res.json({ success: true, review: review || null });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getRestaurantReviews, getMyReviewForOrder };
