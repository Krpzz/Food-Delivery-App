const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItemsByRestaurant,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');

const router = express.Router();

const menuItemValidation = [
  body('restaurant').notEmpty().withMessage('restaurant is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

// --- Categories --- ('/categories' must be registered before '/:id')
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('RESTAURANT', 'ADMIN'), upload.single('image'), createCategory);
router.put('/categories/:id', protect, authorize('ADMIN'), upload.single('image'), updateCategory);
router.delete('/categories/:id', protect, authorize('ADMIN'), deleteCategory);

// --- Menu items ---
router.get('/restaurant/:restaurantId', getMenuItemsByRestaurant);
router.post('/', protect, authorize('RESTAURANT', 'ADMIN'), upload.single('image'), menuItemValidation, createMenuItem);
router.get('/:id', getMenuItem);
router.put('/:id', protect, authorize('RESTAURANT', 'ADMIN'), upload.single('image'), updateMenuItem);
router.delete('/:id', protect, authorize('RESTAURANT', 'ADMIN'), deleteMenuItem);

module.exports = router;