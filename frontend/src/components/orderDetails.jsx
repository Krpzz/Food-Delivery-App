import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import Loading from '../../components/Loading';

const STATUS_FLOW = ['CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
const TERMINAL_STATUSES = ['CANCELLED', 'REJECTED', 'PAYMENT_FAILED'];
const CANCELLABLE_STATUSES = ['PENDING_PAYMENT', 'CONFIRMED', 'ACCEPTED'];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const load = () => {
    setIsLoading(true);
    orderService
      .getOrderById(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.response?.data?.message || 'Order not found'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <Loading label="Loading order" />;

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="font-sans text-sm text-ink/60">{error || 'Order not found.'}</p>
        <Link to="/orders" className="mt-3 inline-block font-sans text-sm text-indigo-600 hover:underline">
          Back to your orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_FLOW.indexOf(order.status);
  const isTerminal = TERMINAL_STATUSES.includes(order.status);
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <p className="font-sans text-sm text-ink/50">{order.orderNumber}</p>
      <h1 className="font-display text-2xl text-ink">{order.restaurant?.name}</h1>

      {isTerminal ? (
        <p className="mt-4 rounded-lg bg-chili-500/10 px-3 py-2 font-sans text-sm text-chili-600">
          This order was {order.status.toLowerCase().replace('_', ' ')}.
        </p>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-1">
            {STATUS_FLOW.map((step) => (
              <div key={step} className="flex flex-1 items-center">
                <div className={`h-1.5 flex-1 rounded-full ${STATUS_FLOW.indexOf(step) <= currentStepIndex ? 'bg-indigo-600' : 'bg-ink/10'}`} />
              </div>
            ))}
          </div>
          <p className="mt-2 font-sans text-sm font-medium text-indigo-600">{order.status.replace('_', ' ')}</p>
        </>
      )}

      <div className="mt-6 divide-y divide-ink/10 border-t border-ink/10">
        {order.items.map((item) => (
          <div key={item.menuItem} className="flex justify-between py-3 font-sans text-sm">
            <span className="text-ink">
              {item.name} × {item.quantity}
            </span>
            <span className="text-ink/70">NPR {item.subtotal}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 border-t border-ink/10 pt-4 font-sans text-sm text-ink/70">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>NPR {order.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery fee</span>
          <span>NPR {order.deliveryFee}</span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>NPR {order.serviceFee}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>NPR {order.tax}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-NPR {order.discount}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-ink/10 pt-2 font-medium text-ink">
          <span>Total</span>
          <span>NPR {order.total}</span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-ink/10 p-4 font-sans text-sm">
        <p className="font-medium text-ink">Delivering to</p>
        <p className="mt-1 text-ink/60">
          {order.deliveryAddress.name} · {order.deliveryAddress.phone}
        </p>
        <p className="text-ink/60">
          {order.deliveryAddress.street ? `${order.deliveryAddress.street}, ` : ''}
          {order.deliveryAddress.area}, {order.deliveryAddress.city}
        </p>
        <p className="mt-2 text-ink/40">Payment: {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'eSewa'}</p>
      </div>

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={isCancelling}
          className="mt-6 rounded-lg border border-chili-500/30 px-4 py-2 font-sans text-sm text-chili-600 hover:bg-chili-500/5 disabled:opacity-50"
        >
          {isCancelling ? 'Cancelling…' : 'Cancel order'}
        </button>
      )}
    </div>
  );
};

export default OrderDetails;