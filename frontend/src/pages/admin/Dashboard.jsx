import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.getDashboard().then(setData);
  }, []);

  if (!data) return <Loading label="Loading dashboard" />;

  const { stats, recentOrders, recentRestaurants, topRestaurants, revenueByDay } = data;

  const STAT_ITEMS = [
    { label: 'Total customers', value: stats.totalCustomers },
    { label: 'Total restaurants', value: stats.totalRestaurants },
    { label: 'Total orders', value: stats.totalOrders },
    { label: 'Total revenue', value: `NPR ${stats.totalRevenue}` },
    { label: 'Pending orders', value: stats.pendingOrders },
    { label: 'Completed orders', value: stats.completedOrders },
  ];

  return (
    <div className="px-6 py-10 sm:px-10">
      <h1 className="font-display text-3xl text-ink">Platform overview</h1>

      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
        {STAT_ITEMS.map((stat) => (
          <div key={stat.label} className="bg-paper px-5 py-6">
            <p className="font-display text-2xl text-ink">{stat.value}</p>
            <p className="mt-1 font-sans text-xs text-ink/60">{stat.label}</p>
          </div>
        ))}
      </div>

      {revenueByDay.length > 0 && (
        <div className="mt-10">
          <p className="font-sans text-sm font-medium text-ink">Revenue, last 7 days</p>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByDay}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`NPR ${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#1e2a4a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="font-sans text-sm font-medium text-ink">Recent orders</p>
          <div className="mt-3 space-y-2">
            {recentOrders.length === 0 && <p className="font-sans text-sm text-ink/50">No orders yet.</p>}
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between rounded-lg border border-ink/10 px-3 py-2 font-sans text-sm">
                <div>
                  <p className="text-ink">{order.restaurant?.name}</p>
                  <p className="text-xs text-ink/40">
                    {order.customer?.name} · {order.orderNumber}
                  </p>
                </div>
                <p className="text-ink/70">NPR {order.total}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-sans text-sm font-medium text-ink">Top restaurants (by revenue)</p>
          <div className="mt-3 space-y-2">
            {topRestaurants.length === 0 && <p className="font-sans text-sm text-ink/50">No completed orders yet.</p>}
            {topRestaurants.map((r, idx) => (
              <div key={r._id} className="flex items-center justify-between rounded-lg border border-ink/10 px-3 py-2 font-sans text-sm">
                <p className="text-ink">
                  {idx + 1}. {r.name}
                </p>
                <p className="text-ink/70">NPR {r.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <p className="font-sans text-sm font-medium text-ink">Recent restaurants</p>
        <div className="mt-3 space-y-2">
          {recentRestaurants.map((r) => (
            <div key={r._id} className="flex items-center justify-between rounded-lg border border-ink/10 px-3 py-2 font-sans text-sm">
              <p className="text-ink">
                {r.name} · {r.city}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  r.isApproved ? 'bg-green-100 text-green-700' : 'bg-marigold-100 text-marigold-600'
                }`}
              >
                {r.isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/admin/restaurants" className="rounded-lg bg-indigo-600 px-4 py-2 font-sans text-sm text-paper hover:bg-indigo-700">
          Manage restaurants
        </Link>
        <Link to="/admin/users" className="rounded-lg border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:border-ink/30">
          Manage users
        </Link>
        <Link to="/admin/coupons" className="rounded-lg border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:border-ink/30">
          Manage coupons
        </Link>
        <Link to="/admin/categories" className="rounded-lg border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:border-ink/30">
          Manage categories
        </Link>
        <Link to="/admin/orders" className="rounded-lg border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:border-ink/30">
          View all orders
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
