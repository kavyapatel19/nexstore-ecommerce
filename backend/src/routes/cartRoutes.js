const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart routes require authentication

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItemQuantity);
router.delete('/:productId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;

