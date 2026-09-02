const mongoose = require('mongoose');

// Snapshot of the menu item at order time (name/price), not a live lookup.
// Menu prices change over time and an order must always reflect what the
// customer actually agreed to pay.
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

// Snapshot of the delivery address, not a live ref to Address. The user's
// saved addresses can be edited/deleted later; the order should still show
// exactly where it was sent.
const deliveryAddressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    city: String,
    area: String,
    street: String,
    landmark: String,
    latitude: Number,
    longitude: Number,
  },
  { _id: false }
);

const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'PAYMENT_FAILED',
];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: { type: [orderItemSchema], required: true },
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    serviceFee: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    // Backend-calculated final amount. Never trust a total posted from the frontend.
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['ESEWA', 'COD'], required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    status: { type: String, enum: ORDER_STATUSES, default: 'PENDING_PAYMENT' },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });

orderSchema.statics.STATUSES = ORDER_STATUSES;

module.exports = mongoose.model('Order', orderSchema);
