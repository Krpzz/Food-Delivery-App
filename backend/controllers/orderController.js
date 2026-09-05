const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const Address = require('../models/Address');
const Coupon = require('../models/Coupon');
const calculateOrderTotal = require('../utils/calculateOrderTotal');

const CANCELLABLE_STATUSES = ['PENDING_PAYMENT', 'CONFIRMED', 'ACCEPTED'];

const VALID_TRANSITIONS = {
  CONFIRMED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['PREPARING'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
};

const generateOrderNumber = () => `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const validateCoupon = async (code, subtotal) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) {
    const err = new Error('Coupon not found or inactive');
    err.statusCode = 404;
    throw err;
  }
  if (coupon.expiryDate < new Date()) {
    const err = new Error('This coupon has expired');
    err.statusCode = 400;
    throw err;
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    const err = new Error('This coupon has reached its usage limit');
    err.statusCode = 400;
    throw err;
  }
  if (subtotal < coupon.minimumOrder) {
    const err = new Error(`This coupon needs a minimum order of NPR ${coupon.minimumOrder}`);
    err.statusCode = 400;
    throw err;
  }
  return coupon;
};

const previewOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, couponCode } = req.body;

    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'restaurantId and at least one item are required' });
    }

    const restaurant = await Restaurant.findOne({ _id: restaurantId, isApproved: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const dbItems = await MenuItem.find({ _id: { $in: menuItemIds }, restaurant: restaurantId, isAvailable: true });

    if (dbItems.length !== items.length) {
      return res
        .status(400)
        .json({ success: false, message: 'One or more items are unavailable or do not belong to this restaurant' });
    }

    const pricedItems = items.map((reqItem) => {
      const dbItem = dbItems.find((d) => d._id.toString() === reqItem.menuItemId);
      return {
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        discount: dbItem.discount,
        quantity: reqItem.quantity,
      };
    });

    const { subtotal } = calculateOrderTotal({ items: pricedItems });

    let coupon = null;
    if (couponCode) {
      coupon = await validateCoupon(couponCode, subtotal);
    }

    const totals = calculateOrderTotal({ items: pricedItems, coupon });

    res.json({
      success: true,
      items: pricedItems,
      coupon: coupon ? { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue } : null,
      ...totals,
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, addressId, couponCode, paymentMethod } = req.body;

    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'restaurantId and at least one item are required' });
    }
    if (!addressId) {
      return res.status(400).json({ success: false, message: 'A delivery address is required' });
    }
    if (!['ESEWA', 'COD'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }
    if (paymentMethod === 'ESEWA') {
      return res
        .status(400)
        .json({ success: false, message: 'eSewa checkout is not available yet. Select Cash on Delivery for now.' });
    }

    const restaurant = await Restaurant.findOne({ _id: restaurantId, isApproved: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (!restaurant.isOpen) {
      return res.status(400).json({ success: false, message: 'This restaurant is currently closed' });
    }

    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Delivery address not found' });
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const dbItems = await MenuItem.find({ _id: { $in: menuItemIds }, restaurant: restaurantId, isAvailable: true });

    if (dbItems.length !== items.length) {
      return res
        .status(400)
        .json({ success: false, message: 'One or more items are unavailable or do not belong to this restaurant' });
    }

    const pricingInput = items.map((reqItem) => {
      const dbItem = dbItems.find((d) => d._id.toString() === reqItem.menuItemId);
      return { price: dbItem.price, discount: dbItem.discount, quantity: reqItem.quantity };
    });

    const { subtotal: preSubtotal } = calculateOrderTotal({ items: pricingInput });

    let coupon = null;
    if (couponCode) {
      coupon = await validateCoupon(couponCode, preSubtotal);
    }

    const totals = calculateOrderTotal({ items: pricingInput, coupon });

    const orderItems = items.map((reqItem) => {
      const dbItem = dbItems.find((d) => d._id.toString() === reqItem.menuItemId);
      const effectivePrice = calculateOrderTotal.getEffectivePrice(dbItem);
      return {
        menuItem: dbItem._id,
        name: dbItem.name,
        price: effectivePrice,
        quantity: reqItem.quantity,
        subtotal: effectivePrice * reqItem.quantity,
      };
    });

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: req.user._id,
      restaurant: restaurant._id,
      items: orderItems,
      deliveryAddress: {
        name: address.name,
        phone: address.phone,
        city: address.city,
        area: address.area,
        street: address.street,
        landmark: address.landmark,
        latitude: address.latitude,
        longitude: address.longitude,
      },
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      serviceFee: totals.serviceFee,
      tax: totals.tax,
      discount: totals.discount,
      coupon: coupon ? coupon._id : undefined,
      total: totals.total,
      paymentMethod,
      status: 'CONFIRMED',
    });

    const payment = await Payment.create({
      order: order._id,
      method: paymentMethod,
      status: 'PENDING',
      amount: totals.total,
    });

    order.payment = payment._id;
    await order.save();

    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name city logo')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant', 'name city logo phone owner');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isRestaurantOwner = order.restaurant.owner.toString() === req.user._id.toString();

    if (!isCustomer && !isRestaurantOwner && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You cannot view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return res
        .status(400)
        .json({ success: false, message: `Orders that are already ${order.status.toLowerCase()} can't be cancelled` });
    }

    order.status = 'CANCELLED';
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not manage this restaurant' });
    }

    const { status } = req.query;
    const filter = { restaurant: restaurant._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter).populate('customer', 'name phone').sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

const getRestaurantOrderStats = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not manage this restaurant' });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayOrders, pending, preparing, completedToday] = await Promise.all([
      Order.countDocuments({ restaurant: restaurant._id, createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ restaurant: restaurant._id, status: 'CONFIRMED' }),
      Order.countDocuments({ restaurant: restaurant._id, status: 'PREPARING' }),
      Order.find({ restaurant: restaurant._id, status: 'COMPLETED', createdAt: { $gte: startOfToday } }),
    ]);

    const todayRevenue = completedToday.reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      stats: { todayOrders, pending, preparing, completed: completedToday.length, todayRevenue },
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const restaurant = await Restaurant.findById(order.restaurant);
    if (!restaurant || (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'You do not manage this restaurant' });
    }

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot move an order from ${order.status} to ${status}` });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  previewOrder,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  getRestaurantOrderStats,
  updateOrderStatus,
  validateCoupon,
  generateOrderNumber,
  VALID_TRANSITIONS,
  CANCELLABLE_STATUSES,
};