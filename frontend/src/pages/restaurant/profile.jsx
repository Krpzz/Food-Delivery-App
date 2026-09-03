import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyRestaurants,
  createRestaurant,
  updateRestaurant,
  setActiveRestaurant,
} from '../../store/slices/restaurantSlice';
import Loading from '../../components/Loading';

const emptyForm = {
  name: '',
  description: '',
  address: '',
  city: '',
  phone: '',
  cuisines: '',
  openingTime: '10:00',
  closingTime: '21:00',
};

const inputClass =
  'mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2.5 font-sans text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';
const labelClass = 'block font-sans text-sm text-ink/70';

const RestaurantProfile = () => {
  const dispatch = useDispatch();
  const { myRestaurants, activeRestaurantId, isLoading, error } = useSelector((s) => s.restaurant);

  const [formData, setFormData] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [mode, setMode] = useState('create'); // 'create' | 'edit'
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Guards the one-time "default to edit mode if restaurants already exist"
  // decision so it doesn't fight the user clicking "+ Add restaurant" later.
  const hasInitialized = useRef(false);

  useEffect(() => {
    dispatch(fetchMyRestaurants());
  }, [dispatch]);

  const activeRestaurant = myRestaurants.find((r) => r._id === activeRestaurantId);

  useEffect(() => {
    if (!isLoading && !hasInitialized.current) {
      hasInitialized.current = true;
      setMode(myRestaurants.length > 0 ? 'edit' : 'create');
    }
  }, [isLoading, myRestaurants.length]);

  useEffect(() => {
    if (mode === 'edit' && activeRestaurant) {
      setFormData({
        name: activeRestaurant.name || '',
        description: activeRestaurant.description || '',
        address: activeRestaurant.address || '',
        city: activeRestaurant.city || '',
        phone: activeRestaurant.phone || '',
        cuisines: (activeRestaurant.cuisines || []).join(', '),
        openingTime: activeRestaurant.openingTime || '10:00',
        closingTime: activeRestaurant.closingTime || '21:00',
      });
    }
  }, [mode, activeRestaurant]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
    if (logoFile) fd.append('logo', logoFile);
    if (coverFile) fd.append('coverImage', coverFile);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    const fd = buildFormData();

    const result =
      mode === 'create'
        ? await dispatch(createRestaurant(fd))
        : await dispatch(updateRestaurant({ id: activeRestaurant._id, formData: fd }));

    setSubmitting(false);

    if (createRestaurant.fulfilled.match(result) || updateRestaurant.fulfilled.match(result)) {
      setSuccessMsg(mode === 'create' ? 'Restaurant created — it will show to customers once an admin approves it.' : 'Changes saved.');
      setLogoFile(null);
      setCoverFile(null);
      if (mode === 'create') setMode('edit');
    }
  };

  const startNewRestaurant = () => {
    setMode('create');
    setFormData(emptyForm);
    setSuccessMsg('');
  };

  if (isLoading && myRestaurants.length === 0) return <Loading label="Loading your restaurant" />;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">
            {mode === 'create' ? 'Set up your restaurant' : activeRestaurant?.name}
          </h1>
          {mode === 'edit' && activeRestaurant && (
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 font-sans text-xs ${
                activeRestaurant.isApproved ? 'bg-green-100 text-green-700' : 'bg-marigold-100 text-marigold-600'
              }`}
            >
              {activeRestaurant.isApproved ? 'Approved & live' : 'Awaiting admin approval'}
            </span>
          )}
        </div>

        {myRestaurants.length > 0 && (
          <div className="flex items-center gap-2">
            {myRestaurants.length > 1 && (
              <select
                value={activeRestaurantId || ''}
                onChange={(e) => {
                  dispatch(setActiveRestaurant(e.target.value));
                  setMode('edit');
                }}
                className="rounded-lg border border-ink/15 px-2 py-1.5 font-sans text-sm"
              >
                {myRestaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
            <button onClick={startNewRestaurant} className="font-sans text-sm text-indigo-600 hover:underline">
              + Add restaurant
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-4 rounded-lg bg-chili-500/10 px-3 py-2 font-sans text-sm text-chili-600">{error}</p>}
      {successMsg && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 font-sans text-sm text-green-700">{successMsg}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className={labelClass}>Restaurant name</label>
          <input name="name" required value={formData.name} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input name="city" required value={formData.city} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input name="phone" required value={formData.phone} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Address</label>
          <input name="address" required value={formData.address} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Cuisines (comma-separated)</label>
          <input
            name="cuisines"
            placeholder="Momo, Newari, Fast Food"
            value={formData.cuisines}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Opens at</label>
            <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Closes at</label>
            <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="mt-1.5 w-full font-sans text-sm text-ink/70" />
          </div>
          <div>
            <label className={labelClass}>Cover image</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="mt-1.5 w-full font-sans text-sm text-ink/70" />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : mode === 'create' ? 'Create restaurant' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantProfile;