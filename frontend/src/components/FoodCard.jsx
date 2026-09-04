import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, incrementItem, decrementItem, clearCart } from '../store/slices/cartSlice';
import { getItemEffectivePrice } from '../utils/CartUtils';

const FoodCard = ({ item, showRestaurant = false, restaurantId, restaurantName }) => {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart);

  const effectivePrice = getItemEffectivePrice(item);
  const rId = restaurantId || item.restaurant?._id;
  const rName = restaurantName || item.restaurant?.name;
  const cartItem = cart.items.find((i) => i.menuItemId === item._id);

  const handleAdd = () => {
    if (cart.restaurantId && cart.restaurantId !== rId) {
      const confirmed = window.confirm(
        `Your cart has items from ${cart.restaurantName}. Start a new cart with ${rName} instead?`
      );
      if (!confirmed) return;
      dispatch(clearCart());
    }
    dispatch(
      addItem({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        discount: item.discount,
        image: item.image,
        isVeg: item.isVeg,
        restaurantId: rId,
        restaurantName: rName,
      })
    );
  };

  return (
    <div className="flex gap-4 rounded-xl border border-ink/10 p-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-ink/5">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-xl text-ink/20">
            {item.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-start gap-2">
          <span
            className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-chili-500'}`}
            title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
          />
          <h4 className="font-sans text-sm font-medium text-ink">{item.name}</h4>
        </div>
        {item.description && <p className="mt-1 line-clamp-2 font-sans text-xs text-ink/50">{item.description}</p>}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            {item.discount > 0 ? (
              <>
                <span className="font-sans text-sm font-medium text-ink">NPR {effectivePrice}</span>
                <span className="font-sans text-xs text-ink/40 line-through">NPR {item.price}</span>
              </>
            ) : (
              <span className="font-sans text-sm font-medium text-ink">NPR {item.price}</span>
            )}
            {showRestaurant && rName && (
              <Link to={`/restaurants/${rId}`} className="font-sans text-xs text-indigo-600 hover:underline">
                {rName}
              </Link>
            )}
          </div>

          {cartItem ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(decrementItem(item._id))}
                aria-label="Decrease quantity"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 font-sans text-sm text-ink hover:border-ink/30"
              >
                −
              </button>
              <span className="w-4 text-center font-sans text-sm text-ink">{cartItem.quantity}</span>
              <button
                onClick={() => dispatch(incrementItem(item._id))}
                aria-label="Increase quantity"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 font-sans text-sm text-ink hover:border-ink/30"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="rounded-full bg-indigo-600 px-3.5 py-1 font-sans text-xs text-paper hover:bg-indigo-700"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;