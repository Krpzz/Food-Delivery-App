import { useSelector } from 'react-redux';

const STATS = [
  { label: "Today's orders", note: 'Step 4' },
  { label: 'Pending', note: 'Step 4' },
  { label: 'Preparing', note: 'Step 4' },
  { label: 'Completed', note: 'Step 4' },
  { label: "Today's revenue", note: 'Step 4' },
];

const RestaurantDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="px-6 py-10 sm:px-10">
      <p className="font-sans text-sm text-ink/50">Welcome back</p>
      <h1 className="font-display text-3xl text-ink">{user?.name}</h1>
      <p className="mt-2 max-w-lg font-sans text-sm text-ink/60">
        Your login and role-based access are live. Restaurant profile setup and
        menu management are built in Step 4, right after the customer-facing
        browsing screens.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 sm:grid-cols-5">
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

export default RestaurantDashboard;
