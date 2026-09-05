import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import Loading from '../../components/Loading';

const STATUS_STYLES = {
  PENDING_PAYMENT: 'bg-marigold-100 text-marigold-600',
  CONFIRMED: 'bg-indigo-100 text-indigo-600',
  ACCEPTED: 'bg-indigo-100 text-indigo-600',
  PREPARING: 'bg-marigold-100 text-marigold-600',
  READY: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-ink/10 text-ink/50',
  REJECTED: 'bg-chili-500/10 text-chili-600',
  PAYMENT_FAILED: 'bg-chili-500/10 text-chili-600',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrders()
      .then((data) => setOrders(data.orders))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loading label="Loading your orders" />;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl text-ink">No orders yet</h1>
        <Link
          to="/restaurants"
          className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Your orders</h1>
      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block rounded-lg border border-ink/10 p-4 hover:border-ink/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-sans text-sm font-medium text-ink">{order.restaurant?.name}</p>
                <p className="mt-0.5 font-sans text-xs text-ink/50">
                  {order.orderNumber} · {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 font-sans text-xs ${STATUS_STYLES[order.status] || 'bg-ink/10 text-ink/50'}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="mt-2 font-sans text-sm text-ink">NPR {order.total}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;