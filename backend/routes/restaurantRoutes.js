const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getRestaurants,
  getRestaurantById,
  getMyRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');

const router = express.Router();

const restaurantImages = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

const restaurantValidation = [
  body('name').trim().notEmpty().withMessage('Restaurant name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
];

// --- Public browsing ---
router.get('/', getRestaurants);

// --- Owner-scoped ---
// Registered BEFORE '/:id' — Express matches routes in order, and '/mine'
// would otherwise be captured as an :id value.
router.get('/mine', protect, authorize('RESTAURANT', 'ADMIN'), getMyRestaurants);
router.post('/', protect, authorize('RESTAURANT', 'ADMIN'), restaurantImages, restaurantValidation, createRestaurant);
router.put('/:id', protect, authorize('RESTAURANT', 'ADMIN'), restaurantImages, updateRestaurant);
router.delete('/:id', protect, authorize('RESTAURANT', 'ADMIN'), deleteRestaurant);

// --- Public browsing (param route, must come after the literal '/mine') ---
router.get('/:id', getRestaurantById);

module.exports = router;
