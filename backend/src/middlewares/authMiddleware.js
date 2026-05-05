import jwt from 'jsonwebtoken';

const parseCookies = (cookieHeader = '') => Object.fromEntries(
  cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const separatorIndex = cookie.indexOf('=');
      if (separatorIndex === -1) return [cookie, ''];
      return [
        decodeURIComponent(cookie.slice(0, separatorIndex)),
        decodeURIComponent(cookie.slice(separatorIndex + 1)),
      ];
    })
);

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || parseCookies(req.headers.cookie).authToken;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT secret is not configured' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const requireRoles = (...allowedRoles) => (req, res, next) => {
  authenticateToken(req, res, () => {
    const role = String(req.user?.role || '').trim().toLowerCase();
    const allowed = allowedRoles.map((allowedRole) => String(allowedRole || '').trim().toLowerCase());

    if (!allowed.includes(role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  });
};
