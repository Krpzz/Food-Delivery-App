import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const TABS = [
  { key: 'pending', label: 'Pending approval' },
  { key: 'approved', label: 'Approved' },
  { key: '', label: 'All' },
];

const AdminRestaurants = () => {
  const [tab, setTab] = useState('pending');
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    adminService
      .getRestaurants(tab ? { status: tab } : {})
      .then((data) => setRestaurants(data.restaurants))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, [tab]);

  const handleApprove = async (id) => {
    await adminService.approveRestaurant(id);
    load();
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this restaurant? It will disappear from customer browsing immediately.')) return;
    await adminService.suspendRestaurant(id);
    load();
  };

  return (
    <div className="px-6 py-10 sm:px-10">
      <h1 className="font-display text-3xl text-ink">Restaurants</h1>

      <div className="mt-6 flex gap-2 border-b border-ink/10 pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 font-sans text-sm ${
              tab === t.key ? 'bg-indigo-600 text-paper' : 'text-ink/60 hover:bg-ink/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading label="Loading restaurants" />
      ) : restaurants.length === 0 ? (
        <p className="mt-8 font-sans text-sm text-ink/50">No restaurants here.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {restaurants.map((r) => (
            <div key={r._id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-ink/10 p-4">
              <div>
                <p className="font-sans text-sm font-medium text-ink">{r.name}</p>
                <p className="mt-0.5 font-sans text-xs text-ink/50">
                  {r.city} · {r.owner?.name} ({r.owner?.email})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-sans text-xs ${
                    r.isApproved ? 'bg-green-100 text-green-700' : 'bg-marigold-100 text-marigold-600'
                  }`}
                >
                  {r.isApproved ? 'Approved' : 'Pending'}
                </span>
                {r.isApproved ? (
                  <button
                    onClick={() => handleSuspend(r._id)}
                    className="rounded-lg border border-chili-500/30 px-3 py-1.5 font-sans text-xs text-chili-600 hover:bg-chili-500/5"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(r._id)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 font-sans text-xs text-paper hover:bg-indigo-700"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRestaurants;
