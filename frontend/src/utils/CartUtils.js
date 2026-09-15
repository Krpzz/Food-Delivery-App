// The item-level discount (from MenuItem.discount) is baked into the price
// shown here. This is separate from Order.discount, which comes from a
// coupon applied at Checkout (Step 7) on top of this subtotal.
export const getItemEffectivePrice = (item) => {
  return item.discount > 0 ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
};

export const getCartSubtotal = (items) => {
  return items.reduce((sum, item) => sum + getItemEffectivePrice(item) * item.quantity, 0);
};

export const getCartItemCount = (items) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};
