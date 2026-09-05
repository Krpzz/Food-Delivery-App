import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import orderService from '../../services/orderService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService
      .getOrders()
      .then((data) => setOrders(data.orders || data))
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loading label="Loading orders" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Your orders</h1>
      {error && <p className="mt-4 font-sans text-sm text-chili-600">{error}</p>}
      {!error && orders.length === 0 && (
        <p className="mt-6 font-sans text-sm text-ink/60">You haven't placed any orders yet.</p>
      )}
      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block rounded-lg border border-ink/10 p-4 hover:border-indigo-500"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-sans font-medium text-ink">
                  {order.restaurant?.name || order.restaurantName || 'Order'}
                </p>
                <p className="mt-1 font-sans text-xs text-ink/50">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent order'}
                </p>
              </div>
              <span className="font-sans text-sm capitalize text-indigo-600">{order.status?.toLowerCase()}</span>
            </div>
            <p className="mt-3 font-sans text-sm text-ink/70">NPR {order.total}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;