import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import orderService from '../../services/orderService';
import AddressForm from '../../components/AddressForm';
import Loading from '../../components/Loading';

const TotalRow = ({ label, value }) => (
  <div className="flex justify-between font-sans text-sm text-ink/70">
    <span>{label}</span>
    <span>NPR {value}</span>
  </div>
);

const Checkout = () => {
  const { items, restaurantId, restaurantName } = useSelector((s) => s.cart);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [preview, setPreview] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    userService
      .getAddresses()
      .then((data) => {
        setAddresses(data.addresses);
        const def = data.addresses.find((a) => a.isDefault) || data.addresses[0];
        if (def) setSelectedAddressId(def._id);
      })
      .finally(() => setIsLoadingAddresses(false));
  }, []);

  const fetchPreview = async (code) => {
    setIsCalculating(true);
    setCouponError('');
    try {
      const data = await orderService.previewOrder({
        restaurantId,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        couponCode: code || undefined,
      });
      setPreview(data);
    } catch (err) {
      if (code) setCouponError(err.response?.data?.message || 'Could not apply that coupon');
      else setPreview(null);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (items.length > 0) fetchPreview();
  }, []);

  const handleApplyCoupon = () => fetchPreview(couponCode);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl text-ink">Your cart is empty</h1>
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
      <h1 className="font-display text-3xl text-ink">Checkout</h1>
      <p className="mt-1 font-sans text-sm text-ink/50">Ordering from {restaurantName}</p>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-sm font-medium text-ink">Delivery address</h2>
          <Link to="/addresses" className="font-sans text-xs text-indigo-600 hover:underline">
            Manage addresses
          </Link>
        </div>

        {isLoadingAddresses ? (
          <Loading label="Loading addresses" />
        ) : (
          <>
            {addresses.length === 0 && !showNewAddressForm ? (
              <div className="mt-3 rounded-lg border border-dashed border-ink/20 p-4 text-center">
                <p className="font-sans text-sm text-ink/60">You don't have a saved address yet.</p>
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="mt-2 font-sans text-sm text-indigo-600 hover:underline"
                >
                  + Add an address
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                      selectedAddressId === addr._id ? 'border-indigo-500 bg-indigo-50/40' : 'border-ink/15'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1"
                    />
                    <div className="font-sans text-sm">
                      <p className="font-medium text-ink">
                        {addr.label} · {addr.name}
                      </p>
                      <p className="text-ink/60">
                        {addr.street ? `${addr.street}, ` : ''}
                        {addr.area}, {addr.city}
                      </p>
                      <p className="text-ink/40">{addr.phone}</p>
                    </div>
                  </label>
                ))}
                {!showNewAddressForm && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="font-sans text-sm text-indigo-600 hover:underline"
                  >
                    + Add a new address
                  </button>
                )}
              </div>
            )}

            {showNewAddressForm && (
              <div className="mt-4 rounded-lg border border-ink/10 p-4">
                <AddressForm
                  onCancel={() => setShowNewAddressForm(false)}
                  onSubmit={async (formData) => {
                    const data = await userService.createAddress(formData);
                    setAddresses((prev) => [...prev, data.address]);
                    setSelectedAddressId(data.address._id);
                    setShowNewAddressForm(false);
                  }}
                />
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-sans text-sm font-medium text-ink">Coupon</h2>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 rounded-lg border border-ink/15 bg-transparent px-3 py-2 font-sans text-sm uppercase text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={!couponCode || isCalculating}
            className="rounded-lg border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:border-ink/30 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
        {couponError && <p className="mt-2 font-sans text-xs text-chili-600">{couponError}</p>}
        {preview?.coupon && <p className="mt-2 font-sans text-xs text-green-700">"{preview.coupon.code}" applied.</p>}
      </section>

      <section className="mt-8">
        <h2 className="font-sans text-sm font-medium text-ink">Payment method</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { id: 'ESEWA', label: 'eSewa' },
            { id: 'COD', label: 'Cash on delivery' },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`rounded-lg border py-2.5 font-sans text-sm ${
                paymentMethod === method.id ? 'border-indigo-600 bg-indigo-600 text-paper' : 'border-ink/15 text-ink/70 hover:border-ink/30'
              }`}
            >
              {method.label}
            </button>
          ))}
        </div>
        {paymentMethod === 'ESEWA' && (
          <p className="mt-2 font-sans text-xs text-marigold-600">eSewa payment processing arrives in Step 9.</p>
        )}
      </section>

      <section className="mt-8 space-y-2 border-t border-ink/10 pt-6">
        {isCalculating ? (
          <Loading label="Calculating total" />
        ) : preview ? (
          <>
            <TotalRow label="Subtotal" value={preview.subtotal} />
            <TotalRow label="Delivery fee" value={preview.deliveryFee} />
            <TotalRow label="Service fee" value={preview.serviceFee} />
            <TotalRow label="Tax" value={preview.tax} />
            {preview.discount > 0 && <TotalRow label="Discount" value={-preview.discount} />}
            <div className="flex justify-between border-t border-ink/10 pt-2 font-sans text-base font-medium text-ink">
              <span>Total</span>
              <span>NPR {preview.total}</span>
            </div>
          </>
        ) : (
          <p className="font-sans text-sm text-chili-600">Couldn't calculate the total. Try applying the coupon again.</p>
        )}
      </section>

      <button
        disabled
        title="Order placement arrives in Step 8"
        className="mt-6 w-full cursor-not-allowed rounded-lg bg-ink/10 py-3 font-sans text-sm text-ink/40"
      >
        Place order — Step 8
      </button>
    </div>
  );
};

export default Checkout;