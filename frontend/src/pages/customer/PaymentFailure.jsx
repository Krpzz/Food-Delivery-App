import { Link } from 'react-router-dom';

const PaymentFailure = () => {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-display text-2xl text-ink">Payment didn't go through</h1>
      <p className="mt-2 font-sans text-sm text-ink/60">
        The payment was cancelled or failed on eSewa's side. Your order hasn't been confirmed.
      </p>
      <Link
        to="/cart"
        className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700"
      >
        Back to cart
      </Link>
    </div>
  );
};

export default PaymentFailure;
