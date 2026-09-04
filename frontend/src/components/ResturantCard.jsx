import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurants/${restaurant._id}`}
      className="group block overflow-hidden rounded-2xl border border-ink/10 transition-colors hover:border-indigo-300"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-ink/5">
        {restaurant.coverImage ? (
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl text-ink/20">
            {restaurant.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg text-ink">{restaurant.name}</h3>
          <span className="flex flex-shrink-0 items-center gap-1 font-sans text-sm text-ink/70">
            ★ {restaurant.rating?.toFixed(1) ?? '—'}
          </span>
        </div>
        <p className="mt-1 truncate font-sans text-sm text-ink/50">{restaurant.cuisines?.join(' · ')}</p>
        <div className="mt-3 flex items-center gap-2 font-sans text-xs">
          <span className="text-ink/40">{restaurant.city}</span>
          <span className={`rounded-full px-2 py-0.5 ${restaurant.isOpen ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/50'}`}>
            {restaurant.isOpen ? 'Open now' : 'Closed'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;