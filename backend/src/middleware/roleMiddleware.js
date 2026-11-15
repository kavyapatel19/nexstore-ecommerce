const Product = require('../models/Product');

/**
 * Grant access to specific roles
 * @param  {...string} roles - e.g. 'admin', 'sales', 'user'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to role authorization',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this route. Required roles: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

/**
 * Strict product ownership validator:
 * Admin can modify/delete any product.
 * Sales Person can modify/delete ONLY products where seller === req.user._id.
 * Normal users are blocked completely.
 */
const authorizeProductOwnerOrAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Admin has full power
    if (req.user.role === 'admin') {
      req.product = product;
      return next();
    }

    // Sales Person must be owner
    if (req.user.role === 'sales') {
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only modify or delete your own products',
        });
      }
      req.product = product;
      return next();
    }

    // Other roles forbidden
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You do not have permissions to manage products',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorize,
  authorizeProductOwnerOrAdmin,
};

