import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import menuService from '../services/menuService';

const emptyForm = { name: '', description: '', price: '', discount: '0', category: '', isVeg: true };
const inputClass =
  'mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2.5 font-sans text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';
const labelClass = 'block font-sans text-sm text-ink/70';

// mode: 'create' | 'edit'. In edit mode, pass the existing menu item as initialData.
const MenuItemForm = ({ mode, initialData }) => {
  const navigate = useNavigate();
  const { activeRestaurantId } = useSelector((s) => s.restaurant);
  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    menuService
      .getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price ?? '',
        discount: initialData.discount ?? '0',
        category: initialData.category?._id || initialData.category || '',
        isVeg: initialData.isVeg,
      });
    }
  }, [mode, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('price', formData.price);
    fd.append('discount', formData.discount || '0');
    fd.append('isVeg', formData.isVeg);
    if (formData.category) fd.append('category', formData.category);
    if (imageFile) fd.append('image', imageFile);

    try {
      if (mode === 'create') {
        fd.append('restaurant', activeRestaurantId);
        await menuService.createMenuItem(fd);
      } else {
        await menuService.updateMenuItem(initialData._id, fd);
      }
      navigate('/restaurant/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-10 sm:px-10">
      <h1 className="font-display text-3xl text-ink">
        {mode === 'create' ? 'Add menu item' : `Edit ${initialData?.name}`}
      </h1>

      {error && <p className="mt-4 rounded-lg bg-chili-500/10 px-3 py-2 font-sans text-sm text-chili-600">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className={labelClass}>Name</label>
          <input name="name" required value={formData.name} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" rows={2} value={formData.description} onChange={handleChange} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price (NPR)</label>
            <input type="number" name="price" min="0" required value={formData.price} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Discount %</label>
            <input type="number" name="discount" min="0" max="100" value={formData.discount} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 font-sans text-sm text-ink/70">
          <input type="checkbox" name="isVeg" checked={formData.isVeg} onChange={handleChange} />
          Vegetarian
        </label>

        <div>
          <label className={labelClass}>Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="mt-1.5 w-full font-sans text-sm text-ink/70" />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-sans text-sm text-paper hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : mode === 'create' ? 'Add item' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default MenuItemForm;