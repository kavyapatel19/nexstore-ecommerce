import React from 'react';
import { Heart, ShoppingBag, Star, Edit3, Trash2, Check, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({
  product,
  onViewDetails,
  onEditProduct,
  onDeleteProduct,
}) {
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isLiked = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  // Check if current user owns this product or is admin
  const isOwnerOrAdmin =
    isAdmin || (user && product.seller && (product.seller._id === user.id || product.seller === user.id));

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const res = await addToCart(product._id, 1);
    if (res?.requireAuth) {
      alert(res.message);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    const res = await toggleWishlist(product._id);
    if (res?.requireAuth) {
      alert(res.message);
    }
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
          {product.category}
        </span>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-transform active:scale-90 shadow-sm ${
            isLiked
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-500'
          }`}
          title={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Alert Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow">
              Out of Stock
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <span className="absolute bottom-3 left-3 bg-amber-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            Only {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
        <div>
          {/* Seller Attribution */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 truncate">
              <User className="w-3 h-3 text-slate-400" />
              {product.seller?.name || 'Authorized Seller'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.ratings?.average || 4.8}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-sky-600 transition-colors">
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Price</span>
            <span className="text-lg font-extrabold text-slate-900">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Edit/Delete if Owner or Admin */}
            {isOwnerOrAdmin && (
              <div className="flex items-center gap-1 mr-1">
                {onEditProduct && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product);
                    }}
                    className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Edit Product"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {onDeleteProduct && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProduct(product._id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-sky-600 text-white shadow-md hover:shadow-sky-500/25 active:scale-95'
              }`}
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

