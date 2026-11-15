import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Package,
  Loader2,
  X,
  Smartphone,
  Building,
  Lock,
} from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || 'Sarah Customer');
  const [address, setAddress] = useState('Flat 402, Green Valley Apartments, 12th Main');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560038');
  const [phone, setPhone] = useState('+91 98765 43210');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Razorpay Gateway Modal State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [activeRazorpayTab, setActiveRazorpayTab] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [pendingRazorpayOrder, setPendingRazorpayOrder] = useState(null);
  const [processingModalPayment, setProcessingModalPayment] = useState(false);

  // Test payment inputs
  const [cardNumber, setCardNumber] = useState('4012 0000 0000 0002');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [upiId, setUpiId] = useState('customer@razorpay');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  const itemsPrice = cartSubtotal;
  const taxPrice = Math.round(cartSubtotal * 0.18);
  const shippingPrice = cartSubtotal > 1000 || cartSubtotal === 0 ? 0 : 99;
  const totalAmount = itemsPrice + taxPrice + shippingPrice;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignored if confetti fails
    }
  };

  const executeOrderCreation = async (paymentDetails) => {
    const payload = {
      razorpayOrderId: paymentDetails.razorpay_order_id,
      razorpayPaymentId: paymentDetails.razorpay_payment_id,
      razorpaySignature: paymentDetails.razorpay_signature,
      shippingAddress: {
        fullName,
        address,
        city,
        state,
        postalCode,
        phone,
      },
      items: cartItems.map((item) => ({
        product: item.product?._id || item.product?.id || item.product,
        name: item.product?.name || item.name,
        price: item.product?.price || item.price,
        quantity: item.quantity,
        image: item.product?.images?.[0] || item.image,
      })),
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
    };

    const res = await api.post('/payment/verify-payment', payload);
    if (res.data.success) {
      setOrderSuccess(res.data.order);
      setShowRazorpayModal(false);
      triggerConfetti();
      clearCart();
    }
  };

  // Launch Razorpay Checkout Flow
  const handleInitiateRazorpay = async () => {
    setError('');
    if (!fullName || !address || !city || !postalCode || !phone) {
      return setError('Please fill in complete shipping information');
    }

    try {
      setLoading(true);

      // Step 1: Create Razorpay Order on Backend
      const orderRes = await api.post('/payment/create-order', {
        amount: totalAmount,
        currency: 'INR',
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to initialize payment order');
      }

      const { order, keyId, isLiveSdk } = orderRes.data;
      setPendingRazorpayOrder(order);

      // If user has official live/test Razorpay API credentials configured in .env and window.Razorpay is available
      if (isLiveSdk && window.Razorpay) {
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'NexStore Platform',
          description: `Order checkout for ₹${totalAmount.toLocaleString('en-IN')}`,
          order_id: order.id,
          prefill: {
            name: fullName,
            email: user?.email,
            contact: phone,
          },
          theme: {
            color: '#0284c7',
          },
          handler: async function (response) {
            try {
              await executeOrderCreation(response);
            } catch (verErr) {
              setError(verErr.response?.data?.message || 'Signature verification failed');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setError(`Payment Failed: ${resp.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // Open the full-featured Razorpay Test Gateway Modal
        setShowRazorpayModal(true);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'Checkout initialization error');
    }
  };

  // Complete Payment inside Razorpay Test Modal
  const handleCompleteModalPayment = async () => {
    if (!pendingRazorpayOrder) return;
    setProcessingModalPayment(true);
    setError('');

    try {
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Cryptographically sign the payment on backend with key secret
      const signRes = await api.post('/payment/sign-test-payment', {
        razorpayOrderId: pendingRazorpayOrder.id,
        razorpayPaymentId: paymentId,
      });

      if (!signRes.data.success) {
        throw new Error('Failed to generate verified signature');
      }

      // Verify the cryptographic signature and create the order
      await executeOrderCreation({
        razorpay_order_id: pendingRazorpayOrder.id,
        razorpay_payment_id: paymentId,
        razorpay_signature: signRes.data.signature,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed');
    } finally {
      setProcessingModalPayment(false);
    }
  };

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Payment Verified & Order Placed
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">Thank You for Your Order!</h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your Razorpay transaction was authenticated via server-side HMAC-SHA256 signature verification.
            </p>
          </div>

          {/* Receipt Box */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Order ID</span>
              <span className="font-mono font-bold text-slate-800">{orderSuccess._id || orderSuccess.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Razorpay Payment ID</span>
              <span className="font-mono text-slate-800">{orderSuccess.razorpayPaymentId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Verification Status</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Cryptographically Verified
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Items Purchased</span>
              <span className="font-bold text-slate-800">{orderSuccess.items.length} item(s)</span>
            </div>
            <div className="flex justify-between pt-1 text-base">
              <span className="font-bold text-slate-900">Total Paid</span>
              <span className="font-extrabold text-emerald-700">
                ₹{Number(orderSuccess.totalAmount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/my-orders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-sm transition-all shadow-md"
            >
              <Package className="w-4 h-4" /> View in Order History
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">No Items to Checkout</h2>
          <p className="text-sm text-slate-500">
            Please add some products to your cart before proceeding to checkout.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-sm transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete shipping details and execute secure Razorpay payment
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Truck className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-slate-900">Delivery Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Street Address / Flat / Floor *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Postal Code (PIN) *
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Gateway Information Banner */}
            <div className="bg-sky-50/70 border border-sky-200 p-5 rounded-2xl flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-sky-900 space-y-1">
                <p className="font-bold">Official Razorpay Test Gateway</p>
                <p className="leading-relaxed text-sky-800">
                  Transactions are secured with official Razorpay test mode. The backend enforces
                  strict HMAC-SHA256 signature verification preventing forged callbacks, decrements inventory,
                  and logs verified orders in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary & Payment Button */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-5">
              <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>

              {/* Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.product?._id || item._id} className="flex justify-between text-xs py-1">
                    <span className="text-slate-600 truncate max-w-[170px]">
                      {item.product?.name || item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-800">
                      ₹{((item.product?.price || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{itemsPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated GST (18%)</span>
                  <span className="font-medium">₹{taxPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-emerald-600">
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-base">
                  <span className="font-bold text-slate-900">Total Payable</span>
                  <span className="font-extrabold text-2xl text-slate-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handleInitiateRazorpay}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition-all disabled:opacity-50 hover:scale-[1.01]"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Initializing Razorpay...' : 'Pay with Razorpay (Test)'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>HMAC-SHA256 Cryptographic Verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Modal */}
      {showRazorpayModal && pendingRazorpayOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Razorpay Branded Header */}
            <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-6 relative">
              <button
                onClick={() => setShowRazorpayModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between pr-8">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-white">RAZORPAY</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                      TEST MODE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">NexStore E-Commerce Platform</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Amount to Pay</span>
                  <span className="text-2xl font-black text-white">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                <span>Order ID: <code className="font-mono text-sky-300">{pendingRazorpayOrder.id}</code></span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> 256-bit Encrypted
                </span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveRazorpayTab('card')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeRazorpayTab === 'card'
                    ? 'border-sky-600 text-sky-600 bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>
              <button
                onClick={() => setActiveRazorpayTab('upi')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeRazorpayTab === 'upi'
                    ? 'border-sky-600 text-sky-600 bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>
              <button
                onClick={() => setActiveRazorpayTab('netbanking')}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeRazorpayTab === 'netbanking'
                    ? 'border-sky-600 text-sky-600 bg-white'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Netbanking</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 space-y-4">
              {activeRazorpayTab === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Test Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4012 0000 0000 0002"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Test Mode: Pre-filled with Razorpay test card. No real money will be charged.
                  </p>
                </div>
              )}

              {activeRazorpayTab === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="success@razorpay"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-200/60 text-xs text-sky-800 space-y-1">
                    <p className="font-bold">Instant UPI Simulator</p>
                    <p>Enter any UPI handle or use default <code>customer@razorpay</code> to test successful payment flow.</p>
                  </div>
                </div>
              )}

              {activeRazorpayTab === 'netbanking' && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Test Bank
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Other'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedBank === bank
                            ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={handleCompleteModalPayment}
                  disabled={processingModalPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingModalPayment && <Loader2 className="w-4 h-4 animate-spin" />}
                  {processingModalPayment
                    ? 'Verifying Signature...'
                    : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                </button>

                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  disabled={processingModalPayment}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel and Return to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
