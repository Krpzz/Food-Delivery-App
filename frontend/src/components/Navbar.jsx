import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-2xl text-indigo-600">
          Khaja<span className="text-marigold-500">Go</span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link to="/restaurants" className="hidden font-sans text-sm text-ink/70 hover:text-ink sm:inline">
            Restaurants
          </Link>
          {user ? (
            <>
              <span className="hidden font-sans text-sm text-ink/70 sm:inline">
                Hi, {user.name.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-ink/15 px-4 py-1.5 font-sans text-sm text-ink transition-colors hover:border-ink/30"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-sans text-sm text-ink/80 hover:text-ink"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-indigo-600 px-4 py-1.5 font-sans text-sm text-paper transition-colors hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;