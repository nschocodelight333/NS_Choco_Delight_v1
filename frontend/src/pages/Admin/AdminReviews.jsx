import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAdminReviews, getAdminPendingReviews } from '../../api/admin';
import { getProducts } from '../../api/products';
import StarRating from '../../components/StarRating';
import { getImageUrl } from '../../utils/imageUrl';

const SORT_RECEIVED = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
];

const SORT_PENDING = [
  { value: 'longest_waiting', label: 'Longest Waiting First' },
  { value: 'recent_delivery', label: 'Most Recent Delivery' },
  { value: 'customer_name', label: 'Customer Name (A-Z)' },
  { value: 'product_name', label: 'Product Name (A-Z)' },
];

const AdminReviews = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'pending'
  const [productsList, setProductsList] = useState([]);

  // Received reviews state
  const [reviews, setReviews] = useState([]);
  const [summaryStats, setSummaryStats] = useState({ totalReviews: 0, avgRating: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedPages, setReceivedPages] = useState(1);
  const [receivedSort, setReceivedSort] = useState('newest');
  const [receivedProductFilter, setReceivedProductFilter] = useState('');
  const [receivedRatingFilter, setReceivedRatingFilter] = useState('');

  // Pending reviews state
  const [pendingReviews, setPendingReviews] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [loadingPending, setLoadingPending] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPages, setPendingPages] = useState(1);
  const [pendingSort, setPendingSort] = useState('longest_waiting');
  const [pendingProductFilter, setPendingProductFilter] = useState('');

  // Fetch product catalog for dropdown filters
  useEffect(() => {
    getProducts({ limit: 100 })
      .then((res) => setProductsList(res.data.products || []))
      .catch(() => {});
  }, []);

  // Fetch Received Reviews
  const fetchReceivedReviews = useCallback(async () => {
    setLoadingReceived(true);
    try {
      const params = {
        page: receivedPage,
        limit: 15,
        sort: receivedSort,
      };
      if (receivedProductFilter) params.product = receivedProductFilter;
      if (receivedRatingFilter) params.rating = receivedRatingFilter;

      const res = await getAdminReviews(params);
      setReviews(res.data.reviews || []);
      setReceivedPages(res.data.pages || 1);
      if (res.data.summary) setSummaryStats(res.data.summary);
    } catch {
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoadingReceived(false);
    }
  }, [receivedPage, receivedSort, receivedProductFilter, receivedRatingFilter]);

  // Fetch Pending Reviews
  const fetchPendingReviews = useCallback(async () => {
    setLoadingPending(true);
    try {
      const params = {
        page: pendingPage,
        limit: 15,
        sort: pendingSort,
      };
      if (pendingProductFilter) params.product = pendingProductFilter;

      const res = await getAdminPendingReviews(params);
      setPendingReviews(res.data.pendingReviews || []);
      setPendingTotal(res.data.total || 0);
      setPendingPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load pending reviews');
      setPendingReviews([]);
    } finally {
      setLoadingPending(false);
    }
  }, [pendingPage, pendingSort, pendingProductFilter]);

  useEffect(() => {
    fetchReceivedReviews();
  }, [fetchReceivedReviews]);

  useEffect(() => {
    fetchPendingReviews();
  }, [fetchPendingReviews]);

  // Send WhatsApp Reminder
  const handleSendReminder = (item) => {
    let rawPhone = item.customer?.phone || '';
    rawPhone = rawPhone.replace(/\D/g, '');
    if (!rawPhone.startsWith('91') && rawPhone.length === 10) {
      rawPhone = `91${rawPhone}`;
    }

    const message = encodeURIComponent(
      `Hi ${item.customer?.name || 'Customer'}! 🍫\nThank you for choosing NS Choco Delight!\nHow did you enjoy your ${item.product?.name}? We would love to hear your feedback!\n\nPlease write a review on our website for your order #${item.orderId?.slice(-8).toUpperCase() || ''}.\nThank you! ✨`
    );

    const waUrl = rawPhone ? `https://wa.me/${rawPhone}?text=${message}` : `https://wa.me/918185920511?text=${message}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-choco-900">Reviews Management</h1>
          <p className="text-choco-600 text-sm">Monitor customer feedback, ratings, and follow up on un-reviewed delivered orders</p>
        </div>
      </div>

      {/* ─── Summary Stats Header Card ─────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-choco-100 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-choco-100">
          <div>
            <p className="text-xs font-semibold text-choco-500 uppercase tracking-wider">Total Reviews</p>
            <p className="font-display font-extrabold text-3xl text-choco-900 mt-1">{summaryStats.totalReviews}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-choco-500 uppercase tracking-wider">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-display font-extrabold text-3xl text-amber-700">{summaryStats.avgRating?.toFixed(1) || '0.0'}</span>
              <StarRating rating={summaryStats.avgRating || 0} size="md" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-choco-500 uppercase tracking-wider">Pending Reviews</p>
            <p className="font-display font-extrabold text-3xl text-amber-900 mt-1">{pendingTotal}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-choco-500 uppercase tracking-wider">5-Star Satisfaction</p>
            <p className="font-display font-extrabold text-3xl text-emerald-800 mt-1">
              {summaryStats.totalReviews > 0
                ? `${Math.round(((summaryStats.breakdown[5] || 0) / summaryStats.totalReviews) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>

        {/* Rating Breakdown Chips */}
        <div className="pt-4 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-choco-700 mr-2">Filter by Rating:</span>
          <button
            type="button"
            onClick={() => { setReceivedRatingFilter(''); setReceivedPage(1); }}
            className={`px-3 py-1.5 rounded-full border transition-all ${
              !receivedRatingFilter ? 'bg-choco-800 text-cream font-bold border-choco-800' : 'bg-choco-50 text-choco-700 border-choco-200 hover:bg-choco-100'
            }`}
          >
            All Ratings ({summaryStats.totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => { setReceivedRatingFilter(star.toString()); setReceivedPage(1); setActiveTab('received'); }}
              className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${
                receivedRatingFilter == star
                  ? 'bg-amber-800 text-gold-200 font-bold border-amber-800 shadow-2xs'
                  : 'bg-white text-choco-800 border-choco-200 hover:border-amber-400'
              }`}
            >
              <span>{star}⭐</span>
              <span className="font-mono text-choco-500">({summaryStats.breakdown[star] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Navigation Tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-choco-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('received')}
          id="admin-tab-received-reviews"
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'received'
              ? 'border-choco-800 text-choco-900'
              : 'border-transparent text-choco-500 hover:text-choco-800'
          }`}
        >
          <span>⭐ Reviews Received</span>
          <span className="bg-choco-100 text-choco-800 text-xs px-2.5 py-0.5 rounded-full font-mono">
            {summaryStats.totalReviews}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          id="admin-tab-pending-reviews"
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-amber-600 text-amber-950'
              : 'border-transparent text-choco-500 hover:text-choco-800'
          }`}
        >
          <span>⏳ Pending Customer Reviews</span>
          {pendingTotal > 0 && (
            <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
              {pendingTotal}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB 1: REVIEWS RECEIVED ─────────────────────────────────── */}
      {activeTab === 'received' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-choco-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <select
                value={receivedProductFilter}
                onChange={(e) => { setReceivedProductFilter(e.target.value); setReceivedPage(1); }}
                className="input-field text-xs py-2 max-w-xs"
                id="admin-review-product-filter"
              >
                <option value="">All Products</option>
                {productsList.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>

              <select
                value={receivedRatingFilter}
                onChange={(e) => { setReceivedRatingFilter(e.target.value); setReceivedPage(1); }}
                className="input-field text-xs py-2 max-w-[160px]"
                id="admin-review-rating-filter"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                <option value="4">4 Stars ⭐⭐⭐⭐</option>
                <option value="3">3 Stars ⭐⭐⭐</option>
                <option value="2">2 Stars ⭐⭐</option>
                <option value="1">1 Star ⭐</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-choco-500 font-medium">Sort:</span>
              <select
                value={receivedSort}
                onChange={(e) => { setReceivedSort(e.target.value); setReceivedPage(1); }}
                className="input-field text-xs py-2 max-w-[180px]"
                id="admin-review-sort-select"
              >
                {SORT_RECEIVED.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {loadingReceived ? (
            <div className="space-y-3 py-10 text-center bg-white rounded-2xl p-8 border border-choco-100">
              <span className="text-4xl block animate-bounce mb-2">⭐</span>
              <p className="text-choco-600 font-medium">Loading customer reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-choco-100">
              <span className="text-5xl block mb-3">💬</span>
              <h3 className="font-display font-bold text-xl text-choco-900 mb-1">No reviews found</h3>
              <p className="text-choco-500 text-sm">No customer reviews match your active filter parameters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-choco-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-choco-50/70 border-b border-choco-100 text-[11px] font-bold uppercase tracking-wider text-choco-600">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Comment</th>
                      <th className="p-4">Order ID</th>
                      <th className="p-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-choco-50 text-xs">
                    {reviews.map((rev) => (
                      <tr key={rev._id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-choco-800 text-cream font-bold flex items-center justify-center text-xs shrink-0">
                              {rev.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-choco-900 text-sm">{rev.user?.name || 'Customer'}</p>
                              <p className="text-[11px] text-choco-500">{rev.user?.phone || rev.user?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-choco-50 border border-choco-100 shrink-0">
                              {rev.product?.images?.[0] ? (
                                <img src={getImageUrl(rev.product.images[0])} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm">🍫</div>
                              )}
                            </div>
                            <span className="font-semibold text-choco-900 line-clamp-2 max-w-[160px]">
                              {rev.product?.name || 'Product'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <StarRating rating={rev.rating} size="sm" />
                            <span className="text-[11px] font-bold text-amber-900">{rev.rating} / 5</span>
                          </div>
                        </td>
                        <td className="p-4 max-w-[280px]">
                          {rev.comment ? (
                            <p className="text-choco-700 leading-relaxed italic">{rev.comment}</p>
                          ) : (
                            <span className="text-choco-400 italic">No text comment provided</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {rev.order ? (
                            <Link
                              to={`/admin/orders`}
                              className="font-mono font-bold text-choco-900 hover:text-amber-700 underline underline-offset-2"
                            >
                              #{rev.order._id?.slice(-8).toUpperCase() || rev.order}
                            </Link>
                          ) : (
                            <span className="text-choco-400">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right text-choco-500 whitespace-nowrap">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {receivedPages > 1 && (
                <div className="p-4 border-t border-choco-100 flex items-center justify-between">
                  <span className="text-xs text-choco-600 font-medium">Page {receivedPage} of {receivedPages}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={receivedPage <= 1}
                      onClick={() => setReceivedPage((p) => p - 1)}
                      className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={receivedPage >= receivedPages}
                      onClick={() => setReceivedPage((p) => p + 1)}
                      className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: PENDING CUSTOMER REVIEWS ───────────────────────────── */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-choco-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <select
                value={pendingProductFilter}
                onChange={(e) => { setPendingProductFilter(e.target.value); setPendingPage(1); }}
                className="input-field text-xs py-2 max-w-xs"
                id="admin-pending-product-filter"
              >
                <option value="">All Delivered Products</option>
                {productsList.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-choco-500 font-medium">Sort:</span>
              <select
                value={pendingSort}
                onChange={(e) => { setPendingSort(e.target.value); setPendingPage(1); }}
                className="input-field text-xs py-2 max-w-[200px]"
                id="admin-pending-sort-select"
              >
                {SORT_PENDING.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {loadingPending ? (
            <div className="space-y-3 py-10 text-center bg-white rounded-2xl p-8 border border-choco-100">
              <span className="text-4xl block animate-bounce mb-2">⏳</span>
              <p className="text-choco-600 font-medium">Scanning delivered orders for un-reviewed items...</p>
            </div>
          ) : pendingReviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-choco-100">
              <span className="text-5xl block mb-3">🎉</span>
              <h3 className="font-display font-bold text-xl text-choco-900 mb-1">All delivered orders reviewed!</h3>
              <p className="text-choco-500 text-sm">Every customer who received a delivered order has submitted their review.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-choco-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-choco-50/70 border-b border-choco-100 text-[11px] font-bold uppercase tracking-wider text-choco-600">
                      <th className="p-4">Customer Contact</th>
                      <th className="p-4">Product Ordered</th>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Delivered Date</th>
                      <th className="p-4 text-center">Days Waiting</th>
                      <th className="p-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-choco-50 text-xs">
                    {pendingReviews.map((item) => (
                      <tr key={item._id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-choco-900 text-sm">{item.customer?.name || 'Customer'}</p>
                            <p className="text-[11px] text-choco-500 font-mono">
                              📞 {item.customer?.phone || 'No phone'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-choco-50 border border-choco-100 shrink-0">
                              {item.product?.image ? (
                                <img src={getImageUrl(item.product.image)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm">🍫</div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-choco-900">{item.product?.name}</p>
                              <p className="text-[11px] text-choco-500">₹{item.product?.price}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap font-mono font-bold text-choco-800">
                          #{item.orderId?.slice(-8).toUpperCase()}
                        </td>
                        <td className="p-4 whitespace-nowrap text-choco-600">
                          {new Date(item.deliveryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className={`inline-block font-bold text-xs px-3 py-1 rounded-full ${
                            item.daysSinceDelivered >= 7
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : item.daysSinceDelivered >= 3
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {item.daysSinceDelivered} day{item.daysSinceDelivered !== 1 ? 's' : ''} ago
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSendReminder(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                          >
                            <span>💬</span> Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pendingPages > 1 && (
                <div className="p-4 border-t border-choco-100 flex items-center justify-between">
                  <span className="text-xs text-choco-600 font-medium">Page {pendingPage} of {pendingPages}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pendingPage <= 1}
                      onClick={() => setPendingPage((p) => p - 1)}
                      className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={pendingPage >= pendingPages}
                      onClick={() => setPendingPage((p) => p + 1)}
                      className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
