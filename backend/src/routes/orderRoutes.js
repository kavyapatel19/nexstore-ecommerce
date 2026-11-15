const express = require('express');
const router = express.Router();
const {
  getMyOrders,
  getSellerOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All order routes require authentication

// User orders
router.get('/my-orders', getMyOrders);

// Sales person orders (orders containing their products)
router.get('/seller-orders', authorize('sales', 'admin'), getSellerOrders);

// Admin orders (all orders)
router.get('/', authorize('admin'), getAllOrders);

// Single order details
router.get('/:id', getOrderById);

// Admin update order status
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;

