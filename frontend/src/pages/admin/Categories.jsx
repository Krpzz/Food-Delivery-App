import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import menuService from '../../services/menuService';
import Loading from '../../components/Loading';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const load = () => {
    setIsLoading(true);
    adminService
      .getCategories()
      .then((data) => setCategories(data.categories))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    const fd = new FormData();
    fd.append('name', newName.trim());
    await menuService.createCategory(fd);
    setNewName('');
    setIsCreating(false);
    load();
  };

  const handleToggleActive = async (category) => {
    const fd = new FormData();
    fd.append('isActive', String(!category.isActive));
    await menuService.updateCategory(category._id, fd);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Menu items using it will keep working, just without a category.')) return;
    await menuService.deleteCategory(id);
    load();
  };

  return (
    <div className="px-6 py-10 sm:px-10">
      <h1 className="font-display text-3xl text-ink">Categories</h1>

      <form onSubmit={handleCreate} className="mt-6 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="rounded-lg border border-ink/15 bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-sans text-sm text-paper hover:bg-indigo-700 disabled:opacity-60"
        >
          {isCreating ? 'Adding…' : 'Add category'}
        </button>
      </form>

      {isLoading ? (
        <Loading label="Loading categories" />
      ) : (
        <div className="mt-6 space-y-2">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between gap-4 rounded-lg border border-ink/10 p-3">
              <p className="font-sans text-sm text-ink">{cat.name}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`rounded-full px-2.5 py-0.5 font-sans text-xs ${
                    cat.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/50'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleDelete(cat._id)} className="font-sans text-xs text-chili-600 hover:underline">
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

export default AdminCategories;
