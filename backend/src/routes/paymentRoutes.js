const express = require('express');
const router = express.Router();
const {
  createOrder,
  signTestPayment,
  verifyPaymentAndCreateOrder,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/create-order', createOrder);
router.post('/sign-test-payment', signTestPayment);
router.post('/verify-payment', verifyPaymentAndCreateOrder);

module.exports = router;
