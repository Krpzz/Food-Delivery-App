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


router.get('/', getRestaurants);


router.get('/mine', protect, authorize('RESTAURANT', 'ADMIN'), getMyRestaurants);
router.post('/', protect, authorize('RESTAURANT', 'ADMIN'), restaurantImages, restaurantValidation, createRestaurant);
router.put('/:id', protect, authorize('RESTAURANT', 'ADMIN'), restaurantImages, updateRestaurant);
router.delete('/:id', protect, authorize('RESTAURANT', 'ADMIN'), deleteRestaurant);


router.get('/:id', getRestaurantById);

module.exports = router;