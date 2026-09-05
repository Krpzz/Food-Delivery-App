import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyRestaurants } from '../../store/slices/restaurantSlice';
import menuService from '../../services/menuService';
import orderService from '../../services/orderService';
import Loading from '../../components/Loading';

const RestaurantDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myRestaurants, activeRestaurantId, isLoading } = useSelector((s) => s.restaurant);
  const [menuCount, setMenuCount] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dispatch(fetchMyRestaurants());
  }, [dispatch]);

  const activeRestaurant = myRestaurants.find((r) => r._id === activeRestaurantId);

  useEffect(() => {
    if (activeRestaurantId) {
      menuService.getMenuItemsByRestaurant(activeRestaurantId).then((data) => setMenuCount(data.count));
      orderService.getRestaurantOrderStats(activeRestaurantId).then((data) => setStats(data.stats));
    }
  }, [activeRestaurantId]);

  if (isLoading && myRestaurants.length === 0) return <Loading label="Loading your dashboard" />;

  if (myRestaurants.length === 0) {
    return (
      <div className="px-6 py-10 sm:px-10">
        <p className="font-sans text-sm text-ink/50">Welcome</p>
        <h1 className="font-display text-3xl text-ink">{user?.name}</h1>
        <p className="mt-3 max-w-md font-sans text-sm text-ink/60">
          You haven't set up a restaurant yet — do that first, then your menu
          and dashboard stats will show up here.
        </p>
        <Link
          to="/restaurant/profile"
          className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700"
        >
          Set up your restaurant
        </Link>
      </div>
    );
  }

  const STAT_ITEMS = [
    { label: "Today's orders", value: stats?.todayOrders },
    { label: 'Pending', value: stats?.pending },
    { label: 'Preparing', value: stats?.preparing },
    { label: 'Completed', value: stats?.completed },
    { label: "Today's revenue", value: stats ? `NPR ${stats.todayRevenue}` : undefined },
  ];

  return (
    <div className="px-6 py-10 sm:px-10">
      <p className="font-sans text-sm text-ink/50">Welcome back</p>
      <h1 className="font-display text-3xl text-ink">{activeRestaurant?.name}</h1>
      <p className="mt-1 font-sans text-sm text-ink/50">
        {activeRestaurant?.isApproved ? 'Approved & visible to customers' : 'Awaiting admin approval'}
        {' · '}
        {menuCount ?? '—'} menu items
      </p>

      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 sm:grid-cols-5">
        {STAT_ITEMS.map((stat) => (
          <div key={stat.label} className="bg-paper px-5 py-6">
            <p className="font-display text-2xl text-ink">{stat.value ?? '—'}</p>
            <p className="mt-1 font-sans text-xs text-ink/60">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link to="/restaurant/orders" className="rounded-lg bg-indigo-600 px-4 py-2 font-sans text-sm text-paper hover:bg-indigo-700">
          View orders
        </Link>
        <Link to="/restaurant/menu" className="rounded-lg border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:border-ink/30">
          Manage menu
        </Link>
        <Link to="/restaurant/profile" className="rounded-lg border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:border-ink/30">
          Edit profile
        </Link>
      </div>
    </div>
  );
};

export default RestaurantDashboard;