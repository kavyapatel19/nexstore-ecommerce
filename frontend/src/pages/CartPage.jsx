import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { cartItems, cartSubtotal, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tax = Math.round(cartSubtotal * 0.18);
  const shipping = cartSubtotal > 1000 || cartSubtotal === 0 ? 0 : 99;
  const grandTotal = cartSubtotal + tax + shipping;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Your Cart is Waiting</h2>
          <p className="text-sm text-slate-500">
            Please sign in to view your saved items, update quantities, and proceed to checkout.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-sm transition-colors"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review your items and proceed with secure test Razorpay checkout
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Entire Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Your cart is currently empty</h3>
            <p className="text-sm text-slate-500">
              Looks like you haven't added any products to your cart yet. Explore our curated catalog!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-sm font-semibold transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.product || {};
                const itemPrice = product.price || item.price || 0;
                const itemImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80';

                return (
                  <div
                    key={product._id || item._id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-4 hover:border-sky-200 transition-colors"
                  >
                    {/* Thumbnail */}
                    <img
                      src={itemImage}
                      alt={product.name || 'Product'}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                        {product.category || 'Product'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Seller: {product.seller?.name || 'Verified Seller'}
                      </p>
                      <p className="text-sm font-extrabold text-slate-900 pt-1">
                        ₹{Number(itemPrice).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 text-xs font-bold text-slate-800 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm"
                          disabled={item.quantity >= (product.stock || 99)}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <span className="block text-xs text-slate-400">Total</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg h-fit space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated GST (18%)</span>
                  <span className="font-semibold text-slate-800">
                    ₹{tax.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between text-base">
                  <span className="font-bold text-slate-900">Total Payable</span>
                  <span className="font-extrabold text-2xl text-slate-900">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold shadow-lg shadow-slate-900/15 hover:shadow-sky-500/25 transition-all text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Protected by Razorpay Test Verification</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

