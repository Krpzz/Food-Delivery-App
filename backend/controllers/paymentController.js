const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const {
  buildPaymentPayload,
  decodeCallbackData,
  verifyResponseSignature,
  checkTransactionStatus,
} = require('../services/esewaService');

const initiateEsewaPayment = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.body.orderId, customer: req.user._id }).populate('payment');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentMethod !== 'ESEWA' || order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ success: false, message: 'This order is not awaiting eSewa payment' });
    }

    const transactionUuid = `${order.orderNumber}-${Date.now()}`;
    order.payment.transactionId = transactionUuid;
    await order.payment.save();

    const payment = buildPaymentPayload({
      amount: order.subtotal,
      taxAmount: order.tax,
      serviceCharge: order.serviceFee,
      deliveryCharge: order.deliveryFee,
      totalAmount: order.total,
      transactionUuid,
      successUrl: process.env.ESEWA_SUCCESS_URL,
      failureUrl: process.env.ESEWA_FAILURE_URL,
    });

    res.json({ success: true, ...payment });
  } catch (error) {
    next(error);
  }
};

const verifyEsewaPayment = async (req, res, next) => {
  try {
    const decoded = decodeCallbackData(req.body.data);
    if (!verifyResponseSignature(decoded)) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const payment = await Payment.findOne({ transactionId: decoded.transaction_uuid }).populate('order');
    if (!payment || payment.order.customer.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (payment.status === 'SUCCESS') return res.json({ success: true, order: payment.order });
    if (Number(decoded.total_amount) !== payment.amount) {
      return res.status(400).json({ success: false, message: 'Payment amount does not match the order' });
    }

    const status = await checkTransactionStatus({
      productCode: decoded.product_code,
      totalAmount: decoded.total_amount,
      transactionUuid: decoded.transaction_uuid,
    });
    if (status.status !== 'COMPLETE') {
      payment.status = 'FAILED';
      await payment.save();
      payment.order.status = 'PAYMENT_FAILED';
      await payment.order.save();
      return res.status(400).json({ success: false, message: 'eSewa payment was not completed' });
    }

    payment.status = 'SUCCESS';
    payment.paidAt = new Date();
    await payment.save();
    payment.order.status = 'CONFIRMED';
    await payment.order.save();
    res.json({ success: true, order: payment.order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateEsewaPayment,
  verifyEsewaPayment,
  buildPaymentPayload,
  decodeCallbackData,
  verifyResponseSignature,
  checkTransactionStatus,
};