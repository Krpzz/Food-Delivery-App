const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  getUsers,
  toggleUserActive,
  getAdminRestaurants,
  approveRestaurant,
  suspendRestaurant,
  getAdminOrders,
  getAllCategories,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);

router.get('/restaurants', getAdminRestaurants);
router.put('/restaurants/:id/approve', approveRestaurant);
router.put('/restaurants/:id/suspend', suspendRestaurant);

router.get('/orders', getAdminOrders);

router.get('/categories', getAllCategories);

const couponValidation = [
  body('code').trim().notEmpty().withMessage('Code is required'),
  body('discountType').isIn(['PERCENTAGE', 'FLAT']).withMessage('discountType must be PERCENTAGE or FLAT'),
  body('discountValue').isFloat({ min: 0 }).withMessage('discountValue must be a positive number'),
  body('expiryDate').notEmpty().withMessage('expiryDate is required'),
];

router.get('/coupons', getCoupons);
router.post('/coupons', couponValidation, createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

module.exports = router;
