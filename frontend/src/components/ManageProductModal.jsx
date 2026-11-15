import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../api/client';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Books',
  'Beauty',
  'Sports',
  'Gaming',
  'Other',
];

export default function ManageProductModal({ isOpen, onClose, productToEdit, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stock, setStock] = useState('10');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!productToEdit;

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price || '');
      setCategory(productToEdit.category || CATEGORIES[0]);
      setStock(productToEdit.stock?.toString() || '10');
      setImageUrl(productToEdit.images?.[0] || '');
      setPreviewUrl(productToEdit.images?.[0] || '');
      setImageFile(null);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategory(CATEGORIES[0]);
      setStock('10');
      setImageUrl('');
      setPreviewUrl('');
      setImageFile(null);
    }
    setError('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Product name is required');
    if (!description.trim()) return setError('Product description is required');
    if (!price || Number(price) <= 0) return setError('Valid price is required');
    if (!stock || Number(stock) < 0) return setError('Valid stock number is required');
    if (!isEditMode && !imageFile && !imageUrl) {
      return setError('Please upload an image or provide an image URL');
    }

    try {
      setLoading(true);

      // If file is selected, use FormData to upload directly to Cloudinary via backend
      if (imageFile) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('stock', stock);
        formData.append('image', imageFile);

        if (isEditMode) {
          await api.put(`/products/${productToEdit._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        // Direct JSON submission with image URL
        const payload = {
          name,
          description,
          price: Number(price),
          category,
          stock: Number(stock),
          imageUrl: imageUrl || previewUrl,
        };

        if (isEditMode) {
          await api.put(`/products/${productToEdit._id}`, payload);
        } else {
          await api.post('/products', payload);
        }
      }

      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'Failed to save product');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-slate-500">
              Cloudinary image upload & role-based ownership validation enabled
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2999"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe key features, specs, and benefits..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              required
            ></textarea>
          </div>

          {/* Cloudinary Image Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Product Image (Cloudinary Upload) *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Upload to Cloudinary */}
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-sky-50/50 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Choose image file</span>
                <span className="text-[10px] text-slate-400">Uploads directly to Cloudinary</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Or Direct Image URL */}
              <div className="flex flex-col justify-center space-y-1">
                <span className="text-xs font-medium text-slate-500">Or paste image URL:</span>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                      setImageFile(null);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-xl mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-14 h-14 rounded-lg object-cover border border-slate-300"
                />
                <span className="text-xs text-slate-600 truncate">
                  {imageFile ? `Selected file: ${imageFile.name}` : previewUrl}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Uploading & Saving...' : isEditMode ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

