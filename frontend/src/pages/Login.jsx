import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Lock, Mail, ShieldCheck, TrendingUp, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickLoginRole, setQuickLoginRole] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const executeLogin = async (loginEmail, loginPassword) => {
    setError('');
    const cleanEmail = (loginEmail || email).trim();
    const cleanPassword = (loginPassword || password).trim();

    if (!cleanEmail || !cleanPassword) {
      return setError('Please enter both email and password');
    }

    try {
      setLoading(true);
      const res = await login(cleanEmail, cleanPassword);
      setLoading(false);
      if (res?.success) {
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
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot reach API server. Please ensure the backend is running on http://localhost:5000');
      } else {
        setError('Login failed. Please verify email and password.');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handleQuickLogin = (roleEmail, rolePass, roleName) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setQuickLoginRole(roleName);
    setError('');
    // Auto-execute login in 1-click for seamless evaluation
    executeLogin(roleEmail, rolePass);
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
            Sign In to NexStore
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Select a demo role below for 1-click sign-in or enter credentials manually
          </p>
        </div>

        {/* 1-Click Demo Credentials Card */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1-Click Demo Sign In
            </span>
            <span className="text-[10px] text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded-full">
              Click any role to enter
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@example.com', 'Admin@123', 'admin')}
              disabled={loading}
              className="flex flex-col items-center p-3 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/90 text-purple-900 transition-all text-center group hover:scale-[1.02]"
            >
              <ShieldCheck className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Admin</span>
              <span className="text-[10px] text-purple-600/80">Full Control</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('sales@example.com', 'Sales@123', 'sales')}
              disabled={loading}
              className="flex flex-col items-center p-3 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/90 text-amber-900 transition-all text-center group hover:scale-[1.02]"
            >
              <TrendingUp className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Sales Person</span>
              <span className="text-[10px] text-amber-600/80">Own Products</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user@example.com', 'User@123', 'user')}
              disabled={loading}
              className="flex flex-col items-center p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-900 transition-all text-center group hover:scale-[1.02]"
            >
              <User className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Customer</span>
              <span className="text-[10px] text-emerald-600/80">Cart & Checkout</span>
            </button>
          </div>
        </div>

        {/* Manual Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
              <span className="font-bold">⚠️</span>
              <span>{error}</span>
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
                <span className="text-xs text-slate-400 font-mono">Default: Role@123</span>
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
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-sm shadow-md hover:shadow-sky-500/25 transition-all disabled:opacity-50"
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
