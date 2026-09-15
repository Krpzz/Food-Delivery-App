const Order = require('../models/Order');
const Payment = require('../models/Payment');
const esewaService = require('../services/esewaService');

const initiateEsewaPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.paymentMethod !== 'ESEWA') {
      return res.status(400).json({ success: false, message: 'This order is not set up for eSewa payment' });
    }
    if (order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ success: false, message: 'This order is not awaiting payment' });
    }

    const { formUrl, fields } = esewaService.buildPaymentPayload({
      amount: order.subtotal - order.discount,
      taxAmount: order.tax,
      serviceCharge: order.serviceFee,
      deliveryCharge: order.deliveryFee,
      totalAmount: order.total,
      transactionUuid: order.orderNumber,
      successUrl: process.env.ESEWA_SUCCESS_URL,
      failureUrl: process.env.ESEWA_FAILURE_URL,
    });

    res.json({ success: true, formUrl, fields });
  } catch (error) {
    next(error);
  }
};

const verifyEsewaPayment = async (req, res, next) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: 'Missing payment response data' });
    }

    const decoded = esewaService.decodeCallbackData(data);

    const order = await Order.findOne({ orderNumber: decoded.transaction_uuid, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this payment' });
    }

    if (order.status === 'CONFIRMED') {
      return res.json({ success: true, order, message: 'This payment was already confirmed' });
    }

    if (!esewaService.verifyResponseSignature(decoded)) {
      return res.status(400).json({ success: false, message: 'Payment response failed signature verification' });
    }

    const statusResult = await esewaService.checkTransactionStatus({
      productCode: decoded.product_code,
      totalAmount: order.total,
      transactionUuid: order.orderNumber,
    });

    const payment = order.payment ? await Payment.findById(order.payment) : null;

    if (statusResult.status === 'COMPLETE') {
      if (Number(statusResult.totalAmount) !== order.total) {
        return res.status(400).json({ success: false, message: 'Payment amount does not match the order total' });
      }

      order.status = 'CONFIRMED';
      await order.save();

      if (payment) {
        payment.status = 'SUCCESS';
        payment.transactionId = statusResult.refId || decoded.transaction_code;
        payment.paidAt = new Date();
        await payment.save();
      }

      return res.json({ success: true, order });
    }

    order.status = 'PAYMENT_FAILED';
    await order.save();
    if (payment) {
      payment.status = 'FAILED';
      await payment.save();
    }

    res.status(400).json({
      success: false,
      message: `Payment ${(statusResult.status || 'failed').toLowerCase().replace('_', ' ')}`,
      status: statusResult.status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { initiateEsewaPayment, verifyEsewaPayment };
