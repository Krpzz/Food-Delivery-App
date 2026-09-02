const express = require('express');
const {
    esewaSuccess,
    esewaFailure,
    initiateEsewaPayment
} = require('../controllers/paymentController');

const router = express.Router();

router.post(
    "/esewa/initiate",
    initiateEsewaPayment
);
router.get(
    "/esewa/success",
    esewaSuccess
);

router.get(
    "/esewa/failure",
    esewaFailure
);

module.exports = router;