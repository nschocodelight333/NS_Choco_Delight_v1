import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/products';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=200&q=60';
const CATEGORIES = ['Normal Shape or Heart', 'Bites'];
const SHAPE_OPTIONS = ['Normal', 'Heart'];

// ─── Image Preview Component ────────────────────────────────────────────────
const ImagePreviewGrid = ({ existingImages, newFiles, onRemoveExisting, onRemoveNew }) => {
  if (!existingImages?.length && !newFiles?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {existingImages?.map((url, i) => (
        <div key={`existing-${i}`} className="relative group">
          <img src={getImageUrl(url)} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-choco-200" />
          <button
            type="button"
            onClick={() => onRemoveExisting(url)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            title="Remove image"
          >✕</button>
        </div>
      ))}
      {newFiles?.map((file, i) => (
        <div key={`new-${i}`} className="relative group">
          <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-choco-400" />
          <span className="absolute -bottom-1 left-0 right-0 text-center text-[9px] bg-choco-800 text-cream rounded-b-lg px-1">NEW</span>
          <button
            type="button"
            onClick={() => onRemoveNew(i)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            title="Remove"
          >✕</button>
        </div>
      ))}
    </div>
  );
};

// ─── Product Modal ──────────────────────────────────────────────────────────
const ProductModal = ({ product, onClose, onSaved }) => {
  const isEdit = !!product;
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'Normal Shape or Heart',
    shapeOptions: product?.shapeOptions || [],
    price: product?.price || '',
    stock: product?.stock || '',
    isFeatured: product?.isFeatured || false,
    isAvailable: product?.isAvailable !== false, // default true
  });

  const [newImages, setNewImages] = useState([]); // File objects to upload
  const [existingImages, setExistingImages] = useState(product?.images || []); // Already on Cloudinary
  const [removeImages, setRemoveImages] = useState([]); // URLs to delete from Cloudinary
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleShapeChange = (shape) => {
    setForm((p) => ({
      ...p,
      shapeOptions: p.shapeOptions.includes(shape)
        ? p.shapeOptions.filter((s) => s !== shape)
        : [...p.shapeOptions, shape],
    }));
  };

  const handleFileInput = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) toast.error('Only images ≤ 5MB allowed');
    setNewImages((prev) => [...prev, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileInput(e.dataTransfer.files);
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setRemoveImages((prev) => [...prev, url]);
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Enter a valid price';
    if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'Enter valid stock';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'shapeOptions') fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });
    newImages.forEach((img) => fd.append('images', img));
    if (removeImages.length > 0) fd.append('removeImages', JSON.stringify(removeImages));

    try {
      if (isEdit) {
        const res = await updateProduct(product._id, fd);
        toast.success('Product updated! 🍫');
        onSaved(res.data.product);
      } else {
        const res = await createProduct(fd);
        toast.success('Product added! 🍫');
        onSaved(res.data.product);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const totalImages = existingImages.length + newImages.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-choco-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-3xl border-b border-choco-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-choco-900">
              {isEdit ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <p className="text-xs text-choco-400 mt-0.5">Fill all required fields marked with *</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-choco-400 hover:text-choco-900 hover:bg-choco-50 rounded-xl transition-colors"
            id="close-product-modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} id={isEdit ? 'edit-product-form' : 'add-product-form'}>
          <div className="p-6 space-y-5">

            {/* ── Name ── */}
            <div>
              <label className="label" htmlFor="prod-name">Product Name *</label>
              <input
                id="prod-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Pistachio Kunafa Chocolate"
                className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-200' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* ── Description ── */}
            <div>
              <label className="label" htmlFor="prod-description">
                Description * <span className="text-choco-400 font-normal">(appetizing details, flavour, occasion)</span>
              </label>
              <textarea
                id="prod-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="e.g. A luxurious chocolate filled with crunchy pistachio kunafa, perfect for gifting on special occasions..."
                className={`input-field resize-none ${errors.description ? 'border-red-400 focus:ring-red-200' : ''}`}
              />
              <div className="flex justify-between mt-1">
                {errors.description
                  ? <p className="text-red-500 text-xs">{errors.description}</p>
                  : <span />}
                <span className="text-xs text-choco-400">{form.description.length} chars</span>
              </div>
            </div>

            {/* ── Category + Shape ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="prod-category">Category *</label>
                <select
                  id="prod-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Shape Options</label>
                <div className="flex gap-4 pt-2.5">
                  {SHAPE_OPTIONS.map((shape) => (
                    <label key={shape} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.shapeOptions.includes(shape)}
                        onChange={() => handleShapeChange(shape)}
                        className="accent-choco-800 w-4 h-4 rounded"
                        id={`shape-option-${shape.toLowerCase()}`}
                      />
                      <span className="text-sm text-choco-700">{shape === 'Heart' ? '♥' : '◯'} {shape}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Price + Stock ── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="prod-price">Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-500 font-medium">₹</span>
                  <input
                    id="prod-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className={`input-field pl-7 ${errors.price ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="label" htmlFor="prod-stock">Stock Quantity *</label>
                <input
                  id="prod-stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="50"
                  className={`input-field ${errors.stock ? 'border-red-400' : ''}`}
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
              </div>
            </div>

            {/* ── Images ── */}
            <div>
              <label className="label">
                Product Images
                <span className="text-choco-400 font-normal ml-1">({totalImages}/5 uploaded · max 5MB each)</span>
              </label>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`mt-1 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-choco-600 bg-choco-50'
                    : 'border-choco-200 hover:border-choco-400 hover:bg-choco-50/50'
                }`}
                id="image-dropzone"
              >
                <span className="text-3xl block mb-2">🖼️</span>
                <p className="text-sm text-choco-600 font-medium">
                  {dragging ? 'Drop to upload!' : 'Drag & drop images here, or click to browse'}
                </p>
                <p className="text-xs text-choco-400 mt-1">JPG, PNG, WEBP · Max 5MB each</p>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="prod-images"
                  onChange={(e) => handleFileInput(e.target.files)}
                  disabled={totalImages >= 5}
                />
              </div>

              <ImagePreviewGrid
                existingImages={existingImages}
                newFiles={newImages}
                onRemoveExisting={removeExistingImage}
                onRemoveNew={removeNewImage}
              />
            </div>

            {/* ── Toggles ── */}
            <div className="flex flex-col sm:flex-row gap-4 bg-choco-50 rounded-2xl p-4">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    id="prod-featured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-choco-200 rounded-full peer-checked:bg-choco-800 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-choco-900">⭐ Featured</p>
                  <p className="text-xs text-choco-400">Show on homepage</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    id="prod-available"
                    checked={form.isAvailable}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-choco-200 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-choco-900">✅ Available</p>
                  <p className="text-xs text-choco-400">Visible to customers</p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="sticky bottom-0 bg-white border-t border-choco-100 px-6 py-4 rounded-b-3xl flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              id="save-product-btn"
              className="btn-primary flex-1 py-3"
            >
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  {isEdit ? 'Updating...' : 'Adding...'}
                </span>
              ) : (
                isEdit ? '✅ Update Product' : '➕ Add Product'
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-6 py-3">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main AdminProducts Page ─────────────────────────────────────────────────
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(null); // null=closed, false=add new, obj=edit
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 100 });
      setProducts(res.data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts((p) => p.filter((prod) => prod._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (savedProduct) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p._id === savedProduct._id);
      if (exists) return prev.map((p) => (p._id === savedProduct._id ? savedProduct : p));
      return [savedProduct, ...prev];
    });
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const stats = {
    total: products.length,
    available: products.filter((p) => p.isAvailable !== false).length,
    featured: products.filter((p) => p.isFeatured).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-choco-900">🍫 Products</h1>
          <p className="text-choco-500 mt-1 text-sm">{products.length} products in catalogue</p>
        </div>
        <button
          onClick={() => setModalProduct(false)}
          id="add-product-btn"
          className="btn-primary"
        >
          ➕ Add New Product
        </button>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-choco-100 text-choco-800' },
          { label: 'Available', value: stats.available, color: 'bg-emerald-100 text-emerald-800' },
          { label: 'Featured', value: stats.featured, color: 'bg-amber-100 text-amber-800' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'bg-red-100 text-red-800' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl px-4 py-3 ${s.color} text-center`}>
            <p className="text-2xl font-bold font-display">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters + View Toggle ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pr-10"
            id="admin-product-search"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-choco-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field max-w-[200px]"
          id="admin-category-filter"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {/* View toggle */}
        <div className="flex bg-choco-100 rounded-xl p-1 gap-1 ml-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'table' ? 'bg-white text-choco-900 shadow-sm font-medium' : 'text-choco-500 hover:text-choco-900'}`}
            id="view-table-btn"
          >☰ Table</button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${viewMode === 'grid' ? 'bg-white text-choco-900 shadow-sm font-medium' : 'text-choco-500 hover:text-choco-900'}`}
            id="view-grid-btn"
          >⊞ Grid</button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-choco-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🍫</span>
          <h3 className="font-display text-xl font-bold text-choco-900 mb-2">No products found</h3>
          <p className="text-choco-500 mb-6">Try adjusting your search or add a new product.</p>
          <button onClick={() => setModalProduct(false)} className="btn-primary">➕ Add Product</button>
        </div>
      ) : viewMode === 'table' ? (
        /* ── Table View ── */
        <div className="bg-white rounded-2xl shadow-sm border border-choco-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-choco-100 bg-choco-50">
                  <th className="text-left px-5 py-3 text-choco-700 font-semibold">Product</th>
                  <th className="text-left px-5 py-3 text-choco-700 font-semibold hidden sm:table-cell">Category</th>
                  <th className="text-right px-5 py-3 text-choco-700 font-semibold">Price</th>
                  <th className="text-center px-5 py-3 text-choco-700 font-semibold hidden md:table-cell">Stock</th>
                  <th className="text-center px-5 py-3 text-choco-700 font-semibold hidden lg:table-cell">Status</th>
                  <th className="text-right px-5 py-3 text-choco-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-choco-50 last:border-0 hover:bg-choco-50/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-choco-50 flex-shrink-0 border border-choco-100">
                          <img
                            src={getImageUrl(product.images?.[0]) || PLACEHOLDER}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = PLACEHOLDER; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-choco-900 line-clamp-1">{product.name}</p>
                          <p className="text-choco-400 text-xs line-clamp-1 mt-0.5">{product.description}</p>
                          <div className="flex gap-1 mt-1">
                            {product.isFeatured && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">⭐ Featured</span>}
                            {product.shapeOptions?.length > 0 && product.shapeOptions.map((s) => (
                              <span key={s} className="text-[10px] bg-choco-100 text-choco-600 px-1.5 py-0.5 rounded-full">{s === 'Heart' ? '♥' : '◯'} {s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-choco-600 hidden sm:table-cell text-xs">{product.category}</td>
                    <td className="px-5 py-3 text-right font-bold text-choco-900">₹{product.price}</td>
                    <td className="px-5 py-3 text-center hidden md:table-cell">
                      <span className={`badge text-xs ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-700'
                          : product.stock <= 5
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.stock === 0 ? 'Out' : product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center hidden lg:table-cell">
                      <span className={`badge text-xs ${product.isAvailable !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.isAvailable !== false ? '✓ Live' : '✗ Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModalProduct(product)}
                          id={`edit-product-${product._id}`}
                          className="p-2 text-choco-600 hover:text-choco-900 hover:bg-choco-100 rounded-lg transition-colors"
                          title="Edit product"
                        >✏️</button>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          id={`delete-product-${product._id}`}
                          disabled={deleting === product._id}
                          className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete product"
                        >
                          {deleting === product._id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-choco-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square bg-choco-50">
                <img
                  src={getImageUrl(product.images?.[0]) || PLACEHOLDER}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isFeatured && (
                    <span className="text-[10px] bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
                  )}
                  {product.isAvailable === false && (
                    <span className="text-[10px] bg-gray-700 text-white px-2 py-0.5 rounded-full">Hidden</span>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {product.stock === 0 ? 'Out' : `${product.stock} left`}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-choco-900 text-sm line-clamp-1">{product.name}</p>
                <p className="text-choco-400 text-xs line-clamp-2 mt-1">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-choco-900 font-display">₹{product.price}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setModalProduct(product)}
                      className="p-1.5 bg-choco-100 text-choco-700 hover:bg-choco-800 hover:text-cream rounded-lg transition-colors text-xs"
                      title="Edit"
                    >✏️</button>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      disabled={deleting === product._id}
                      className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-xs"
                      title="Delete"
                    >🗑️</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Product Modal ── */}
      <AnimatePresence>
        {modalProduct !== null && (
          <ProductModal
            product={modalProduct || undefined}
            onClose={() => setModalProduct(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
