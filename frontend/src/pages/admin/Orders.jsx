import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const STATUSES = [
  '',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'PAYMENT_FAILED',
];

const AdminOrders = () => {
  const [status, setStatus] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    adminService
      .getOrders(status ? { status } : {})
      .then((data) => setOrders(data.orders))
      .finally(() => setIsLoading(false));
  }, [status]);

  return (
    <div className="px-6 py-10 sm:px-10">
      <h1 className="font-display text-3xl text-ink">All orders</h1>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-6 rounded-lg border border-ink/15 px-3 py-2 font-sans text-sm">
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s ? s.replace('_', ' ') : 'All statuses'}
          </option>
        ))}
      </select>

      {isLoading ? (
        <Loading label="Loading orders" />
      ) : orders.length === 0 ? (
        <p className="mt-8 font-sans text-sm text-ink/50">No orders match this filter.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {orders.map((order) => (
            <div key={order._id} className="flex items-center justify-between gap-4 rounded-lg border border-ink/10 p-3 font-sans text-sm">
              <div>
                <p className="text-ink">
                  {order.orderNumber} · {order.restaurant?.name}
                </p>
                <p className="text-xs text-ink/50">
                  {order.customer?.name} ({order.customer?.email})
                </p>
              </div>
              <div className="text-right">
                <p className="text-ink">NPR {order.total}</p>
                <p className="text-xs text-ink/40">{order.status.replace('_', ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;