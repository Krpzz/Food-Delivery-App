import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import orderService from '../../services/orderService';
import Loading from '../../components/Loading';

const TABS = [
  { key: 'CONFIRMED', label: 'New' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
  { key: 'COMPLETED', label: 'Completed' },
];

const NEXT_ACTION = {
  CONFIRMED: { label: 'Accept', next: 'ACCEPTED' },
  ACCEPTED: { label: 'Start preparing', next: 'PREPARING' },
  PREPARING: { label: 'Mark ready', next: 'READY' },
  READY: { label: 'Mark completed', next: 'COMPLETED' },
};

const RestaurantOrders = () => {
  const { activeRestaurantId } = useSelector((s) => s.restaurant);
  const [activeTab, setActiveTab] = useState('CONFIRMED');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    if (!activeRestaurantId) return;
    setIsLoading(true);
    orderService
      .getRestaurantOrders(activeRestaurantId, { status: activeTab })
      .then((data) => setOrders(data.orders))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, [activeRestaurantId, activeTab]);

  const handleUpdateStatus = async (orderId, next) => {
    await orderService.updateOrderStatus(orderId, next);
    load();
  };

  const handleReject = async (orderId) => {
    if (!window.confirm('Reject this order?')) return;
    await orderService.updateOrderStatus(orderId, 'REJECTED');
    load();
  };

  if (!activeRestaurantId) {
    return <p className="px-6 py-10 font-sans text-sm text-ink/60">Set up your restaurant profile first.</p>;
  }

  return (
    <div className="px-6 py-10 sm:px-10">
      <h1 className="font-display text-3xl text-ink">Orders</h1>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-ink/10 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 font-sans text-sm ${
              activeTab === tab.key ? 'bg-indigo-600 text-paper' : 'text-ink/60 hover:bg-ink/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading label="Loading orders" />
      ) : orders.length === 0 ? (
        <p className="mt-8 font-sans text-sm text-ink/50">
          No {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} orders.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="rounded-lg border border-ink/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-sans text-sm font-medium text-ink">{order.orderNumber}</p>
                  <p className="mt-0.5 font-sans text-xs text-ink/50">
                    {order.customer?.name} · {order.customer?.phone}
                  </p>
                </div>
                <p className="font-sans text-sm font-medium text-ink">NPR {order.total}</p>
              </div>

              <p className="mt-2 font-sans text-xs text-ink/50">
                {order.items.map((item) => `${item.name} ×${item.quantity}`).join(', ')}
              </p>

              <div className="mt-3 flex gap-2">
                {NEXT_ACTION[order.status] && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, NEXT_ACTION[order.status].next)}
                    className="rounded-lg bg-indigo-600 px-3.5 py-1.5 font-sans text-xs text-paper hover:bg-indigo-700"
                  >
                    {NEXT_ACTION[order.status].label}
                  </button>
                )}
                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleReject(order._id)}
                    className="rounded-lg border border-chili-500/30 px-3.5 py-1.5 font-sans text-xs text-chili-600 hover:bg-chili-500/5"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;