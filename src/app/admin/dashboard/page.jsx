'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getDashboardStats } from '@/api/admin';
import { getWhatsAppNumber, setWhatsAppNumber, fetchStoreWhatsAppNumber } from '@/utils/whatsapp';
import { getImageUrl } from '@/utils/imageUrl';
import api from '@/api/axios';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Navigation tabs: overview | products | whatsapp | orders | customers
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Orders Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [orderSort, setOrderSort] = useState('newest');

  // Customer Drilldown & Search
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSort, setCustomerSort] = useState('orders_desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);

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
    images: [],
    shapeOptions: ['Normal', 'Heart'],
    isAvailable: true,
    isFeatured: false,
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        toast.error('Admin authentication required.');
        router.replace('/admin/login');
        return;
      }
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
      const [statsRes, prodRes, ordersRes, usersRes] = await Promise.allSettled([
        getDashboardStats(),
        api.get('/products?all=true'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data.products || []);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data.orders || []);
      if (usersRes.status === 'fulfilled') setCustomers(usersRes.value.data.users || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDrilldown = async (customerId, customerObj = null) => {
    setLoadingCustomerDetails(true);
    try {
      const res = await api.get(`/admin/users?userId=${customerId}`);
      if (res.data?.success) {
        setSelectedCustomer(res.data.user);
        setCustomerOrders(res.data.orders || []);
        setCustomerReviews(res.data.reviews || []);
      } else if (customerObj) {
        setSelectedCustomer(customerObj);
        // Fallback filter from loaded orders
        const filtered = orders.filter((o) => o.user?._id === customerId || o.user === customerId);
        setCustomerOrders(filtered);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      if (customerObj) {
        setSelectedCustomer(customerObj);
        const filtered = orders.filter((o) => o.user?._id === customerId || o.user === customerId);
        setCustomerOrders(filtered);
      } else {
        toast.error('Could not load detailed customer history');
      }
    } finally {
      setLoadingCustomerDetails(false);
    }
  };

  const handleOpenCustomerDrilldown = (customer) => {
    setActiveTab('customers');
    loadCustomerDrilldown(customer._id || customer.id, customer);
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

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageFiles = async (files) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Please select image files (PNG, JPG, WEBP, etc.)');
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading(`Uploading ${validFiles.length} photo(s)...`);
    try {
      const newUrls = [];
      for (const file of validFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (res.data?.url) {
            newUrls.push(res.data.url);
            continue;
          }
        } catch (uploadErr) {
          console.warn('API upload fallback to local compression:', uploadErr);
        }

        const compressed = await compressImage(file);
        newUrls.push(compressed);
      }

      setProductForm((prev) => ({
        ...prev,
        images: [...(Array.isArray(prev.images) ? prev.images : []), ...newUrls],
      }));
      toast.success(`Added ${newUrls.length} photo(s)! 📸`, { id: toastId });
    } catch (err) {
      console.error('Image processing error:', err);
      toast.error('Failed to process image file', { id: toastId });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetCoverImage = (index) => {
    if (index === 0) return;
    setProductForm((prev) => {
      const list = [...(prev.images || [])];
      const [selected] = list.splice(index, 1);
      list.unshift(selected);
      return { ...prev, images: list };
    });
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setProductForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), customUrlInput.trim()],
    }));
    setCustomUrlInput('');
    setShowUrlInput(false);
    toast.success('Image URL added! 🔗');
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Normal Shape or Heart',
      price: '',
      stock: '',
      description: '',
      images: [],
      shapeOptions: ['Normal', 'Heart'],
      isAvailable: true,
      isFeatured: false,
    });
    setCustomUrlInput('');
    setShowUrlInput(false);
    setShowProductModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    const existingImages = Array.isArray(prod.images)
      ? prod.images
      : prod.images
      ? [prod.images]
      : [];
    setProductForm({
      name: prod.name,
      category: prod.category || 'Normal Shape or Heart',
      price: prod.price,
      stock: prod.stock,
      description: prod.description || '',
      images: existingImages,
      shapeOptions: prod.shapeOptions || (prod.category === 'Bites' ? [] : ['Normal', 'Heart']),
      isAvailable: prod.isAvailable !== false,
      isFeatured: prod.isFeatured === true,
    });
    setCustomUrlInput('');
    setShowUrlInput(false);
    setShowProductModal(true);
  };

  const handleToggleProductAvailability = async (prod) => {
    const updatedStatus = !prod.isAvailable;
    try {
      await api.put(`/products/${prod._id}`, { isAvailable: updatedStatus });
      toast.success(`${prod.name} is now ${updatedStatus ? 'Active' : 'Hidden'}!`);
      setProducts((prev) =>
        prev.map((p) => (p._id === prod._id ? { ...p, isAvailable: updatedStatus } : p))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    }
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
    if (!productForm.images || productForm.images.length === 0) {
      toast.error('Please upload at least one chocolate photo');
      return;
    }
    setSavingProduct(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        description: productForm.description.trim(),
        images: productForm.images,
        shapeOptions: productForm.category === 'Bites' ? [] : productForm.shapeOptions,
        isAvailable: productForm.isAvailable,
        isFeatured: productForm.isFeatured,
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
      await api.put(`/orders/${orderId}`, { orderStatus: newStatus, status: newStatus });
      toast.success(`Order status updated to "${newStatus}"! 📦`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus, status: newStatus } : o
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Filtered Orders Logic
  const filteredOrders = orders
    .filter((o) => {
      if (orderStatusFilter !== 'all') {
        const current = (o.orderStatus || o.status || 'Pending').toLowerCase();
        if (current !== orderStatusFilter.toLowerCase()) return false;
      }
      if (orderTypeFilter !== 'all') {
        const oType = (o.orderType || (o.isTakeaway ? 'takeaway' : 'delivery')).toLowerCase();
        if (oType !== orderTypeFilter.toLowerCase()) return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const idMatch = o._id.toLowerCase().includes(q);
        const nameMatch = (
          o.shippingAddress?.fullName ||
          o.deliveryAddress?.fullName ||
          o.guestCustomer?.name ||
          o.user?.name ||
          ''
        ).toLowerCase().includes(q);
        const phoneMatch = (
          o.shippingAddress?.phone ||
          o.deliveryAddress?.phone ||
          o.guestCustomer?.phone ||
          o.user?.phone ||
          ''
        ).toLowerCase().includes(q);
        const emailMatch = (o.user?.email || o.guestCustomer?.email || '').toLowerCase().includes(q);
        const productMatch = o.items?.some((it) =>
          (it.name || it.product?.name || '').toLowerCase().includes(q)
        );
        return idMatch || nameMatch || phoneMatch || emailMatch || productMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (orderSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (orderSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (orderSort === 'amount_desc') return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (orderSort === 'amount_asc') return (a.totalAmount || 0) - (b.totalAmount || 0);
      return 0;
    });

  // Filtered Customers Logic
  const filteredCustomers = customers
    .filter((c) => {
      if (!customerSearch.trim()) return true;
      const q = customerSearch.toLowerCase().trim();
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    })
    .sort((a, b) => {
      if (customerSort === 'orders_desc') return (b.totalOrders || 0) - (a.totalOrders || 0);
      if (customerSort === 'spent_desc') return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (customerSort === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (customerSort === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (customerSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (customerSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

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
            Manage chocolates, customer telemetry, reviews, mobile notifications, and fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn-secondary text-xs sm:text-sm py-2 px-3.5 flex items-center gap-1.5"
            title="Reload telemetry data"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span> {loading ? 'Syncing...' : 'Refresh'}
          </button>
          <Link
            href="/"
            className="btn-secondary text-xs sm:text-sm py-2 px-4 flex items-center gap-1.5"
          >
            🌐 View Store
          </Link>
        </div>
      </div>

      {/* Admin Tabs - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 border-b border-choco-200 pb-3">
        <button
          onClick={() => { setActiveTab('overview'); setSelectedCustomer(null); }}
          className={`px-3 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50 border border-choco-100'
          }`}
        >
          <span>📊</span> Overview
        </button>
        <button
          onClick={() => { setActiveTab('orders'); setSelectedCustomer(null); }}
          className={`px-3 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50 border border-choco-100'
          }`}
        >
          <span>📦</span> Orders ({orders.length})
        </button>
        <button
          onClick={() => { setActiveTab('customers'); }}
          className={`px-3 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'customers'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50 border border-choco-100'
          }`}
        >
          <span>👥</span> Customers ({customers.length})
        </button>
        <button
          onClick={() => { setActiveTab('products'); setSelectedCustomer(null); }}
          className={`px-3 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50 border border-choco-100'
          }`}
        >
          <span>🍫</span> Chocolates ({products.length})
        </button>
        <button
          onClick={() => { setActiveTab('whatsapp'); setSelectedCustomer(null); }}
          className={`col-span-2 sm:col-span-1 px-3 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'whatsapp'
              ? 'bg-choco-800 text-cream shadow-sm'
              : 'bg-white text-choco-700 hover:bg-choco-50 border border-choco-100'
          }`}
        >
          <span>📱</span> WhatsApp
        </button>
      </div>

      {/* TAB 1: OVERVIEW - Clickable Telemetry Cards */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Vertical Stack of Interactive Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Total Orders Card (Clickable -> Orders Tab) */}
            <button
              type="button"
              onClick={() => {
                setOrderStatusFilter('all');
                setActiveTab('orders');
              }}
              className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center justify-between text-left hover:border-choco-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  📦
                </div>
                <div>
                  <p className="text-choco-500 text-xs font-medium">Total Orders</p>
                  <p className="font-display text-2xl font-bold text-choco-900">{stats?.totalOrders || orders.length || 0}</p>
                  <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Click to view orders →</p>
                </div>
              </div>
            </button>

            {/* 2. Total Revenue Card (Clickable -> Orders Tab) */}
            <button
              type="button"
              onClick={() => {
                setOrderStatusFilter('all');
                setActiveTab('orders');
              }}
              className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center justify-between text-left hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  💰
                </div>
                <div>
                  <p className="text-choco-500 text-xs font-medium">Total Revenue</p>
                  <p className="font-display text-2xl font-bold text-choco-900">
                    ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Gross store earnings →</p>
                </div>
              </div>
            </button>

            {/* 3. Pending Orders Card (Clickable -> Orders Tab with Pending filter) */}
            <button
              type="button"
              onClick={() => {
                setOrderStatusFilter('Pending');
                setActiveTab('orders');
              }}
              className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm flex items-center justify-between text-left hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  ⏳
                </div>
                <div>
                  <p className="text-amber-800 text-xs font-semibold">Pending Orders</p>
                  <p className="font-display text-2xl font-bold text-choco-900">{stats?.pendingOrders || orders.filter(o => (o.orderStatus || o.status) === 'Pending').length || 0}</p>
                  <p className="text-[10px] text-amber-700 font-bold mt-0.5">Filter pending orders →</p>
                </div>
              </div>
            </button>

            {/* 4. Total Customers Card (Clickable -> Customers Tab) */}
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(null);
                setActiveTab('customers');
              }}
              className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm flex items-center justify-between text-left hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  👥
                </div>
                <div>
                  <p className="text-choco-500 text-xs font-medium">Customers</p>
                  <p className="font-display text-2xl font-bold text-choco-900">{stats?.totalCustomers || stats?.totalUsers || customers.length || 0}</p>
                  <p className="text-[10px] text-purple-600 font-semibold mt-0.5">View customer list →</p>
                </div>
              </div>
            </button>
          </div>

          {/* Quick Store Actions - Wrapping Safe Cards */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-choco-100">
            <h3 className="font-display text-lg font-bold text-choco-900 mb-3">⚡ Quick Store Actions</h3>
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => { setActiveTab('products'); handleOpenAddModal(); }}
                className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-gold flex items-center gap-3.5 transition-all whitespace-normal break-words"
              >
                <span className="text-2xl flex-shrink-0">🍫</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm sm:text-base leading-snug">Add New Chocolate Product</p>
                  <p className="text-xs font-normal opacity-90 leading-normal mt-0.5">
                    Create a new item, set pricing, shape options, and inventory stock
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className="w-full text-left p-4 rounded-2xl bg-white hover:bg-choco-50 text-choco-800 border border-choco-200 shadow-xs flex items-center gap-3.5 transition-all whitespace-normal break-words"
              >
                <span className="text-2xl flex-shrink-0">📱</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm sm:text-base text-choco-900 leading-snug">Configure WhatsApp Mobile Number</p>
                  <p className="text-xs font-normal text-choco-600 leading-normal mt-0.5">
                    Update destination mobile number for customer inquiries and orders
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="w-full text-left p-4 rounded-2xl bg-choco-900 hover:bg-choco-800 text-white shadow-choco flex items-center gap-3.5 transition-all whitespace-normal break-words"
              >
                <span className="text-2xl flex-shrink-0">📦</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm sm:text-base leading-snug">Review Customer Orders</p>
                  <p className="text-xs font-normal text-choco-200 leading-normal mt-0.5">
                    Track order statuses, customer addresses, take-away pickups, and delivery
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT - Search, Filter, Sort, Complete Details & Ratings */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Header and Controls */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-choco-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="font-display text-xl font-bold text-choco-900">
                  Customer Orders ({filteredOrders.length} of {orders.length})
                </h2>
                <p className="text-choco-500 text-xs">
                  Search, filter, update statuses, inspect ordered items, and review customer ratings
                </p>
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 self-end sm:self-auto"
              >
                <span>🔄</span> Refresh
              </button>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-choco-100">
              {/* Search */}
              <div>
                <label className="text-[11px] font-semibold text-choco-600 block mb-1">Search Orders</label>
                <input
                  type="text"
                  placeholder="Order ID, Name, Phone, Item..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="input-field text-xs py-2 px-3"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[11px] font-semibold text-choco-600 block mb-1">Status Filter</label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="input-field text-xs py-2 px-3 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Confirmed">✓ Confirmed</option>
                  <option value="Preparing">🥣 Preparing</option>
                  <option value="Prepared">🍫 Prepared</option>
                  <option value="Out for Delivery">🚚 Out for Delivery</option>
                  <option value="Delivered">🎉 Delivered</option>
                  <option value="Cancelled">❌ Cancelled</option>
                </select>
              </div>

              {/* Order Type Filter */}
              <div>
                <label className="text-[11px] font-semibold text-choco-600 block mb-1">Fulfillment Type</label>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="input-field text-xs py-2 px-3 cursor-pointer"
                >
                  <option value="all">All Fulfillment Types</option>
                  <option value="delivery">🚚 Home Delivery</option>
                  <option value="takeaway">🛍️ Take-away (Store Pickup)</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-[11px] font-semibold text-choco-600 block mb-1">Sort Orders</label>
                <select
                  value={orderSort}
                  onChange={(e) => setOrderSort(e.target.value)}
                  className="input-field text-xs py-2 px-3 cursor-pointer"
                >
                  <option value="newest">📅 Newest First</option>
                  <option value="oldest">📅 Oldest First</option>
                  <option value="amount_desc">💰 Highest Amount</option>
                  <option value="amount_asc">💰 Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-choco-100">
              <span className="text-4xl block mb-2">📦</span>
              <p className="text-choco-600 font-medium">No orders match your filter criteria.</p>
              {(orderSearch || orderStatusFilter !== 'all' || orderTypeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setOrderSearch('');
                    setOrderStatusFilter('all');
                    setOrderTypeFilter('all');
                  }}
                  className="mt-3 btn-secondary text-xs py-1.5 px-3"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((o) => {
                const customerName =
                  o.shippingAddress?.fullName ||
                  o.deliveryAddress?.fullName ||
                  o.guestCustomer?.name ||
                  o.user?.name ||
                  'Customer';
                const customerPhone =
                  o.shippingAddress?.phone ||
                  o.deliveryAddress?.phone ||
                  o.guestCustomer?.phone ||
                  o.user?.phone ||
                  '';
                const customerEmail = o.user?.email || o.guestCustomer?.email || '';
                const isTakeaway = o.orderType === 'takeaway' || o.isTakeaway;
                const currentStatus = o.orderStatus || o.status || 'Pending';

                // Extract delivery address components
                const street = o.shippingAddress?.street || o.deliveryAddress?.street || o.guestCustomer?.address?.street || '';
                const city = o.shippingAddress?.city || o.deliveryAddress?.city || o.guestCustomer?.address?.city || '';
                const state = o.shippingAddress?.state || o.deliveryAddress?.state || o.guestCustomer?.address?.state || '';
                const pincode = o.shippingAddress?.pincode || o.deliveryAddress?.pincode || o.guestCustomer?.address?.pincode || '';

                const fullAddressString = [street, city, state, pincode].filter(Boolean).join(', ');

                return (
                  <div
                    key={o._id}
                    className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm space-y-4 hover:border-choco-200 transition-all"
                  >
                    {/* Header Row: ID, Fulfillment badge, Payment badge, Date, Status Selector */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-choco-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-choco-800 bg-choco-100 px-2.5 py-1 rounded-lg">
                          #{o._id.slice(-6).toUpperCase()}
                        </span>
                        
                        {/* Fulfillment Badge */}
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            isTakeaway
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {isTakeaway ? '🛍️ Take-away Pickup' : '🚚 Home Delivery'}
                        </span>

                        {/* Payment Method Badge */}
                        <span className="text-xs font-medium uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          💵 {o.paymentMethod === 'online' ? 'Online Paid' : 'Cash on Delivery (COD)'}
                        </span>

                        {/* Rating Badge */}
                        {o.hasReview ? (
                          <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            ⭐ Rating Given {o.reviews?.[0]?.rating ? `(${o.reviews[0].rating}/5)` : ''}
                          </span>
                        ) : (
                          <span className="text-[11px] text-choco-400 bg-choco-50 px-2 py-0.5 rounded-md">
                            ⏳ No Rating Yet
                          </span>
                        )}

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

                      {/* Status Selector */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-xs font-semibold text-choco-700">Status:</span>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                          className={`text-xs font-bold py-1.5 px-3 rounded-xl border cursor-pointer shadow-xs ${
                            currentStatus === 'Delivered'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : currentStatus === 'Cancelled'
                              ? 'bg-red-50 border-red-300 text-red-800'
                              : currentStatus === 'Out for Delivery'
                              ? 'bg-blue-50 border-blue-300 text-blue-800'
                              : 'bg-amber-50 border-amber-300 text-amber-800'
                          }`}
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Confirmed">✓ Confirmed</option>
                          <option value="Preparing">🥣 Preparing</option>
                          <option value="Prepared">🍫 Prepared</option>
                          <option value="Out for Delivery">🚚 Out for Delivery</option>
                          <option value="Delivered">🎉 Delivered</option>
                          <option value="Cancelled">❌ Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Middle Section: Customer Details & Fulfillment Destination */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-choco-50/50 p-3.5 rounded-xl border border-choco-100 text-xs">
                      {/* Customer Info with Clickable Drilldown Trigger */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-choco-500 uppercase tracking-wider">Customer Details</p>
                        <div className="flex items-center gap-2">
                          {o.user ? (
                            <button
                              type="button"
                              onClick={() => handleOpenCustomerDrilldown(o.user)}
                              className="font-bold text-choco-900 text-sm hover:text-gold-600 underline flex items-center gap-1 text-left"
                              title="Click to view full customer history"
                            >
                              👤 {customerName} <span className="text-[10px] text-gold-600 font-semibold no-underline">↗ View History</span>
                            </button>
                          ) : (
                            <p className="font-bold text-choco-900 text-sm">👤 {customerName} (Guest)</p>
                          )}
                        </div>
                        {customerPhone && (
                          <div className="flex items-center gap-2 text-choco-700">
                            <span>📱 {customerPhone}</span>
                            <a
                              href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded hover:bg-emerald-200"
                            >
                              💬 WhatsApp
                            </a>
                            <a
                              href={`tel:${customerPhone}`}
                              className="text-[10px] font-bold bg-choco-100 text-choco-800 px-1.5 py-0.5 rounded hover:bg-choco-200"
                            >
                              📞 Call
                            </a>
                          </div>
                        )}
                        {customerEmail && <p className="text-choco-500">✉️ {customerEmail}</p>}
                      </div>

                      {/* Fulfillment Destination / Pickup Info */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-choco-500 uppercase tracking-wider">
                          {isTakeaway ? 'Pickup Details' : 'Delivery Address'}
                        </p>
                        {isTakeaway ? (
                          <div className="p-2 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-900">
                            <p className="font-semibold">🛍️ Customer Store Pickup</p>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                              Customer will collect this order directly from the store location.
                            </p>
                          </div>
                        ) : (
                          <div className="text-choco-700">
                            <p className="font-semibold">{fullAddressString || 'No street address provided'}</p>
                            {o.shippingAddress?.notes && (
                              <p className="text-choco-500 italic mt-0.5">Note: "{o.shippingAddress.notes}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ordered Items Breakdown with Unified Product Details */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-choco-500 uppercase tracking-wider">
                        Ordered Items & Specifications
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {o.items?.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-choco-100 shadow-xs"
                          >
                            <img
                              src={getImageUrl(it.image || it.product?.images?.[0]) || 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=80&q=80'}
                              alt={it.name || 'Chocolate'}
                              className="w-12 h-12 rounded-lg object-cover border border-choco-200 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-choco-900 text-xs truncate">
                                {it.name || it.product?.name || 'Handcrafted Chocolate'}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-choco-600">
                                <span>Qty: <strong className="text-choco-900">{it.quantity}</strong></span>
                                {it.shape && (
                                  <span className="bg-choco-100 text-choco-800 px-1.5 py-0.2 rounded font-medium">
                                    {it.shape}
                                  </span>
                                )}
                                <span>@ ₹{it.price}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-choco-900 text-xs font-display">
                                ₹{(it.price || 0) * (it.quantity || 1)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reviews / Feedback snippet if available */}
                    {o.reviews && o.reviews.length > 0 && (
                      <div className="p-3 bg-gold-50/60 rounded-xl border border-gold-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gold-900 flex items-center gap-1">
                            ⭐ Customer Review ({o.reviews[0].rating}/5 Stars)
                          </span>
                          <span className="text-[10px] text-gold-700">
                            {new Date(o.reviews[0].createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {o.reviews[0].comment && (
                          <p className="text-choco-800 italic">"{o.reviews[0].comment}"</p>
                        )}
                      </div>
                    )}

                    {/* Footer Row: Total Price */}
                    <div className="flex justify-between items-center pt-2 border-t border-choco-100">
                      <span className="text-xs font-semibold text-choco-600">Total Order Amount</span>
                      <span className="font-display text-lg font-bold text-choco-900">₹{o.totalAmount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOMERS & DRILLDOWN VIEW */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* If a customer is selected, show the Dedicated Customer Details View */}
          {selectedCustomer ? (
            <div className="space-y-4">
              {/* Back button and Customer Banner */}
              <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm space-y-4">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-semibold text-choco-800"
                >
                  ← Back to All Customers
                </button>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-choco-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-choco-gradient flex items-center justify-center text-cream text-xl font-bold shadow-choco">
                      {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-bold text-choco-900">{selectedCustomer.name}</h2>
                        <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase">
                          {selectedCustomer.role || 'Customer'}
                        </span>
                      </div>
                      <p className="text-xs text-choco-500">{selectedCustomer.email}</p>
                      {selectedCustomer.phone && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-choco-700">
                          <span>📱 {selectedCustomer.phone}</span>
                          <a
                            href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded"
                          >
                            💬 WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Aggregated Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto text-center">
                    <div className="bg-choco-50 p-2.5 rounded-xl border border-choco-100">
                      <p className="text-[10px] text-choco-500 font-semibold">Total Orders</p>
                      <p className="font-bold text-base text-choco-900 font-display">{customerOrders.length}</p>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <p className="text-[10px] text-emerald-700 font-semibold">Total Spent</p>
                      <p className="font-bold text-base text-emerald-900 font-display">
                        ₹{customerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}
                      </p>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 col-span-2 sm:col-span-1">
                      <p className="text-[10px] text-amber-700 font-semibold">Reviews</p>
                      <p className="font-bold text-base text-amber-900 font-display">{customerReviews.length}</p>
                    </div>
                  </div>
                </div>

                {/* Saved Address if present */}
                {selectedCustomer.address && (selectedCustomer.address.street || selectedCustomer.address.city) && (
                  <div className="p-3 bg-choco-50/70 rounded-xl text-xs text-choco-700 border border-choco-100">
                    <span className="font-bold text-choco-900">Saved Default Address: </span>
                    {[
                      selectedCustomer.address.street,
                      selectedCustomer.address.city,
                      selectedCustomer.address.state,
                      selectedCustomer.address.pincode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>

              {/* Customer Orders History Section */}
              <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm space-y-4">
                <h3 className="font-display text-base font-bold text-choco-900">
                  Complete Order History ({customerOrders.length})
                </h3>

                {loadingCustomerDetails ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-8 h-8 border-3 border-choco-800 border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : customerOrders.length === 0 ? (
                  <p className="text-xs text-choco-500 italic">No orders found for this customer.</p>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((o) => (
                      <div
                        key={o._id}
                        className="p-3.5 bg-choco-50/50 rounded-xl border border-choco-100 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-choco-800">#{o._id.slice(-6).toUpperCase()}</span>
                            <span className="bg-white px-2 py-0.5 rounded text-[10px] font-semibold text-choco-700 border border-choco-200">
                              {o.orderType === 'takeaway' || o.isTakeaway ? '🛍️ Take-away' : '🚚 Delivery'}
                            </span>
                            <span className="text-choco-400">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-choco-700 mt-1">
                            Items: {o.items?.map((it) => `${it.name || 'Chocolate'} (x${it.quantity})`).join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className="font-bold text-sm font-display text-choco-900">₹{o.totalAmount}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (o.orderStatus || o.status) === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : (o.orderStatus || o.status) === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.orderStatus || o.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Reviews Section */}
              {customerReviews.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-choco-100 shadow-sm space-y-3">
                  <h3 className="font-display text-base font-bold text-choco-900">
                    Customer Reviews ({customerReviews.length})
                  </h3>
                  <div className="space-y-2">
                    {customerReviews.map((r) => (
                      <div key={r._id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-amber-900">⭐ {r.rating} / 5 Stars</span>
                          <span className="text-[10px] text-choco-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {r.comment && <p className="text-choco-800 italic">"{r.comment}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Main Customers Directory List */
            <div className="space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-choco-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold text-choco-900">
                      Customer Directory ({filteredCustomers.length} of {customers.length})
                    </h2>
                    <p className="text-choco-500 text-xs">
                      Search, view metrics, and drill down into individual customer purchase histories
                    </p>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-choco-100">
                  <div>
                    <label className="text-[11px] font-semibold text-choco-600 block mb-1">Search Customers</label>
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="input-field text-xs py-2 px-3"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-choco-600 block mb-1">Sort Customers</label>
                    <select
                      value={customerSort}
                      onChange={(e) => setCustomerSort(e.target.value)}
                      className="input-field text-xs py-2 px-3 cursor-pointer"
                    >
                      <option value="orders_desc">📦 Most Orders</option>
                      <option value="spent_desc">💰 Highest Lifetime Spend</option>
                      <option value="name_asc">🔤 Name (A - Z)</option>
                      <option value="name_desc">🔤 Name (Z - A)</option>
                      <option value="newest">📅 Recently Registered</option>
                      <option value="oldest">📅 Oldest Registered</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border border-choco-100">
                  <span className="text-4xl block mb-2">👥</span>
                  <p className="text-choco-600 font-medium">No customers found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCustomers.map((c) => (
                    <div
                      key={c._id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-choco-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-choco-200 transition-all"
                    >
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-xl bg-choco-gradient flex items-center justify-center text-cream text-lg font-bold shadow-choco flex-shrink-0">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-choco-900 text-sm">{c.name}</h4>
                            {c.role === 'admin' && (
                              <span className="text-[10px] font-bold bg-gold-100 text-gold-800 px-2 py-0.5 rounded-full">
                                👑 Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-choco-500">{c.email}</p>
                          {c.phone && <p className="text-xs text-choco-600 font-mono mt-0.5">📱 {c.phone}</p>}
                        </div>
                      </div>

                      {/* Right info: Metrics & Action button */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-choco-50">
                        <div className="text-left sm:text-right text-xs">
                          <span className="font-bold text-choco-900 block font-display text-sm">
                            {c.totalOrders || 0} Orders
                          </span>
                          <span className="text-choco-500 text-[11px]">
                            ₹{(c.totalSpent || 0).toLocaleString('en-IN')} spent
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => loadCustomerDrilldown(c._id, c)}
                          className="btn-secondary text-xs py-2 px-3.5 font-semibold text-choco-800 hover:bg-choco-100 whitespace-nowrap"
                        >
                          👁️ View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MANAGE CHOCOLATES */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-choco-100 shadow-sm">
            <div>
              <h2 className="font-display text-xl font-bold text-choco-900">Chocolate Catalog ({products.length})</h2>
              <p className="text-choco-500 text-xs">Add, edit prices, stock, shape options, photos, or toggle availability</p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="btn-gold py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
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
                      src={getImageUrl(p.images?.[0]) || 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=100&q=80'}
                      alt={p.name}
                      className="w-14 h-14 rounded-xl object-cover border border-choco-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-choco-900 text-sm">{p.name}</h4>
                        <span className="badge bg-choco-100 text-choco-800 text-[11px]">
                          {p.category === 'Bites' ? '🍬 Bites' : '🍫 Bar'}
                        </span>
                        {p.isFeatured && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleProductAvailability(p)}
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors ${
                            p.isAvailable
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                          }`}
                          title="Click to toggle active status"
                        >
                          {p.isAvailable ? '✓ Active' : 'Hidden'}
                        </button>
                      </div>
                      <p className="text-xs text-choco-400 line-clamp-1 mt-0.5">{p.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-bold text-choco-900 font-display text-base">₹{p.price}</span>
                        <span className={`font-semibold text-[11px] px-2 py-0.5 rounded-full ${p.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {p.stock} in stock
                        </span>
                        {p.shapeOptions && p.shapeOptions.length > 0 && (
                          <span className="text-[11px] text-choco-500 hidden sm:inline">
                            Shapes: {p.shapeOptions.join(', ')}
                          </span>
                        )}
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

      {/* TAB 5: STORE WHATSAPP NUMBER MANAGER */}
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

      {/* ADD / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
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
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setProductForm((p) => ({
                          ...p,
                          category: newCat,
                          shapeOptions: newCat === 'Bites' ? [] : ['Normal', 'Heart'],
                        }));
                      }}
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

                {/* Chocolate Photos Upload & Manager */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="label mb-0">Chocolate Photos *</label>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput((v) => !v)}
                      className="text-xs text-choco-600 hover:text-choco-900 underline font-medium"
                    >
                      {showUrlInput ? '✕ Close URL input' : '🔗 Add via image link'}
                    </button>
                  </div>

                  {/* Hidden native file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files)}
                  />

                  {/* Drag and Drop / File Picker Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleImageFiles(e.dataTransfer.files);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-choco-800 bg-choco-100/70 scale-[1.01]'
                        : 'border-choco-300 hover:border-choco-500 bg-choco-50/50 hover:bg-choco-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-choco-200 flex items-center justify-center text-xl">
                        📸
                      </div>
                      <p className="font-semibold text-choco-900 text-xs sm:text-sm">
                        Click or drag local photos from your computer / phone
                      </p>
                      <p className="text-[11px] text-choco-500">
                        Supports PNG, JPG, JPEG, WEBP files
                      </p>
                      <button
                        type="button"
                        disabled={uploadingImage}
                        className="mt-1 btn-gold py-1.5 px-3.5 text-xs font-semibold rounded-lg shadow-xs pointer-events-none"
                      >
                        {uploadingImage ? 'Processing...' : '📁 Browse Local Photos'}
                      </button>
                    </div>
                  </div>

                  {/* Optional URL input toggle */}
                  {showUrlInput && (
                    <div className="mt-2.5 p-3 bg-choco-50 rounded-xl border border-choco-200 flex gap-2">
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomUrl();
                          }
                        }}
                        className="input-field text-xs py-1.5 flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomUrl}
                        className="btn-primary py-1.5 px-3 text-xs font-semibold rounded-xl"
                      >
                        + Add
                      </button>
                    </div>
                  )}

                  {/* Selected Photos Thumbnails Grid */}
                  {productForm.images && productForm.images.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11px] font-semibold text-choco-700">
                        Selected Photos ({productForm.images.length}) — First photo is cover
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {productForm.images.map((imgUrl, index) => (
                          <div
                            key={index}
                            className="relative group rounded-xl overflow-hidden border border-choco-200 bg-choco-50 aspect-square shadow-xs"
                          >
                            <img
                              src={getImageUrl(imgUrl)}
                              alt={`Product preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <span className="absolute top-1 left-1 bg-choco-900/90 backdrop-blur-xs text-gold-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                ★ Cover
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverImage(index)}
                                  className="text-[9px] bg-white/90 hover:bg-white text-choco-900 font-semibold px-1.5 py-0.5 rounded shadow-xs"
                                >
                                  Make Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="text-[10px] bg-red-600/90 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded shadow-xs"
                                title="Remove photo"
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-choco-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isAvailable}
                      onChange={(e) => setProductForm((p) => ({ ...p, isAvailable: e.target.checked }))}
                      className="rounded border-choco-300 text-choco-800 focus:ring-choco-500 w-4 h-4"
                    />
                    ✓ Active in Store
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-choco-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                      className="rounded border-choco-300 text-gold-500 focus:ring-gold-500 w-4 h-4"
                    />
                    ⭐ Featured Item
                  </label>
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
