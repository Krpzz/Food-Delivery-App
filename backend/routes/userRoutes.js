const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

const addressValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('area').trim().notEmpty().withMessage('Area is required'),
];

router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addressValidation, createAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

module.exports = router;