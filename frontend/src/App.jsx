import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ManageProductModal from './components/ManageProductModal';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import UserOrders from './pages/UserOrders';
import SalesDashboard from './pages/SalesDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setManageModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setProductToEdit(product);
    setManageModalOpen(true);
  };

  const handleSuccessSave = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
              <Navbar onOpenAddProduct={handleOpenAddProduct} />

              <main className="flex-grow">
                <Routes>
                  {/* Public Storefront */}
                  <Route
                    path="/"
                    element={
                      <Home
                        key={refreshTrigger}
                        onOpenAddProduct={handleOpenAddProduct}
                        onOpenEditProduct={handleOpenEditProduct}
                      />
                    }
                  />

                  {/* Authentication */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Cart & Wishlist */}
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />

                  {/* Customer Protected Checkout & Order History */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute allowedRoles={['user', 'sales', 'admin']}>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute allowedRoles={['user', 'sales', 'admin']}>
                        <UserOrders />
                      </ProtectedRoute>
                    }
                  />

                  {/* Sales Person Portal */}
                  <Route
                    path="/sales"
                    element={
                      <ProtectedRoute allowedRoles={['sales', 'admin']}>
                        <SalesDashboard
                          key={refreshTrigger}
                          onOpenAddProduct={handleOpenAddProduct}
                          onOpenEditProduct={handleOpenEditProduct}
                        />
                      </ProtectedRoute>
                    }
                  />

                  {/* Super Admin Dashboard */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard
                          key={refreshTrigger}
                          onOpenAddProduct={handleOpenAddProduct}
                          onOpenEditProduct={handleOpenEditProduct}
                        />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>

              <Footer />

              {/* Shared Add / Edit Product Modal */}
              <ManageProductModal
                isOpen={manageModalOpen}
                onClose={() => setManageModalOpen(false)}
                productToEdit={productToEdit}
                onSuccess={handleSuccessSave}
              />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

