const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');

const router = express.Router();

// Address CRUD lands here in the Customer System / Checkout phase.
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
