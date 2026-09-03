'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getDashboardStats } from '@/api/admin';
import { getWhatsAppNumber, setWhatsAppNumber } from '@/utils/whatsapp';
import api from '@/api/axios';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | products | whatsapp | orders
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // WhatsApp store number
  const [whatsappNum, setWhatsappNumState] = useState('');

  // Product Form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Normal Shape or Heart',
    price: '',
    stock: '',
    description: '',
    images: '',
    shapeOptions: ['Normal', 'Heart'],
  });
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    setWhatsappNumState(getWhatsAppNumber());
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, ordersRes] = await Promise.allSettled([
        getDashboardStats(),
        api.get('/products'),
        api.get('/admin/orders'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data.products || []);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWhatsAppNumber = (e) => {
    e.preventDefault();
    setWhatsAppNumber(whatsappNum);
    toast.success('Official Store WhatsApp number updated! 📱');
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Normal Shape or Heart',
      price: '',
      stock: '',
      description: '',
      images: '',
      shapeOptions: ['Normal', 'Heart'],
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category || 'Normal Shape or Heart',
      price: prod.price,
      stock: prod.stock,
      description: prod.description || '',
      images: prod.images?.join('\n') || '',
      shapeOptions: prod.shapeOptions || ['Normal', 'Heart'],
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success(`Deleted "${name}"`);
      setProducts((p) => p.filter((item) => item._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        description: productForm.description.trim(),
        images: productForm.images
          ? productForm.images.split('\n').map((url) => url.trim()).filter(Boolean)
          : ['https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80'],
        shapeOptions: productForm.shapeOptions,
      };

      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        toast.success(`Updated "${payload.name}"! 🍫`);
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? res.data.product : p)));
      } else {
        const res = await api.post('/products', payload);
        toast.success(`Added new chocolate "${payload.name}"! 🎉`);
        setProducts((prev) => [res.data.product, ...prev]);
      }
      setShowProductModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      toast.success(`Order status updated to "${newStatus}"! 📦`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-choco-100">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-choco-900 flex items-center gap-2">
            🛠️ Store Operations Dashboard
          </h1>
          <p className="text-choco-500 text-xs sm:text-sm mt-0.5">
            Manage chocolates, mobile notification numbers, customer orders, and telemetry
          </p>
        </div>

        <Link
          href="/"
          className="btn-secondary text-xs sm:text-sm py-2 px-4 flex items-center gap-1.5"
        >
          🌐 Back to Public Store
        </Link>
      </div>

      {/* Admin Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-choco-200 pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50'
          }`}
        >
          📊 Business Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50'
          }`}
        >
          🍫 Manage Chocolates ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'whatsapp'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50'
          }`}
        >
          📱 Store WhatsApp Number
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50'
          }`}
        >
          📦 Orders Telemetry ({orders.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                📦
              </div>
              <div>
                <p className="text-choco-500 text-xs font-medium">Total Orders</p>
                <p className="font-display text-2xl font-bold text-choco-900">{stats?.totalOrders || orders.length || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                💰
              </div>
              <div>
                <p className="text-choco-500 text-xs font-medium">Total Revenue</p>
                <p className="font-display text-2xl font-bold text-choco-900">
                  ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div>
                <p className="text-choco-500 text-xs font-medium">Pending Orders</p>
                <p className="font-display text-2xl font-bold text-choco-900">{stats?.pendingOrders || 0}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <p className="text-choco-500 text-xs font-medium">Customers</p>
                <p className="font-display text-2xl font-bold text-choco-900">{stats?.totalCustomers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-choco-100">
            <h3 className="font-display text-lg font-bold text-choco-900 mb-3">⚡ Quick Store Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => { setActiveTab('products'); handleOpenAddModal(); }}
                className="btn-gold p-4 text-center text-sm font-semibold flex flex-col items-center gap-2"
              >
                <span className="text-2xl">🍫</span> Add New Chocolate Product
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className="btn-secondary p-4 text-center text-sm font-semibold flex flex-col items-center gap-2"
              >
                <span className="text-2xl">📱</span> Configure WhatsApp Mobile Number
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="btn-primary p-4 text-center text-sm font-semibold flex flex-col items-center gap-2"
              >
                <span className="text-2xl">📦</span> Review Customer Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE CHOCOLATES */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-choco-100 shadow-sm">
            <div>
              <h2 className="font-display text-xl font-bold text-choco-900">Chocolate Catalog ({products.length})</h2>
              <p className="text-choco-500 text-xs">Add, edit prices, stock, or remove chocolates</p>
            </div>
            <button onClick={handleOpenAddModal} className="btn-gold py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              ✨ Add New Chocolate
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-choco-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-choco-50 text-choco-700 text-xs font-semibold uppercase tracking-wider border-b border-choco-100">
                  <th className="p-3.5">Chocolate</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-choco-100 text-sm">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-choco-50/50 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=100&q=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-choco-200"
                      />
                      <div>
                        <p className="font-semibold text-choco-900 text-sm leading-tight">{p.name}</p>
                        <p className="text-[11px] text-choco-400 truncate max-w-xs">{p.description}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="badge bg-choco-100 text-choco-800 text-xs">
                        {p.category === 'Bites' ? '🍬 Bites' : '🍫 Bar'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-choco-900 font-display">₹{p.price}</td>
                    <td className="p-3.5">
                      <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${p.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="p-3.5">
                      {p.isAvailable ? (
                        <span className="text-xs text-emerald-600 font-medium">✓ Active</span>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">Hidden</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="px-3 py-1.5 rounded-xl bg-choco-100 hover:bg-choco-200 text-choco-800 text-xs font-semibold transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id, p.name)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STORE WHATSAPP NUMBER MANAGER */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-choco-100 space-y-6 max-w-2xl">
          <div>
            <h2 className="font-display text-xl font-bold text-choco-900 flex items-center gap-2">
              📱 WhatsApp Store Contact Settings
            </h2>
            <p className="text-choco-500 text-sm mt-1">
              Configure the mobile phone number where customer WhatsApp inquiries, chocolate order requests, and custom quotes are delivered.
            </p>
          </div>

          <form onSubmit={handleSaveWhatsAppNumber} className="space-y-4">
            <div>
              <label className="label" htmlFor="whatsapp-number-input">
                Store WhatsApp Mobile Number (with Country Code)
              </label>
              <input
                id="whatsapp-number-input"
                type="text"
                value={whatsappNum}
                onChange={(e) => setWhatsappNumState(e.target.value)}
                placeholder="e.g. 918185920511"
                className="input-field text-base font-mono"
                required
              />
              <p className="text-xs text-choco-400 mt-1">
                Enter number in international format without '+' or spaces. Example: <code>918185920511</code> for India.
              </p>
            </div>

            <button type="submit" className="btn-gold py-3.5 px-6 text-sm font-bold shadow-gold">
              💾 Save Official WhatsApp Number
            </button>
          </form>

          <div className="p-4 bg-choco-50 rounded-2xl border border-choco-200/60">
            <h4 className="font-semibold text-choco-900 text-sm mb-1">🧪 Test WhatsApp Redirect:</h4>
            <p className="text-xs text-choco-600 mb-3">
              Click below to test the exact message format customers see when connecting on WhatsApp:
            </p>
            <a
              href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('Hello NS Choco Delight! 🍫\nI am testing store contact notifications.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2 text-xs py-2 px-4"
            >
              💬 Launch Test WhatsApp Message
            </a>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS TELEMETRY */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-choco-100 shadow-sm">
            <h2 className="font-display text-xl font-bold text-choco-900">Customer Orders ({orders.length})</h2>
            <p className="text-choco-500 text-xs">Track order status and update customer order states</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-choco-100">
              <span className="text-4xl block mb-2">📦</span>
              <p className="text-choco-600 font-medium">No customer orders recorded yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-choco-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-choco-50 text-choco-700 text-xs font-semibold uppercase tracking-wider border-b border-choco-100">
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-choco-100 text-sm">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-choco-50/50">
                      <td className="p-3.5 font-mono text-xs font-semibold text-choco-700">#{o._id.slice(-6)}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-choco-900">{o.shippingAddress?.fullName || o.user?.name || 'Customer'}</p>
                        <p className="text-[11px] text-choco-400">{o.shippingAddress?.phone || o.user?.phone || 'No Phone'}</p>
                      </td>
                      <td className="p-3.5 text-xs text-choco-700">
                        {o.items?.map((it) => `${it.product?.name || 'Chocolate'} (x${it.quantity})`).join(', ')}
                      </td>
                      <td className="p-3.5 font-bold font-display text-choco-900">₹{o.totalAmount}</td>
                      <td className="p-3.5">
                        <span className="text-xs font-medium uppercase px-2 py-0.5 rounded-md bg-choco-100 text-choco-800">
                          {o.paymentMethod || 'COD'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={o.status}
                          onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                          className="text-xs font-semibold p-1.5 rounded-xl border border-choco-200 bg-white text-choco-900 focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-choco-100 pb-3">
                <h3 className="font-display text-xl font-bold text-choco-900">
                  {editingProduct ? '✏️ Edit Chocolate Specifications' : '✨ Add New Chocolate Product'}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-choco-400 hover:text-choco-700 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
                <div>
                  <label className="label">Chocolate Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                      className="input-field"
                    >
                      <option value="Normal Shape or Heart">Normal Shape or Heart</option>
                      <option value="Bites">Bites</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Price (₹) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                      className="input-field"
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Stock Level *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
                    className="input-field"
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                    className="input-field min-h-[80px]"
                    required
                  />
                </div>

                <div>
                  <label className="label">Image URL (One per line)</label>
                  <textarea
                    value={productForm.images}
                    onChange={(e) => setProductForm((p) => ({ ...p, images: e.target.value }))}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="input-field font-mono text-xs min-h-[70px]"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-choco-100">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="btn-secondary w-full py-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="btn-gold w-full py-3 font-bold"
                  >
                    {savingProduct ? 'Saving...' : '💾 Save Chocolate'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
