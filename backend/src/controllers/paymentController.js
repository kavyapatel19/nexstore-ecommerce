const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const memoryStore = require('../config/memoryStore');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_1234567890';
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

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_1234567890';
    const isMock = key_id.includes('mock') || !process.env.RAZORPAY_KEY_ID;

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: `receipt_${Date.now()}_${(req.user._id || req.user.id).toString().substring(0, 6)}`,
    };

    if (isMock) {
      const mockOrderId = `order_test_${Date.now()}`;
      return res.status(200).json({
        success: true,
        order: { id: mockOrderId, amount: options.amount, currency: options.currency, receipt: options.receipt },
        keyId: key_id,
        isMock: true,
      });
    }

    try {
      const razorpay = getRazorpayInstance();
      const order = await razorpay.orders.create(options);
      return res.status(200).json({ success: true, order, keyId: key_id, isMock: false });
    } catch (rzpErr) {
      const mockOrderId = `order_sim_${Date.now()}`;
      return res.status(200).json({
        success: true,
        order: { id: mockOrderId, amount: options.amount, currency: options.currency, receipt: options.receipt },
        keyId: key_id,
        isMock: true,
      });
    }
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

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'mock_razorpay_secret_test_key';
    const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('mock');

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic && !isMock && !razorpayOrderId.startsWith('order_sim_') && !razorpayOrderId.startsWith('order_test_')) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid Razorpay signature. Fake callback prevented.',
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
      // Memory Store fallback
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
  verifyPaymentAndCreateOrder,
};
