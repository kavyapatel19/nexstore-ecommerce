import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  ShieldCheck,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  CheckCircle,
  Truck,
  Clock,
  Trash2,
  Edit3,
  PlusCircle,
  AlertCircle,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';

export default function AdminDashboard({ onOpenAddProduct, onOpenEditProduct }) {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'orders' | 'users' | 'products'
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, usersRes, productsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/orders'),
        api.get('/admin/users'),
        api.get('/products?limit=100'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (productsRes.data.success) setProducts(productsRes.data.products);
    } catch (err) {
      console.error('[AdminDashboard] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this product as Admin?')) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const filteredOrders =
    orderStatusFilter === 'All'
      ? orders
      : orders.filter((o) => o.orderStatus === orderStatusFilter);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                Super Admin Access
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Platform Administration
            </h1>
            <p className="text-sm text-slate-500">
              Complete oversight of sales analytics, order fulfillment, users, and platform catalog
            </p>
          </div>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-sm shadow-md transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            Add Any Product
          </button>
        </div>

        {/* Global Platform Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales</p>
              <h3 className="text-2xl font-black text-slate-900">
                ₹{stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString('en-IN') : 0}
              </h3>
              <p className="text-xs text-emerald-600 font-medium">Verified Razorpay Payments</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
              <h3 className="text-2xl font-black text-slate-900">{stats?.totalOrders || orders.length}</h3>
              <p className="text-xs text-sky-600 font-medium">All platform transactions</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalog Items</p>
              <h3 className="text-2xl font-black text-slate-900">{stats?.totalProducts || products.length}</h3>
              <p className="text-xs text-indigo-600 font-medium">Active product listings</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Users</p>
              <h3 className="text-2xl font-black text-slate-900">{stats?.totalUsers || users.length}</h3>
              <p className="text-xs text-purple-600 font-medium">Admins, Sellers & Users</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-slate-200 flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Orders Management ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Users & Roles ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Products ({products.length})
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading admin telemetry data...</p>
          </div>
        ) : activeTab === 'analytics' ? (
          /* Analytics Overview */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Roles Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">User Roles Distribution</h3>
              <div className="space-y-3">
                {stats?.usersByRole?.map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <span className="capitalize font-semibold text-sm text-slate-700">
                      {r._id === 'user' ? 'Customer' : r._id}
                    </span>
                    <span className="font-extrabold text-sm px-3 py-1 rounded-full bg-white border border-slate-200">
                      {r.count} users
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Products by Category</h3>
              <div className="space-y-3">
                {stats?.categoryStats?.map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                    <span className="font-semibold text-sm text-slate-700">{c._id}</span>
                    <span className="font-extrabold text-sm px-3 py-1 rounded-full bg-white border border-slate-200">
                      {c.count} items
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          /* Orders Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Status:</span>
              <div className="flex gap-2 overflow-x-auto">
                {['All', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Order ID & Date</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Items Count</th>
                      <th className="px-6 py-4">Current Status</th>
                      <th className="px-6 py-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono font-bold text-slate-900 text-xs">
                            #{order._id.substring(order._id.length - 8)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{order.user?.name || 'Customer'}</p>
                          <p className="text-xs text-slate-400">{order.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">{order.items?.length || 0} item(s)</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                              order.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.orderStatus === 'shipped'
                                ? 'bg-sky-100 text-sky-800'
                                : order.orderStatus === 'processing'
                                ? 'bg-amber-100 text-amber-800'
                                : order.orderStatus === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            disabled={updatingOrderId === order._id}
                            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm"
                          >
                            <option value="placed">Placed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          /* Users Tab */
          <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4">Role Assignment</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover bg-slate-200"
                            />
                            <span className="font-bold text-slate-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{u.email}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : u.role === 'sales'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            <option value="user">Customer</option>
                            <option value="sales">Sales Person</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete User"
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
          </div>
        ) : (
          /* Products Tab (Admin Full Control) */
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Seller</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0]}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                            />
                            <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium">{p.category}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">{p.stock}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {p.seller?.name || 'Seller'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => onOpenEditProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
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
          </div>
        )}
      </div>
    </div>
  );
}

