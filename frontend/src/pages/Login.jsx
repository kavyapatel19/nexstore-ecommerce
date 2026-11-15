import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Lock, Mail, ShieldCheck, TrendingUp, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      return setError('Please enter both email and password');
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (res?.success) {
        // Redirect according to role or previous intended path
        if (from !== '/') {
          navigate(from, { replace: true });
        } else if (res.user.role === 'admin') {
          navigate('/admin');
        } else if (res.user.role === 'sales') {
          navigate('/sales');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 items-center justify-center text-white shadow-lg shadow-sky-500/25">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back to NexStore
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to access your role-based e-commerce portal
          </p>
        </div>

        {/* Quick Demo Credentials Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Test Credentials
            </span>
            <span className="text-[10px] text-sky-600 font-medium">Click to pre-fill</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@example.com', 'Admin@123')}
              className="flex flex-col items-center p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 transition-all text-center"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 mb-1" />
              <span className="text-xs font-bold">Admin</span>
              <span className="text-[10px] text-purple-600/70">Full Access</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('sales@example.com', 'Sales@123')}
              className="flex flex-col items-center p-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 transition-all text-center"
            >
              <TrendingUp className="w-4 h-4 text-amber-600 mb-1" />
              <span className="text-xs font-bold">Sales Person</span>
              <span className="text-[10px] text-amber-600/70">Own Products</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user@example.com', 'User@123')}
              className="flex flex-col items-center p-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 transition-all text-center"
            >
              <User className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-xs font-bold">Customer</span>
              <span className="text-[10px] text-emerald-600/70">Cart & Orders</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-slate-400">Default: RoleName@123</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-sm shadow-md hover:shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

