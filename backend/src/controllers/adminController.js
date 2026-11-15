const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const memoryStore = require('../config/memoryStore');

// @desc    Get dashboard analytics & statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const totalUsers = await User.countDocuments();
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();

      const salesAggregation = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]);
      const totalRevenue = salesAggregation.length > 0 ? salesAggregation[0].totalRevenue : 0;

      const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      const categoryStats = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const recentOrders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalUsers,
          usersByRole,
          categoryStats,
          recentOrders,
        },
      });
    } else {
      const stats = memoryStore.getStats();
      return res.status(200).json({
        success: true,
        stats,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const { role, keyword } = req.query;
      const query = {};
      if (role && role !== 'All') query.role = role;
      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
        ];
      }

      const users = await User.find(query).select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: users.length, users });
    } else {
      const users = memoryStore.getAllUsers(req.query.role, req.query.keyword);
      return res.status(200).json({ success: true, count: users.length, users });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['admin', 'sales', 'user'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}`,
      });
    }

    const currentUserId = req.user._id || req.user.id;
    if (req.params.id === currentUserId.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Action blocked: You cannot demote your own admin account',
      });
    }

    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.role = role;
      await user.save();
      return res.status(200).json({
        success: true,
        message: `User role changed to '${role}'`,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } else {
      const user = memoryStore.updateUserRole(req.params.id, role);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(200).json({
        success: true,
        message: `User role changed to '${role}'`,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    if (req.params.id === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Action blocked: You cannot delete your own admin account',
      });
    }

    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      await User.deleteOne({ _id: req.params.id });
    } else {
      memoryStore.deleteUser(req.params.id);
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
