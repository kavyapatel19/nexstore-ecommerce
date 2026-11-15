const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const memoryStore = require('../config/memoryStore');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      let cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        populate: { path: 'seller', select: 'name email' },
      });

      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      cart.items = cart.items.filter((item) => item.product !== null);
      return res.status(200).json({ success: true, cart });
    } else {
      const cart = memoryStore.getCart(req.user._id || req.user.id);
      return res.status(200).json({ success: true, cart });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
      }

      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + Number(quantity);
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Maximum available stock is ${product.stock}`,
          });
        }
        cart.items[existingIndex].quantity = newQty;
        cart.items[existingIndex].price = product.price;
      } else {
        cart.items.push({
          product: productId,
          quantity: Number(quantity),
          price: product.price,
        });
      }

      await cart.save();

      const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        populate: { path: 'seller', select: 'name email' },
      });

      return res.status(200).json({
        success: true,
        message: 'Item added to cart',
        cart: populatedCart,
      });
    } else {
      const cart = memoryStore.addToCart(req.user._id || req.user.id, productId, quantity);
      return res.status(200).json({
        success: true,
        message: 'Item added to cart',
        cart,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock})`,
        });
      }

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

      cart.items[itemIndex].quantity = Number(quantity);
      cart.items[itemIndex].price = product.price;
      await cart.save();

      const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        populate: { path: 'seller', select: 'name email' },
      });

      return res.status(200).json({ success: true, message: 'Cart updated', cart: populatedCart });
    } else {
      const cart = memoryStore.updateCartQuantity(req.user._id || req.user.id, productId, quantity);
      return res.status(200).json({ success: true, message: 'Cart updated', cart });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
      await cart.save();

      const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        populate: { path: 'seller', select: 'name email' },
      });

      return res.status(200).json({ success: true, message: 'Item removed', cart: populatedCart });
    } else {
      const cart = memoryStore.removeCartItem(req.user._id || req.user.id, productId);
      return res.status(200).json({ success: true, message: 'Item removed', cart });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      let cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
      return res.status(200).json({ success: true, message: 'Cart cleared' });
    } else {
      const cart = memoryStore.clearCart(req.user._id || req.user.id);
      return res.status(200).json({ success: true, message: 'Cart cleared', cart });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
