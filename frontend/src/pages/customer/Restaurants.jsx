import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import restaurantService from '../../services/resturantService';
import menuService from '../../services/menuService';
import RestaurantCard from '../../components/ResturantCard';
import FoodCard from '../../components/FoodCard';
import Loading from '../../components/Loading';

const CITIES = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar', 'Birtamode'];

const selectClass = 'rounded-lg border border-ink/15 bg-transparent px-3 py-2 font-sans text-sm text-ink';
const textInputClass =
  'min-w-[200px] flex-1 rounded-lg border border-ink/15 bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'dishes' ? 'dishes' : 'restaurants';

  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const cuisine = searchParams.get('cuisine') || '';
  const openNow = searchParams.get('openNow') === 'true';
  const sort = searchParams.get('sort') || '';
  const category = searchParams.get('category') || '';
  const vegOnly = searchParams.get('vegOnly') === 'true';

  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    menuService.getCategories().then((data) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const request =
      tab === 'restaurants'
        ? restaurantService.getRestaurants({
            search: search || undefined,
            city: city || undefined,
            cuisine: cuisine || undefined,
            isOpen: openNow ? 'true' : undefined,
            sort: sort || undefined,
          })
        : menuService.getMenuItems({
            search: search || undefined,
            city: city || undefined,
            category: category || undefined,
            isVeg: vegOnly ? 'true' : undefined,
            sort: sort || undefined,
          });

    request
      .then((data) => (tab === 'restaurants' ? setRestaurants(data.restaurants) : setDishes(data.menuItems)))
      .finally(() => setIsLoading(false));
  }, [tab, search, city, cuisine, openNow, sort, category, vegOnly]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value === false) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2 border-b border-ink/10">
        {['restaurants', 'dishes'].map((t) => (
          <button
            key={t}
            onClick={() => updateParam('tab', t === 'restaurants' ? '' : t)}
            className={`px-4 py-2.5 font-sans text-sm ${
              tab === t ? 'border-b-2 border-indigo-600 text-ink' : 'text-ink/50 hover:text-ink'
            }`}
          >
            {t === 'restaurants' ? 'Restaurants' : 'Dishes'}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          key={search}
          type="text"
          defaultValue={search}
          placeholder={tab === 'restaurants' ? 'Search restaurants or cuisines' : 'Search dishes'}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.currentTarget.value)}
          onBlur={(e) => updateParam('search', e.target.value)}
          className={textInputClass}
        />

        <select value={city} onChange={(e) => updateParam('city', e.target.value)} className={selectClass}>
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {tab === 'restaurants' ? (
          <>
            <input
              key={cuisine}
              type="text"
              defaultValue={cuisine}
              placeholder="Cuisine"
              onBlur={(e) => updateParam('cuisine', e.target.value)}
              className={`${selectClass} w-32`}
            />
            <label className="flex items-center gap-1.5 font-sans text-sm text-ink/70">
              <input type="checkbox" checked={openNow} onChange={(e) => updateParam('openNow', e.target.checked ? 'true' : '')} />
              Open now
            </label>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className={selectClass}>
              <option value="">Top rated</option>
              <option value="newest">Newest</option>
              <option value="name">Name</option>
            </select>
          </>
        ) : (
          <>
            <select value={category} onChange={(e) => updateParam('category', e.target.value)} className={selectClass}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 font-sans text-sm text-ink/70">
              <input type="checkbox" checked={vegOnly} onChange={(e) => updateParam('vegOnly', e.target.checked ? 'true' : '')} />
              Veg only
            </label>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className={selectClass}>
              <option value="">Newest</option>
              <option value="priceLow">Price: low to high</option>
              <option value="priceHigh">Price: high to low</option>
            </select>
          </>
        )}
      </div>

      {isLoading ? (
        <Loading label={tab === 'restaurants' ? 'Loading restaurants' : 'Loading dishes'} />
      ) : tab === 'restaurants' ? (
        restaurants.length === 0 ? (
          <p className="mt-10 font-sans text-sm text-ink/50">No restaurants match those filters.</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )
      ) : dishes.length === 0 ? (
        <p className="mt-10 font-sans text-sm text-ink/50">No dishes match those filters.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {dishes.map((item) => (
            <FoodCard key={item._id} item={item} showRestaurant />
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurants;