import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Package, Calendar, Clock, CreditCard, MapPin, ArrowLeft, Loader2 } from 'lucide-react';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('[UserOrders] Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'shipped':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">Shipped</span>;
      case 'processing':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Processing</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Placed</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Order History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and view details of all your placed orders and payment records
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-sm text-slate-500">Retrieving your order records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No orders found yet</h3>
            <p className="text-sm text-slate-500">
              When you purchase products, your order confirmation and shipment tracking will appear here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-sm font-semibold transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:border-sky-200 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div>
                      <span className="block font-medium">ORDER PLACED</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="block font-medium">TOTAL AMOUNT</span>
                      <span className="font-bold text-slate-900">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="block font-medium">PAYMENT ID</span>
                      <span className="font-mono text-slate-700">{order.razorpayPaymentId || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-xs font-mono font-medium text-slate-400">
                      #{order._id.substring(order._id.length - 8)}
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="p-4 sm:p-6 divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Qty: <span className="font-semibold text-slate-700">{item.quantity}</span> |
                          Price: ₹{Number(item.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <span className="font-extrabold text-sm text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment summary */}
                <div className="px-4 sm:px-6 py-3 bg-slate-50/40 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      Ship to: <strong>{order.shippingAddress?.fullName}</strong>, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Payment Verified via Razorpay</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

