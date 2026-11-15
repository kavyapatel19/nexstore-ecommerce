import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-600">Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">403 Forbidden: Access Denied</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your current role (<strong className="text-slate-800 capitalize">{user.role}</strong>) does not have
            sufficient permissions to access this dashboard.
          </p>
          <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-mono">
            Required Role(s): [{allowedRoles.join(', ')}]
          </div>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-sky-600 transition-colors"
          >
            Return to Storefront
          </a>
        </div>
      </div>
    );
  }

  return children;
}

