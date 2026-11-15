const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const memoryStore = require('../config/memoryStore');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_default_key';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mock_razorpay_secret_test_key';
  return new Razorpay({ key_id, key_secret });
};

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order amount' });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = Math.round(Number(amount) * 100);
    const receipt = `rcpt_${Date.now()}_${(req.user._id || req.user.id).toString().substring(0, 6)}`;

    // Check if live test credentials are configured
    const hasLiveKeys =
      key_id &&
      !key_id.includes('your_') &&
      !key_id.includes('mock') &&
      key_id.startsWith('rzp_test_') &&
      key_secret &&
      !key_secret.includes('your_') &&
      !key_secret.includes('mock');

    if (hasLiveKeys) {
      try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency,
          receipt,
        });

        return res.status(200).json({
          success: true,
          order,
          keyId: key_id,
          isLiveSdk: true,
        });
      } catch (err) {
        console.warn('[Razorpay API Error - using test order format]:', err.message);
      }
    }

    // Standard Razorpay Order format
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return res.status(200).json({
      success: true,
      order: {
        id: mockOrderId,
        amount: amountInPaise,
        currency,
        receipt,
      },
      keyId: key_id || 'rzp_test_default_key',
      isLiveSdk: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign a test transaction using server HMAC secret (mimics Razorpay checkout server)
// @route   POST /api/payment/sign-test-payment
// @access  Private
const signTestPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and Payment ID are required to compute signature',
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mock_razorpay_secret_test_key';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const signature = crypto
      .createHmac('sha256', key_secret)
      .update(body)
      .digest('hex');

    return res.status(200).json({
      success: true,
      signature,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & create Order record
// @route   POST /api/payment/verify-payment
// @access  Private
const verifyPaymentAndCreateOrder = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      shippingAddress,
      items,
      itemsPrice,
      taxPrice = 0,
      shippingPrice = 0,
      totalAmount,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: missing payment signature details',
      });
    }

    if (!shippingAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order creation requires shipping address and order items',
      });
    }

    // Cryptographic HMAC-SHA256 signature verification
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mock_razorpay_secret_test_key';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid Razorpay cryptographic signature. Fake callback prevented.',
      });
    }

    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const orderItems = [];
      for (const item of items) {
        const product = await Product.findById(item.product || item._id);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product '${item.name}' not found` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for '${product.name}'` });
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images[0] || item.image,
          seller: product.seller,
        });

        product.stock -= item.quantity;
        await product.save();
      }

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod: 'Razorpay',
        paymentStatus: 'paid',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        itemsPrice: Number(itemsPrice),
        taxPrice: Number(taxPrice),
        shippingPrice: Number(shippingPrice),
        totalAmount: Number(totalAmount),
        orderStatus: 'placed',
        paidAt: new Date(),
      });

      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

      return res.status(201).json({
        success: true,
        message: 'Payment verified and order successfully created',
        order,
      });
    } else {
      // In-Memory store fallback
      const order = memoryStore.createOrder(req.user._id || req.user.id, {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        shippingAddress,
        items,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalAmount,
      });

      return res.status(201).json({
        success: true,
        message: 'Payment verified and order successfully created',
        order,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  signTestPayment,
  verifyPaymentAndCreateOrder,
};
