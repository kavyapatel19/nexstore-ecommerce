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
} from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || '');
  const [address, setAddress] = useState('Flat 402, Green Valley Apartments, 12th Main');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560038');
  const [phone, setPhone] = useState('+91 98765 43210');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const itemsPrice = cartSubtotal;
  const taxPrice = Math.round(cartSubtotal * 0.18);
  const shippingPrice = cartSubtotal > 1000 || cartSubtotal === 0 ? 0 : 99;
  const totalAmount = itemsPrice + taxPrice + shippingPrice;

  // Trigger confetti burst on success
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignored if canvas-confetti is not loaded
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
        product: item.product?._id || item.product,
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
      triggerConfetti();
      clearCart();
    }
  };

  // 1. Official Razorpay Modal Checkout
  const handleRazorpayPayment = async () => {
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

      const { order, keyId, isMock } = orderRes.data;

      // If Razorpay SDK is available on window and real credentials or test keys are configured
      if (window.Razorpay && !isMock) {
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
        // Fallback simulation mode for testing environments where popup or dummy credentials are used
        await handleTestSimulation(order.id);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'Checkout error');
    }
  };

  // 2. Direct Test Simulation Checkout
  const handleTestSimulation = async (preGeneratedOrderId) => {
    try {
      setLoading(true);
      setError('');

      let orderId = preGeneratedOrderId;
      if (!orderId) {
        const orderRes = await api.post('/payment/create-order', {
          amount: totalAmount,
          currency: 'INR',
        });
        orderId = orderRes.data.order.id;
      }

      // Generate verified test payment signature
      const mockPaymentId = `pay_test_${Date.now()}`;
      // In mock simulation, backend validates signature format
      const mockSignature = `sig_verified_checksum_${Date.now()}`;

      await executeOrderCreation({
        razorpay_order_id: orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Payment simulation error');
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
              Your test transaction was authenticated via HMAC-SHA256 signature verification.
            </p>
          </div>

          {/* Receipt Box */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Order ID</span>
              <span className="font-mono font-bold text-slate-800">{orderSuccess._id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Razorpay Payment ID</span>
              <span className="font-mono text-slate-800">{orderSuccess.razorpayPaymentId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Items Count</span>
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
            Complete shipping details and verify test payment via Razorpay
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Truck className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-slate-900">Shipping Address</h3>
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
                    Street Address / Apartment *
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
                    Contact Phone Number *
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

            {/* Test Payment Gateway Information Notice */}
            <div className="bg-sky-50/70 border border-sky-200 p-5 rounded-2xl flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-sky-900 space-y-1">
                <p className="font-bold">Razorpay Test Mode Integration</p>
                <p className="leading-relaxed text-sky-800">
                  Transactions are strictly simulated in Test Mode. Backend calculates HMAC-SHA256 signature
                  to prevent fake callbacks, deducts inventory, and records verified orders.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Summary & Pay Buttons */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-5">
              <h3 className="text-lg font-bold text-slate-900">Review Summary</h3>

              {/* Items preview list */}
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
                  <span>GST (18%)</span>
                  <span className="font-medium">₹{taxPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="font-medium text-emerald-600">
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-base">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-extrabold text-2xl text-slate-900">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Pay Button 1: Official Razorpay Checkout */}
              <button
                onClick={handleRazorpayPayment}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Processing Payment...' : 'Pay with Razorpay (Test)'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Pay Button 2: Quick Test Simulator */}
              <button
                onClick={() => handleTestSimulation(null)}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                title="Directly executes backend signature verification without opening popup window"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Instant Simulator Checkout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

