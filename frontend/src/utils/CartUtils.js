
export const getItemEffectivePrice = (item) => {
  return item.discount > 0 ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
};

export const getCartSubtotal = (items) => {
  return items.reduce((sum, item) => sum + getItemEffectivePrice(item) * item.quantity, 0);
};

export const getCartItemCount = (items) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};