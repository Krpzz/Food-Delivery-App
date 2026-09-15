import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const emptyForm = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minimumOrder: '0',
  maximumDiscount: '',
  expiryDate: '',
  usageLimit: '',
};

const inputClass =
  'mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';
const labelClass = 'block font-sans text-sm text-ink/70';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setIsLoading(true);
    adminService
      .getCoupons()
      .then((data) => setCoupons(data.coupons))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await adminService.createCoupon({
        ...formData,
        discountValue: Number(formData.discountValue),
        minimumOrder: Number(formData.minimumOrder || 0),
        maximumDiscount: formData.maximumDiscount ? Number(formData.maximumDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      });
      setFormData(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create this coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    await adminService.updateCoupon(coupon._id, { isActive: !coupon.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await adminService.deleteCoupon(id);
    load();
  };

  return (
    <div className="px-6 py-10 sm:px-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Coupons</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-sans text-sm text-paper hover:bg-indigo-700"
          >
            + New coupon
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4 rounded-lg border border-ink/10 p-4">
          {error && <p className="rounded-lg bg-chili-500/10 px-3 py-2 font-sans text-sm text-chili-600">{error}</p>}

          <div>
            <label className={labelClass}>Code</label>
            <input name="code" required value={formData.code} onChange={handleChange} className={`${inputClass} uppercase`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <select name="discountType" value={formData.discountType} onChange={handleChange} className={inputClass}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat (NPR)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Value</label>
              <input type="number" name="discountValue" required min="0" value={formData.discountValue} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Minimum order (NPR)</label>
              <input type="number" name="minimumOrder" min="0" value={formData.minimumOrder} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max discount (optional)</label>
              <input type="number" name="maximumDiscount" min="0" value={formData.maximumDiscount} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Expiry date</label>
              <input type="date" name="expiryDate" required value={formData.expiryDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Usage limit (optional)</label>
              <input type="number" name="usageLimit" min="0" value={formData.usageLimit} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-sans text-sm text-paper hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Creating…' : 'Create coupon'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-ink/15 px-4 py-2 font-sans text-sm text-ink hover:border-ink/30"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loading label="Loading coupons" />
      ) : (
        <div className="mt-6 space-y-2">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-ink/10 p-3">
              <div>
                <p className="font-sans text-sm font-medium text-ink">{coupon.code}</p>
                <p className="font-sans text-xs text-ink/50">
                  {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% off` : `NPR ${coupon.discountValue} off`}
                  {coupon.minimumOrder > 0 && ` · min NPR ${coupon.minimumOrder}`}
                  {' · used '}
                  {coupon.usedCount}
                  {coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                  {' · expires '}
                  {new Date(coupon.expiryDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(coupon)}
                  className={`rounded-full px-2.5 py-0.5 font-sans text-xs ${
                    coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/50'
                  }`}
                >
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleDelete(coupon._id)} className="font-sans text-xs text-chili-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
