// General-purpose role gate: authorize('ADMIN', 'RESTAURANT') etc.
// Must run after protect(), since it reads req.user.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action',
      });
    }
    next();
  };
};

// Named to match the project structure (Section 2) — the common case of
// "admin-only route" gets its own convenience export.
const isAdmin = authorize('ADMIN');

module.exports = { authorize, isAdmin };
