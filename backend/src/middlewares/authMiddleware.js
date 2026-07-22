/**
 * @file authMiddleware.js
 * @description JWT authentication middleware for protecting routes.
 */

import jwt from 'jsonwebtoken';

/**
 * Verify JWT token and attach user to request
 */
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided, authorization denied',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired',
      });
    }

    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }
};
