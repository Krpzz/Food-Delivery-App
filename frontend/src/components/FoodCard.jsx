import { Link } from 'react-router-dom';

const FoodCard = ({ item, showRestaurant = false }) => {
  const discountedPrice = item.discount > 0 ? Math.round(item.price * (1 - item.discount / 100)) : null;

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
            {discountedPrice ? (
              <>
                <span className="font-sans text-sm font-medium text-ink">NPR {discountedPrice}</span>
                <span className="font-sans text-xs text-ink/40 line-through">NPR {item.price}</span>
              </>
            ) : (
              <span className="font-sans text-sm font-medium text-ink">NPR {item.price}</span>
            )}
            {showRestaurant && item.restaurant && (
              <Link to={`/restaurants/${item.restaurant._id}`} className="font-sans text-xs text-indigo-600 hover:underline">
                {item.restaurant.name}
              </Link>
            )}
          </div>
          <span className="rounded-full bg-ink/5 px-2.5 py-1 font-sans text-[11px] text-ink/40">Cart in Step 6</span>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;