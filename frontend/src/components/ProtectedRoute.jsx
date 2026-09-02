import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Frontend routing is UX only — the real security boundary is the backend's
// protect()/authorize() middleware. This just keeps people out of screens
// that aren't theirs and sends them somewhere sensible instead.
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
