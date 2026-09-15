import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import Loading from '../../components/Loading';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setStatus('error');
      setError('Missing payment response.');
      return;
    }
    paymentService
      .verifyEsewaPayment(data)
      .then((res) => {
        setOrderId(res.order._id);
        setStatus('confirmed');
      })
      .catch((err) => {
        setStatus('error');
        setError(err.response?.data?.message || 'Could not verify this payment');
      });
  }, [searchParams]);

  if (status === 'verifying') return <Loading label="Verifying your payment with eSewa" />;

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl text-ink">Couldn't confirm this payment</h1>
        <p className="mt-2 font-sans text-sm text-ink/60">{error}</p>
        <Link
          to="/orders"
          className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700"
        >
          View your orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-display text-2xl text-ink">Payment confirmed</h1>
      <p className="mt-2 font-sans text-sm text-ink/60">Your order has been placed.</p>
      <Link
        to={`/orders/${orderId}`}
        className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700"
      >
        View order
      </Link>
    </div>
  );
};

export default PaymentSuccess;
