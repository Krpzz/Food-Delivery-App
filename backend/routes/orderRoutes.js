const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { previewOrder } = require('../controllers/orderController');

const router = express.Router();

router.post('/preview', protect, previewOrder);

module.exports = router;