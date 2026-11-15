const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../config/memoryStore');

/**
 * Protect routes: verifies JWT in Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_role_based_ecommerce_platform_2026'
      );

      let user;
      const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

      if (isMongo) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        user = memoryStore.findUserById(decoded.id);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('[AuthMiddleware] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: token is invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: no token provided',
    });
  }
};

module.exports = {
  protect,
};
