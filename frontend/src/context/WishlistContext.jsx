import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist({ products: [] });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.error('[WishlistContext] Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    if (!wishlist || !wishlist.products) return false;
    return wishlist.products.some((p) => (p._id || p) === productId);
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true, message: 'Please login to save to wishlist' };
    }
    try {
      const res = await api.post('/wishlist/toggle', { productId });
      if (res.data.success) {
        setWishlist(res.data.wishlist);
        return {
          success: true,
          added: res.data.added,
          message: res.data.added ? 'Added to wishlist ❤️' : 'Removed from wishlist',
        };
      }
    } catch (err) {
      console.error('[WishlistContext] Toggle failed:', err);
      return { success: false, message: 'Failed to update wishlist' };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.error('[WishlistContext] Remove failed:', err);
    }
  };

  const wishlistItems = wishlist?.products || [];
  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistItems,
        wishlistCount,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

