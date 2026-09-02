import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearAuthError } from '../../store/slices/authSlice';

const ROLE_REDIRECT = {
  RESTAURANT: '/restaurant/dashboard',
  CUSTOMER: '/',
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      navigate(ROLE_REDIRECT[result.payload.user.role] || '/');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-indigo-600 px-8 py-10 text-paper sm:px-12 lg:py-16">
        <Link to="/" className="font-display text-2xl">
          Khaja<span className="text-marigold-400">Go</span>
        </Link>
        <div className="max-w-sm">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Bring your kitchen online.
          </h1>
          <p className="mt-4 font-sans text-paper/70">
            Sign up as a customer to start ordering, or as a restaurant to list
            your menu once your profile is approved.
          </p>
        </div>
        <p className="font-sans text-xs text-paper/40">
          Admin accounts are created separately and aren't self-serve.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl text-ink">Create your account</h2>
          <p className="mt-1 font-sans text-sm text-ink/60">
            Already have one?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <p className="rounded-lg bg-chili-500/10 px-3 py-2 font-sans text-sm text-chili-600">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {['CUSTOMER', 'RESTAURANT'].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setFormData({ ...formData, role })}
                  className={`rounded-lg border py-2 font-sans text-sm transition-colors ${
                    formData.role === role
                      ? 'border-indigo-600 bg-indigo-600 text-paper'
                      : 'border-ink/15 text-ink/70 hover:border-ink/30'
                  }`}
                >
                  {role === 'CUSTOMER' ? "I'm ordering food" : "I run a restaurant"}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="name" className="block font-sans text-sm text-ink/70">
                Full name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2.5 font-sans text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-sans text-sm text-ink/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2.5 font-sans text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block font-sans text-sm text-ink/70">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2.5 font-sans text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-sans text-sm text-ink/70">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-transparent px-3 py-2.5 font-sans text-ink outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-marigold-500 py-2.5 font-sans font-medium text-ink transition-colors hover:bg-marigold-600 disabled:opacity-60"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
