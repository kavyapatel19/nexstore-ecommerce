import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('[CartContext] Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true, message: 'Please login to add items to cart' };
    }
    try {
      const res = await api.post('/cart', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: 'Item added to cart!' };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add item to cart';
      return { success: false, message: errorMsg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('[CartContext] Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('[CartContext] Failed to remove item:', err);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.delete('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('[CartContext] Failed to clear cart:', err);
    }
  };

  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || item.price || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartCount,
        cartSubtotal,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

