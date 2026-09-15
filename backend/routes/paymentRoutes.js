const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { initiateEsewaPayment, verifyEsewaPayment } = require('../controllers/paymentController');

const router = express.Router();

router.post('/esewa/initiate', protect, initiateEsewaPayment);
router.post('/esewa/verify', protect, verifyEsewaPayment);

module.exports = router;
