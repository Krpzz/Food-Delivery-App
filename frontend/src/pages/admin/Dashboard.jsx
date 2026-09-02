import { useSelector } from 'react-redux';

const STATS = [
  { label: 'Total customers', note: 'Step 11' },
  { label: 'Total restaurants', note: 'Step 4' },
  { label: 'Total orders', note: 'Step 8' },
  { label: 'Total revenue', note: 'Step 11' },
  { label: 'Pending orders', note: 'Step 8' },
  { label: 'Completed orders', note: 'Step 8' },
];

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="px-6 py-10 sm:px-10">
      <p className="font-sans text-sm text-ink/50">Signed in as admin</p>
      <h1 className="font-display text-3xl text-ink">{user?.name}</h1>
      <p className="mt-2 max-w-lg font-sans text-sm text-ink/60">
        User management, restaurant approvals, categories and coupons are built
        out in Step 11, once there's real restaurant and order data to manage.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-paper px-5 py-6">
            <p className="font-display text-2xl text-ink/30">—</p>
            <p className="mt-1 font-sans text-xs text-ink/60">{stat.label}</p>
            <p className="font-sans text-[11px] text-marigold-600">{stat.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
