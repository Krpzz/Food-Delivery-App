import { useState } from 'react';

const CITIES = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar', 'Birtamode'];
const LABELS = ['Home', 'Work', 'Other'];
const emptyForm = { label: 'Home', name: '', phone: '', city: '', area: '', street: '', landmark: '', isDefault: false };
const inputClass = 'mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';
const labelClass = 'block font-sans text-sm text-ink/70';

const AddressForm = ({ initialData, onSubmit, onCancel, submitLabel = 'Save address' }) => {
  const [formData, setFormData] = useState(() => ({ ...emptyForm, ...initialData }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this address');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-chili-500/10 px-3 py-2 font-sans text-sm text-chili-600">{error}</p>}
      <div className="grid grid-cols-3 gap-2">
        {LABELS.map((label) => (
          <button key={label} type="button" onClick={() => setFormData({ ...formData, label })} className={`rounded-lg border py-2 font-sans text-sm ${formData.label === label ? 'border-indigo-600 bg-indigo-600 text-paper' : 'border-ink/15 text-ink/70'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>Full name</label><input name="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} /></div>
        <div><label className={labelClass}>Phone</label><input name="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} /></div>
      </div>
      <div><label className={labelClass}>City</label><select name="city" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass}><option value="">Select city</option>{CITIES.map((city) => <option key={city} value={city}>{city}</option>)}</select></div>
      <div><label className={labelClass}>Area</label><input name="area" required value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className={inputClass} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>Street (optional)</label><input name="street" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} className={inputClass} /></div>
        <div><label className={labelClass}>Landmark (optional)</label><input name="landmark" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className={inputClass} /></div>
      </div>
      <label className="flex items-center gap-2 font-sans text-sm text-ink/70"><input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />Set as default address</label>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700 disabled:opacity-60">{submitting ? 'Saving...' : submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-lg border border-ink/15 px-5 py-2.5 font-sans text-sm text-ink hover:border-ink/30">Cancel</button>}
      </div>
    </form>
  );
};

export default AddressForm;