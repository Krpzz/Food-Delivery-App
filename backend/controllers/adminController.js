const { validationResult } = require('express-validator');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');

const getDashboardStats = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalRestaurants,
      totalOrders,
      pendingOrders,
      completedOrderTotals,
      recentOrders,
      recentRestaurants,
      topRestaurantsAgg,
      revenueByDayAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'CUSTOMER' }),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'CONFIRMED' }),
      Order.find({ status: 'COMPLETED' }).select('total'),
      Order.find().populate('restaurant', 'name').populate('customer', 'name').sort({ createdAt: -1 }).limit(8),
      Restaurant.find().sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        { $match: { status: 'COMPLETED' } },
        { $group: { _id: '$restaurant', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } },
        { $unwind: '$restaurant' },
      ]),
      Order.aggregate([
        { $match: { status: 'COMPLETED', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalRestaurants,
        totalOrders,
        totalRevenue: completedOrderTotals.reduce((sum, o) => sum + o.total, 0),
        pendingOrders,
        completedOrders: completedOrderTotals.length,
      },
      recentOrders,
      recentRestaurants,
      topRestaurants: topRestaurantsAgg.map((r) => ({
        _id: r.restaurant._id,
        name: r.restaurant.name,
        revenue: r.revenue,
        orders: r.orders,
      })),
      revenueByDay: revenueByDayAgg.map((r) => ({ date: r._id, revenue: r.revenue })),
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const getAdminRestaurants = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status === 'pending') filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;
    const restaurants = await Restaurant.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    next(error);
  }
};

const approveRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

const suspendRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

const getAdminOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const orders = await Order.find(filter)
      .populate('restaurant', 'name')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { code, discountType, discountValue, minimumOrder, maximumDiscount, expiryDate, usageLimit } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A coupon with this code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minimumOrder: minimumOrder || 0,
      maximumDiscount: maximumDiscount || undefined,
      expiryDate,
      usageLimit: usageLimit || undefined,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const fields = ['discountType', 'discountValue', 'minimumOrder', 'maximumDiscount', 'expiryDate', 'usageLimit', 'isActive'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) coupon[field] = req.body[field];
    });

    await coupon.save();
    res.json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  toggleUserActive,
  getAdminRestaurants,
  approveRestaurant,
  suspendRestaurant,
  getAdminOrders,
  getAllCategories,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};