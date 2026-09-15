import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import restaurantService from '../../services/restaurantService';
import menuService from '../../services/menuService';
import reviewService from '../../services/reviewService';
import FoodCard from '../../components/FoodCard';
import StarRating from '../../components/StarRating';
import Loading from '../../components/Loading';

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    setActiveCategory('all');
    Promise.all([
      restaurantService.getRestaurantById(id),
      menuService.getMenuItemsByRestaurant(id, { availableOnly: 'true' }),
      reviewService.getRestaurantReviews(id),
    ])
      .then(([restaurantData, menuData, reviewData]) => {
        setRestaurant(restaurantData.restaurant);
        setItems(menuData.menuItems);
        setReviews(reviewData.reviews);
      })
      .catch((err) => setError(err.response?.data?.message || 'Restaurant not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <Loading label="Loading restaurant" />;

  if (error || !restaurant) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="font-sans text-sm text-ink/60">{error || 'Restaurant not found.'}</p>
        <Link to="/restaurants" className="mt-3 inline-block font-sans text-sm text-indigo-600 hover:underline">
          Back to restaurants
        </Link>
      </div>
    );
  }

  const categories = ['all', ...new Set(items.map((i) => i.category?.name).filter(Boolean))];
  const visibleItems = activeCategory === 'all' ? items : items.filter((i) => i.category?.name === activeCategory);

  return (
    <div>
      <div className="h-48 w-full overflow-hidden bg-ink/10 sm:h-64">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-5xl text-ink/20">
            {restaurant.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink">{restaurant.name}</h1>
            <p className="mt-1 font-sans text-sm text-ink/60">{restaurant.cuisines?.join(' · ')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-sans text-sm text-ink">
              ★ {restaurant.rating?.toFixed(1) ?? '—'}
              {restaurant.ratingCount > 0 && <span className="text-ink/40">({restaurant.ratingCount})</span>}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-sans text-xs ${
                restaurant.isOpen ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/50'
              }`}
            >
              {restaurant.isOpen ? 'Open now' : 'Closed'}
            </span>
          </div>
        </div>

        {restaurant.description && <p className="mt-4 font-sans text-sm text-ink/70">{restaurant.description}</p>}

        <p className="mt-3 font-sans text-xs text-ink/40">
          {restaurant.address}, {restaurant.city} · {restaurant.openingTime}–{restaurant.closingTime}
        </p>

        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-ink/10 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 font-sans text-sm ${
                activeCategory === cat ? 'bg-indigo-600 text-paper' : 'text-ink/60 hover:bg-ink/5'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <p className="mt-8 font-sans text-sm text-ink/50">No menu items in this category yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {visibleItems.map((item) => (
              <FoodCard key={item._id} item={item} restaurantId={restaurant._id} restaurantName={restaurant.name} />
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-ink/10 pt-8">
          <h2 className="font-display text-xl text-ink">
            Reviews{reviews.length > 0 ? ` (${reviews.length})` : ''}
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-3 font-sans text-sm text-ink/50">No reviews yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-ink/10 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm font-medium text-ink">{review.customer?.name}</p>
                    <StarRating value={review.rating} size="text-sm" />
                  </div>
                  {review.comment && <p className="mt-1 font-sans text-sm text-ink/60">{review.comment}</p>}
                  <p className="mt-1 font-sans text-xs text-ink/40">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
