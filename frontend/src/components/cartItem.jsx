import { getItemEffectivePrice } from '../utils/CartUtils';

const CartItem = ({ item, onIncrement, onDecrement, onRemove }) => {
  const effectivePrice = getItemEffectivePrice(item);

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-ink/5">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-lg text-ink/20">
            {item.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 flex-shrink-0 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-chili-500'}`} />
          <p className="font-sans text-sm font-medium text-ink">{item.name}</p>
        </div>
        <p className="mt-1 font-sans text-xs text-ink/50">NPR {effectivePrice} each</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          aria-label="Decrease quantity"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 font-sans text-sm text-ink hover:border-ink/30"
        >
          −
        </button>
        <span className="w-5 text-center font-sans text-sm text-ink">{item.quantity}</span>
        <button
          onClick={onIncrement}
          aria-label="Increase quantity"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 font-sans text-sm text-ink hover:border-ink/30"
        >
          +
        </button>
      </div>

      <p className="w-16 flex-shrink-0 text-right font-sans text-sm font-medium text-ink">
        NPR {effectivePrice * item.quantity}
      </p>

      <button onClick={onRemove} className="flex-shrink-0 font-sans text-xs text-chili-600 hover:underline">
        Remove
      </button>
    </div>
  );
};

export default CartItem;