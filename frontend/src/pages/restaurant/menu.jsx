import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import menuService from '../../services/menuService';
import Loading from '../../components/Loading';

const Menu = () => {
  const { activeRestaurantId, myRestaurants } = useSelector((s) => s.restaurant);
  const activeRestaurant = myRestaurants.find((r) => r._id === activeRestaurantId);

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    if (!activeRestaurantId) return;
    setIsLoading(true);
    try {
      const data = await menuService.getMenuItemsByRestaurant(activeRestaurantId);
      setItems(data.menuItems);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load menu items');
    } finally {
      setIsLoading(false);
    }
  }, [activeRestaurantId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleToggleAvailability = async (item) => {
    const fd = new FormData();
    fd.append('isAvailable', String(!item.isAvailable));
    await menuService.updateMenuItem(item._id, fd);
    loadItems();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from your menu?`)) return;
    await menuService.deleteMenuItem(item._id);
    loadItems();
  };

  if (!activeRestaurantId) {
    return (
      <div className="px-6 py-10 sm:px-10">
        <p className="font-sans text-sm text-ink/60">
          Set up your restaurant profile first, then come back to build your menu.
        </p>
        <Link to="/restaurant/profile" className="mt-3 inline-block font-sans text-sm text-indigo-600 hover:underline">
          Go to restaurant profile
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 sm:px-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-sm text-ink/50">Menu</p>
          <h1 className="font-display text-3xl text-ink">{activeRestaurant?.name}</h1>
        </div>
        <Link
          to="/restaurant/menu/add"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-sans text-sm text-paper hover:bg-indigo-700"
        >
          Add menu item
        </Link>
      </div>

      {error && <p className="mt-4 font-sans text-sm text-chili-600">{error}</p>}

      {isLoading ? (
        <Loading label="Loading menu" />
      ) : items.length === 0 ? (
        <p className="mt-8 font-sans text-sm text-ink/50">No menu items yet — add your first one.</p>
      ) : (
        <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
          {items.map((item) => (
            <div key={item._id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-4">
                <span
                  className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-chili-500'}`}
                  title={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                />
                <div>
                  <p className="font-sans text-sm font-medium text-ink">{item.name}</p>
                  <p className="font-sans text-xs text-ink/50">
                    NPR {item.price}
                    {item.category?.name ? ` · ${item.category.name}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`rounded-full px-3 py-1 font-sans text-xs ${
                    item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/50'
                  }`}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </button>
                <Link to={`/restaurant/menu/${item._id}/edit`} className="font-sans text-xs text-indigo-600 hover:underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(item)} className="font-sans text-xs text-chili-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;