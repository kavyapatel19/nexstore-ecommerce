import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Books',
  'Beauty',
  'Sports',
  'Gaming',
];

export default function Home({ onOpenAddProduct, onOpenEditProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('[Home] Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategory, sort, minPrice, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-900 via-slate-900 to-slate-900 text-white py-16 sm:py-20">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-sky-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role-Based Multi-Vendor Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Curated Products. <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Strict RBAC.</span> Verified Checkout.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience role-based access control where Admins, Sales Persons, and Customers have
            strictly validated server-side permissions, Cloudinary-powered media uploads, and Razorpay test checkout.
          </p>

          {/* Search Bar in Hero */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search across all products, brands, or keywords..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 text-slate-900 placeholder-slate-400 text-sm font-medium shadow-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/30 transition-all"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container with generous top spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Filter Bar Card with spacious padding */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/80 mb-10 space-y-6">
          {/* Category Section with clean label */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Filter by Category
              </span>
              <span className="text-xs text-slate-400">
                Active: <strong className="text-slate-700">{selectedCategory}</strong>
              </span>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Controls: Price Filter & Sorting */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-sm">
            {/* Price Inputs */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Price:
              </span>
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-28 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-28 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              {(minPrice || maxPrice) && (
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="text-xs text-rose-500 hover:underline font-semibold ml-1"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Sort & Count */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-500">
                Found <strong className="text-slate-800">{totalCount}</strong> items
              </span>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-square bg-slate-100 rounded-xl"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="h-8 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Try adjusting your search terms, changing the category, or clearing the price filters.
            </p>
            <button
              onClick={() => {
                setKeyword('');
                setSelectedCategory('All');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-sky-600 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onViewDetails={(p) => setSelectedProduct(p)}
                onEditProduct={onOpenEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEditProduct={onOpenEditProduct}
        />
      )}
    </div>
  );
}
