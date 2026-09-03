import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const navItems = [
  { label: 'Dashboard', to: '/restaurant/dashboard' },
  { label: 'Menu', to: '/restaurant/menu' },
  { label: 'Profile', to: '/restaurant/profile' },
];

const RestaurantLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 flex-shrink-0 flex-col justify-between bg-indigo-600 text-paper">
        <div>
          <div className="px-6 py-6">
            <p className="font-display text-xl">
              Khaja<span className="text-marigold-400">Go</span>
            </p>
            <p className="mt-0.5 font-sans text-xs text-paper/60">Restaurant partner</p>
          </div>
          <nav className="mt-2 flex flex-col gap-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 font-sans text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-700 text-paper'
                      : 'text-paper/70 hover:bg-indigo-700/60 hover:text-paper'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <p className="mt-6 px-6 font-sans text-xs leading-relaxed text-paper/40">
            Order handling arrives in Step 8.
          </p>
        </div>

        <div className="border-t border-paper/10 px-6 py-4">
          <p className="truncate font-sans text-sm text-paper/80">{user?.name}</p>
          <button
            onClick={handleLogout}
            className="mt-2 font-sans text-xs text-paper/50 hover:text-paper"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default RestaurantLayout;
