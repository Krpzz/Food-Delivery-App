const DELIVERY_FEE = 60;
const TAX_RATE = 0.13;

const calculateOrderTotal = ({ items, coupon }) => {
  const subtotal = items.reduce((sum, item) => {
    const effectivePrice = item.discount > 0 ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
    return sum + effectivePrice * item.quantity;
  }, 0);

  const deliveryFee = DELIVERY_FEE;
  const tax = Math.round(subtotal * TAX_RATE);

  let discount = 0;
  if (coupon) {
    discount =
      coupon.discountType === 'PERCENTAGE' ? Math.round(subtotal * (coupon.discountValue / 100)) : coupon.discountValue;
    if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
    discount = Math.min(discount, subtotal);
  }

  const total = Math.max(subtotal + deliveryFee + tax - discount, 0);

  return { subtotal, deliveryFee, tax, discount, total };
};

module.exports = calculateOrderTotal;