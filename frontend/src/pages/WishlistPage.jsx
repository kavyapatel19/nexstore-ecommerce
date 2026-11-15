import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
          <Heart className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Your Wishlist</h2>
          <p className="text-sm text-slate-500">
            Sign in to access your curated wishlist across all devices.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-sm transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const handleMoveToCart = async (product) => {
    await addToCart(product._id, 1);
    await removeFromWishlist(product._id);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>My Wishlist</span>
            <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60">
              {wishlistItems.length} items
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Saved favorites ready to move into your cart whenever you are ready
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Your wishlist is empty</h3>
            <p className="text-sm text-slate-500">
              Click the heart icon on any product to save it here for later.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-sm font-semibold transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => {
              if (!product) return null;
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-square w-full bg-slate-100">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="absolute top-3 left-3 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-extrabold text-base text-slate-900">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>

                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={isOutOfStock}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-sky-600 text-white shadow-sm'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

