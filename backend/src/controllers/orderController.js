const Order = require('../models/Order');

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private (User)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders containing products belonging to current seller
// @route   GET /api/orders/seller-orders
// @access  Private (Sales Person, Admin)
const getSellerOrders = async (req, res, next) => {
  try {
    // Find all orders where at least one item belongs to current seller
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    // Filter order items so seller sees their relevant items and seller subtotal
    const formattedOrders = orders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.seller.toString() === req.user._id.toString()
      );
      const sellerSubtotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        _id: order._id,
        user: order.user,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        items: sellerItems,
        sellerSubtotal,
      };
    });

    // Calculate total seller revenue
    const totalRevenue = formattedOrders.reduce(
      (sum, o) => sum + o.sellerSubtotal,
      0
    );

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      totalRevenue,
      orders: formattedOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private (Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private (Owner, Seller of an item, Admin)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.seller', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Role-based authorization for viewing this specific order
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSeller = order.items.some(
      (item) => item.seller._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrders,
  getSellerOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};

