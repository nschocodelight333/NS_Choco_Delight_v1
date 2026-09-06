'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getDashboardStats } from '@/api/admin';
import { getWhatsAppNumber, setWhatsAppNumber, fetchStoreWhatsAppNumber } from '@/utils/whatsapp';
import api from '@/api/axios';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        toast.error('Admin authentication required.');
        router.replace('/admin/login');
        return;
      }
      // Load stored whatsapp number
      setWhatsappNumState(getWhatsAppNumber());
      fetchStoreWhatsAppNumber().then((num) => {
        if (num) setWhatsappNumState(num);
      });
      fetchData();
    }
  }, [user, authLoading, router]);

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

  const handleSaveWhatsAppNumber = async (e) => {
    e.preventDefault();
    const cleaned = setWhatsAppNumber(whatsappNum);
    setWhatsappNumState(cleaned);
    try {
      await api.put('/settings', { whatsappNumber: whatsappNum });
      toast.success('Official Store WhatsApp number updated globally! 📱');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Saved locally, but failed to sync to server.');
    }
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

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-choco-800 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-choco-800 font-semibold">Verifying Admin Permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-choco-100">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-choco-900 flex items-center gap-2">
            👑 Admin Dashboard
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

      {/* Admin Tabs - Vertical on mobile, responsive grid, no horizontal scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 border-b border-choco-200 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50 border border-choco-100'
          }`}
        >
          <span>📊</span> Business Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'products'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50 border border-choco-100'
          }`}
        >
          <span>🍫</span> Manage Chocolates ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'whatsapp'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50 border border-choco-100'
          }`}
        >
          <span>📱</span> Store WhatsApp Number
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50 border border-choco-100'
          }`}
        >
          <span>📦</span> Orders Telemetry ({orders.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW - Clean Vertical Layout */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Vertical Stacked Overview Items */}
          <div className="flex flex-col space-y-3.5">
            <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0">
                  📦
                </div>
                <div>
                  <p className="text-choco-500 text-xs font-medium">Total Orders</p>
                  <p className="font-display text-2xl font-bold text-choco-900">{stats?.totalOrders || orders.length || 0}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 hidden sm:inline-block">
                All-time Orders
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
                  💰
                </div>
                <div>
                  <p className="text-choco-500 text-xs font-medium">Total Revenue</p>
                  <p className="font-display text-2xl font-bold text-choco-900">
                    ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hidden sm:inline-block">
                Gross Earnings
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl flex-shrink-0">
                  ⏳
                </div>
                <div>
                  <p className="text-choco-500 text-xs font-medium">Pending Orders</p>
                  <p className="font-display text-2xl font-bold text-choco-900">{stats?.pendingOrders || 0}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 hidden sm:inline-block">
                Needs Attention
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                  👥
                </div>
                <div>
                  <p className="text-choco-500 text-xs font-medium">Customers</p>
                  <p className="font-display text-2xl font-bold text-choco-900">{stats?.totalCustomers || 0}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 hidden sm:inline-block">
                Registered Users
              </span>
            </div>
          </div>

          {/* Quick Store Actions - Vertical Stack */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-choco-100">
            <h3 className="font-display text-lg font-bold text-choco-900 mb-3">⚡ Quick Store Actions</h3>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => { setActiveTab('products'); handleOpenAddModal(); }}
                className="btn-gold p-4 text-left text-sm font-semibold flex items-center gap-3.5 w-full justify-start rounded-2xl"
              >
                <span className="text-2xl">🍫</span>
                <div>
                  <p className="font-bold">Add New Chocolate Product</p>
                  <p className="text-xs font-normal opacity-90">Create a new item, set pricing, shape options, and inventory stock</p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className="btn-secondary p-4 text-left text-sm font-semibold flex items-center gap-3.5 w-full justify-start rounded-2xl border border-choco-200"
              >
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-bold">Configure WhatsApp Mobile Number</p>
                  <p className="text-xs font-normal text-choco-600">Update destination mobile number for customer inquiries and orders</p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="btn-primary p-4 text-left text-sm font-semibold flex items-center gap-3.5 w-full justify-start rounded-2xl"
              >
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-bold">Review Customer Orders</p>
                  <p className="text-xs font-normal text-choco-200">Track order statuses, customer addresses, and order delivery</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE CHOCOLATES - Vertical Layout */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-choco-100 shadow-sm">
            <div>
              <h2 className="font-display text-xl font-bold text-choco-900">Chocolate Catalog ({products.length})</h2>
              <p className="text-choco-500 text-xs">Add, edit prices, stock, or remove chocolates</p>
            </div>
            <button onClick={handleOpenAddModal} className="btn-gold py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center gap-1.5 w-full sm:w-auto justify-center">
              ✨ Add New Chocolate
            </button>
          </div>

          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-choco-100">
                <span className="text-4xl block mb-2">🍫</span>
                <p className="text-choco-600 font-medium">No chocolates in catalog yet.</p>
              </div>
            ) : (
              products.map((p) => (
                <div
                  key={p._id}
                  className="bg-white p-4 rounded-2xl border border-choco-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-choco-200 transition-colors"
                >
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=100&q=80'}
                      alt={p.name}
                      className="w-14 h-14 rounded-xl object-cover border border-choco-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-choco-900 text-sm">{p.name}</h4>
                        <span className="badge bg-choco-100 text-choco-800 text-[11px]">
                          {p.category === 'Bites' ? '🍬 Bites' : '🍫 Bar'}
                        </span>
                        {p.isAvailable ? (
                          <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">✓ Active</span>
                        ) : (
                          <span className="text-[11px] text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">Hidden</span>
                        )}
                      </div>
                      <p className="text-xs text-choco-400 line-clamp-1 mt-0.5">{p.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-bold text-choco-900 font-display text-base">₹{p.price}</span>
                        <span className={`font-semibold text-[11px] px-2 py-0.5 rounded-full ${p.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {p.stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-choco-50">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="px-3.5 py-1.5 rounded-xl bg-choco-100 hover:bg-choco-200 text-choco-800 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p._id, p.name)}
                      className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
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

      {/* TAB 4: ORDERS TELEMETRY - Vertical Order Stack */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-choco-100 shadow-sm">
            <h2 className="font-display text-xl font-bold text-choco-900">Customer Orders ({orders.length})</h2>
            <p className="text-choco-500 text-xs">Track order status and update customer order states</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-choco-100">
              <span className="text-4xl block mb-2">📦</span>
              <p className="text-choco-600 font-medium">No customer orders recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-choco-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:border-choco-200 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-choco-700 bg-choco-100 px-2.5 py-1 rounded-lg">
                        #{o._id.slice(-6)}
                      </span>
                      <span className="text-xs font-medium uppercase px-2 py-0.5 rounded-md bg-choco-100 text-choco-800">
                        {o.paymentMethod || 'COD'}
                      </span>
                      <span className="text-xs text-choco-400">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-choco-900 text-sm">
                        {o.shippingAddress?.fullName || o.user?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-choco-500">
                        📱 {o.shippingAddress?.phone || o.user?.phone || 'No Phone'}
                        {o.shippingAddress?.city ? ` • ${o.shippingAddress.city}, ${o.shippingAddress.state || ''}` : ''}
                      </p>
                    </div>
                    <div className="text-xs text-choco-700 bg-choco-50 p-2.5 rounded-xl">
                      <span className="font-semibold text-choco-800">Items: </span>
                      {o.items?.map((it) => `${it.product?.name || 'Chocolate'} (x${it.quantity})`).join(', ')}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-choco-100">
                    <div className="text-left md:text-right">
                      <p className="text-[11px] text-choco-400">Total Amount</p>
                      <p className="font-bold font-display text-lg sm:text-xl text-choco-900">₹{o.totalAmount}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-choco-500 hidden sm:inline">Status:</span>
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                        className="text-xs font-semibold p-2 rounded-xl border border-choco-200 bg-white text-choco-900 focus:outline-none cursor-pointer shadow-xs"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
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
