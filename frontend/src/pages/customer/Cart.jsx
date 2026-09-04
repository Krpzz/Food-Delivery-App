import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { incrementItem, decrementItem, removeItem, clearCart } from '../../store/slices/cartSlice';
import CartItem from '../../components/cartItem';
import { getCartSubtotal } from '../../utils/CartUtils';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, restaurantName } = useSelector((s) => s.cart);
  const subtotal = getCartSubtotal(items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-display text-2xl text-ink">Your cart is empty</h1>
        <p className="mt-2 font-sans text-sm text-ink/60">Add something tasty from a restaurant near you.</p>
        <Link
          to="/restaurants"
          className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-sm text-ink/50">Ordering from</p>
          <h1 className="font-display text-2xl text-ink">{restaurantName}</h1>
        </div>
        <button onClick={() => dispatch(clearCart())} className="font-sans text-sm text-chili-600 hover:underline">
          Clear cart
        </button>
      </div>

      <div className="mt-6 divide-y divide-ink/10 border-t border-ink/10">
        {items.map((item) => (
          <CartItem
            key={item.menuItemId}
            item={item}
            onIncrement={() => dispatch(incrementItem(item.menuItemId))}
            onDecrement={() => dispatch(decrementItem(item.menuItemId))}
            onRemove={() => dispatch(removeItem(item.menuItemId))}
          />
        ))}
      </div>

      <div className="mt-8 space-y-2 border-t border-ink/10 pt-6">
        <div className="flex justify-between font-sans text-sm text-ink">
          <span>Subtotal</span>
          <span className="font-medium">NPR {subtotal}</span>
        </div>
        <div className="flex justify-between font-sans text-sm text-ink/40">
          <span>Delivery fee, service fee, tax, coupon</span>
          <span>Calculated at checkout</span>
        </div>
      </div>

      <Link
        to="/checkout"
        className="mt-6 block w-full rounded-lg bg-indigo-600 py-3 text-center font-sans text-sm text-paper hover:bg-indigo-700"
      >
        Proceed to checkout
      </Link>
    </div>
  );
};

export default Cart;