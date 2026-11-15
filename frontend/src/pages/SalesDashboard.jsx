import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Package,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function SalesDashboard({ onOpenAddProduct, onOpenEditProduct }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        api.get('/products/seller/me'),
        api.get('/orders/seller-orders'),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
      }
      if (orderRes.data.success) {
        setOrders(orderRes.data.orders);
        setTotalRevenue(orderRes.data.totalRevenue || 0);
      }
    } catch (err) {
      console.error('[SalesDashboard] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete your product listing?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchSalesData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const totalUnitsSold = orders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                Sales Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Seller Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Manage your product catalog, monitor inventory, and fulfill customer orders
            </p>
          </div>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Product
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Products Listed</p>
              <h3 className="text-2xl font-black text-slate-900">{products.length}</h3>
              <p className="text-xs text-amber-600 font-medium">Active in store</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Units Sold</p>
              <h3 className="text-2xl font-black text-slate-900">{totalUnitsSold}</h3>
              <p className="text-xs text-sky-600 font-medium">Across {orders.length} orders</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-900">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-emerald-600 font-medium">Verified payout</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex gap-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Orders for My Products ({orders.length})
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading seller records...</p>
          </div>
        ) : activeTab === 'products' ? (
          /* Products Tab */
          products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
              <Package className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">You haven't listed any products yet</h3>
              <p className="text-sm text-slate-500">
                Upload your first item with high-res Cloudinary images to start selling on NexStore.
              </p>
              <button
                onClick={onOpenAddProduct}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-semibold text-sm rounded-xl shadow-md"
              >
                <PlusCircle className="w-4 h-4" /> Add Product Now
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
                              <p className="text-xs text-slate-400 truncate max-w-xs">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${product.stock <= 5 ? 'text-amber-600' : 'text-slate-800'}`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {product.stock > 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                              Out of stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => onOpenEditProduct(product)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Orders Tab */
          orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
              <Clock className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No orders containing your items yet</h3>
              <p className="text-sm text-slate-500">
                When customers purchase items listed by your seller account, they will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 text-xs text-slate-500">
                    <div>
                      <span>Customer: </span>
                      <strong className="text-slate-800">{order.user?.name || 'Customer'}</strong> ({order.user?.email})
                    </div>
                    <div>
                      <span>Date: </span>
                      <strong className="text-slate-800">{new Date(order.createdAt).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span>Status: </span>
                      <span className="capitalize font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                        {order.orderStatus}
                      </span>
                    </div>
                    <div>
                      <span>Your Share: </span>
                      <strong className="text-emerald-700 text-sm font-extrabold">
                        ₹{Number(order.sellerSubtotal).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Shipping To: </span>
                    <span>{order.shippingAddress?.fullName}, {order.shippingAddress?.address}, {order.shippingAddress?.city}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

