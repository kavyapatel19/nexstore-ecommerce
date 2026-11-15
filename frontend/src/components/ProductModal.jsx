import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductModal({ product, onClose, onEditProduct }) {
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || '');
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!product) return null;

  const isLiked = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const isOwnerOrAdmin =
    isAdmin || (user && product.seller && (product.seller._id === user.id || product.seller === user.id));

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    const res = await addToCart(product._id, quantity);
    setIsAdding(false);
    if (res?.requireAuth) {
      alert(res.message);
    } else if (res?.success) {
      setFeedback('Added to cart!');
      setTimeout(() => setFeedback(''), 2500);
    } else {
      setFeedback(res?.message || 'Failed to add');
      setTimeout(() => setFeedback(''), 2500);
    }
  };

  const handleToggleWishlist = async () => {
    const res = await toggleWishlist(product._id);
    if (res?.requireAuth) {
      alert(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Gallery */}
          <div className="bg-slate-50 p-6 flex flex-col justify-between">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm flex items-center justify-center">
              <img
                src={selectedImage || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails if multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === img ? 'border-sky-600 scale-105' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Ratings */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.ratings?.average || 4.8}</span>
                  <span className="text-slate-400 font-normal">({product.ratings?.count || 14} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h2>

              {/* Seller Tag */}
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Listed by: <strong className="text-slate-700">{product.seller?.name || 'NexStore Verified Partner'}</strong></span>
                {product.seller?.role && (
                  <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                    {product.seller.role}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-slate-600 leading-relaxed max-h-36 overflow-y-auto pr-1">
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="mt-4">
                {isOutOfStock ? (
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    ✓ In Stock ({product.stock} units available)
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {/* Quantity Selector & Add to Cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-slate-800 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold shadow-lg shadow-slate-900/10 hover:shadow-sky-500/25 transition-all disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isAdding ? 'Adding...' : feedback ? feedback : 'Add to Cart'}
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-xl border transition-all ${
                    isLiked
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title={isLiked ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-500 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>100% Genuine</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>7-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

