const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');
const calculateOrderTotal = require('../utils/calculateOrderTotal');

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

module.exports = { previewOrder, validateCoupon };