import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ShoppingBag,
  Heart,
  User,
  LogOut,
  ShieldCheck,
  TrendingUp,
  Package,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export default function Navbar({ onOpenAddProduct }) {
  const { user, isAuthenticated, isAdmin, isSales, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </span>
        );
      case 'sales':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <TrendingUp className="w-3.5 h-3.5" />
            Sales
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <User className="w-3.5 h-3.5" />
            Customer
          </span>
        );
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                  NexStore
                </span>
                <span className="text-[10px] -mt-1 font-medium text-slate-500 uppercase tracking-widest">
                  E-Commerce RBAC
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Center Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-sky-600 transition-colors">
              Explore Products
            </Link>

            {/* Role Adaptive Links */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 transition-colors bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200/60"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}

            {isSales && (
              <Link
                to="/sales"
                className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 transition-colors bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60"
              >
                <TrendingUp className="w-4 h-4" />
                Sales Dashboard
              </Link>
            )}

            {/* Task 5 requirement: "Add Product" visible only to Admin and Sales Person */}
            {(isAdmin || isSales) && (
              <button
                onClick={onOpenAddProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors text-sm font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-sm"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                  <span className="font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  {getRoleBadge(user.role)}
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        My Orders
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          Admin Console
                        </Link>
                      )}

                      {isSales && (
                        <Link
                          to="/sales"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          <TrendingUp className="w-4 h-4 text-amber-600" />
                          Sales Portal
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart" className="relative p-2 text-slate-700">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute 0 top-0 right-0 bg-sky-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              {getRoleBadge(user.role)}
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Explore Products
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-600">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>Shopping Cart</span>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-600">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Orders
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-purple-700 bg-purple-50"
              >
                Admin Dashboard
              </Link>
            )}

            {isSales && (
              <Link
                to="/sales"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-amber-800 bg-amber-50"
              >
                Sales Dashboard
              </Link>
            )}

            {(isAdmin || isSales) && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAddProduct();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-sky-700 bg-sky-50"
              >
                + Add New Product
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center px-4 py-2.5 rounded-xl font-semibold text-rose-600 bg-rose-50"
              >
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-xl bg-sky-600 font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

