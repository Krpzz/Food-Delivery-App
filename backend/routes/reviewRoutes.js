const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { createReview, getRestaurantReviews, getMyReviewForOrder } = require('../controllers/reviewController');

const router = express.Router();

const reviewValidation = [
  body('orderId').notEmpty().withMessage('orderId is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment is too long'),
];

router.post('/', protect, reviewValidation, createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/order/:orderId', protect, getMyReviewForOrder);

module.exports = router;
