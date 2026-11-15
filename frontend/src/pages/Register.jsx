import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Lock, Mail, User, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      return setError('Please fill in all required fields');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    try {
      setLoading(true);
      const res = await register(name, email, password, role);
      setLoading(false);
      if (res?.success) {
        if (role === 'sales') {
          navigate('/sales');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Try a different email.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 items-center justify-center text-white shadow-lg shadow-sky-500/25">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Join NexStore as a Customer or Seller with granular RBAC
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Registering As:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex flex-col items-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    role === 'user'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                    className="hidden"
                  />
                  <User className="w-5 h-5 mb-1 text-emerald-600" />
                  <span className="text-xs font-bold">Customer</span>
                  <span className="text-[10px] text-slate-400 text-center">Shop & Order</span>
                </label>

                <label
                  className={`flex flex-col items-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    role === 'sales'
                      ? 'border-amber-500 bg-amber-50/50 text-amber-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="sales"
                    checked={role === 'sales'}
                    onChange={() => setRole('sales')}
                    className="hidden"
                  />
                  <TrendingUp className="w-5 h-5 mb-1 text-amber-600" />
                  <span className="text-xs font-bold">Sales Person</span>
                  <span className="text-[10px] text-slate-400 text-center">Sell Products</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-sm shadow-md hover:shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Complete Registration'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

