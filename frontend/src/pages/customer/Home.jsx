import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import restaurantService from '../../services/resturantService';
import menuService from '../../services/menuService';
import RestaurantCard from '../../components/ResturantCard';
import Loading from '../../components/Loading';

const CITIES = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar', 'Birtamode'];

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([restaurantService.getRestaurants({ sort: 'rating' }), menuService.getCategories()])
      .then(([restaurantData, categoryData]) => {
        setFeatured(restaurantData.restaurants.slice(0, 6));
        setCategories(categoryData.categories.slice(0, 8));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const goToRestaurants = (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    navigate(`/restaurants${qs ? `?${qs}` : ''}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToRestaurants(searchText ? { search: searchText } : {});
  };

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
        <div className="max-w-xl">
          {user ? (
            <p className="font-sans text-sm text-marigold-600">Hi {user.name.split(' ')[0]}, hungry yet?</p>
          ) : (
            <p className="font-sans text-sm text-indigo-600">Nepal, delivered</p>
          )}
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            Momo, thali, chowmein — from kitchens near you.
          </h1>

          <form onSubmit={handleSearch} className="mt-6 flex gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search restaurants, cuisines or dishes"
              className="flex-1 rounded-lg border border-ink/15 bg-transparent px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => goToRestaurants({ city })}
                className="rounded-full border border-ink/15 px-3 py-1 font-sans text-xs text-ink/70 hover:border-indigo-400 hover:text-indigo-600"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => goToRestaurants({ tab: 'dishes', category: cat._id })}
                className="flex-shrink-0 rounded-full border border-ink/10 px-4 py-2 font-sans text-sm text-ink/70 hover:border-indigo-300"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Top rated near you</h2>
          <button onClick={() => goToRestaurants()} className="font-sans text-sm text-indigo-600 hover:underline">
            See all
          </button>
        </div>

        {isLoading ? (
          <Loading label="Finding restaurants" />
        ) : featured.length === 0 ? (
          <p className="mt-6 font-sans text-sm text-ink/50">
            No approved restaurants yet — run <code>npm run seed</code> in the backend.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;