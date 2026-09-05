const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');
const {
  previewOrder,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  getRestaurantOrderStats,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/preview', protect, previewOrder);
router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);

router.get('/restaurant/:restaurantId/stats', protect, authorize('RESTAURANT', 'ADMIN'), getRestaurantOrderStats);
router.get('/restaurant/:restaurantId', protect, authorize('RESTAURANT', 'ADMIN'), getRestaurantOrders);

router.put('/:id/status', protect, authorize('RESTAURANT', 'ADMIN'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/:id', protect, getOrderById);

module.exports = router;