import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const ROLE_FILTERS = ['', 'CUSTOMER', 'RESTAURANT', 'ADMIN'];

const AdminUsers = () => {
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    adminService
      .getUsers({ role: role || undefined, search: search || undefined })
      .then((data) => setUsers(data.users))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, [role]);

  const handleToggle = async (id) => {
    await adminService.toggleUserActive(id);
    load();
  };

  return (
    <div className="px-6 py-10 sm:px-10">
      <h1 className="font-display text-3xl text-ink">Users</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          className="rounded-lg border border-ink/15 bg-transparent px-3 py-2 font-sans text-sm text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-ink/15 px-3 py-2 font-sans text-sm">
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>
              {r || 'All roles'}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Loading label="Loading users" />
      ) : (
        <div className="mt-6 space-y-2">
          {users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-ink/10 p-3">
              <div>
                <p className="font-sans text-sm text-ink">
                  {u.name} <span className="text-ink/40">· {u.role}</span>
                </p>
                <p className="font-sans text-xs text-ink/50">
                  {u.email} · {u.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 font-sans text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/50'}`}>
                  {u.isActive ? 'Active' : 'Deactivated'}
                </span>
                <button onClick={() => handleToggle(u._id)} className="font-sans text-xs text-indigo-600 hover:underline">
                  {u.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;