import React from 'react';
import { ShoppingBag, ShieldCheck, CreditCard, Cloud, Server, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">NexStore</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              A comprehensive role-based e-commerce platform demonstrating secure JWT authentication,
              granular backend RBAC, Cloudinary asset pipelines, Razorpay test payments, and real-time dashboards.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-sky-400 border border-slate-700">
                <Cloud className="w-3.5 h-3.5" /> Cloudinary Media
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-indigo-400 border border-slate-700">
                <CreditCard className="w-3.5 h-3.5" /> Razorpay Test Gateway
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-emerald-400 border border-slate-700">
                <Server className="w-3.5 h-3.5" /> Render & Vercel
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Platform Roles</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Admin: Full Control & Analytics
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Sales: Manage Own Products
              </li>
              <li className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Customer: Cart & Verified Checkout
              </li>
            </ul>
          </div>

          {/* Test Credentials Callout */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Demo Credentials
            </h4>
            <div className="text-xs space-y-1 font-mono text-slate-300">
              <p><span className="text-purple-400 font-semibold">Admin:</span> admin@example.com</p>
              <p><span className="text-amber-400 font-semibold">Sales:</span> sales@example.com</p>
              <p><span className="text-emerald-400 font-semibold">User:</span> user@example.com</p>
              <p className="text-slate-500 font-sans text-[11px] pt-1">Password for all: <code className="text-sky-300">RoleName@123</code></p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} NexStore Role-Based E-Commerce. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Engineered with React + Node.js + Express + MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}

