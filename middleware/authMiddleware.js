const { verifyToken } = require('../services/tokenService');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Be tolerant of different formats: "Bearer <token>", "Bearer Bearer <token>", or just "<token>"
    const parts = authHeader.split(' ').filter(Boolean);
    const token = parts.length > 1 ? parts[parts.length - 1] : parts[0];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Auth error:', error.message);
    }
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
