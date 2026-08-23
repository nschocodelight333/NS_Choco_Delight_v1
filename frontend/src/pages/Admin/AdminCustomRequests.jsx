import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUrl';
import {
  getAllCustomOrders,
  setQuote,
  updateCustomOrderStatus,
} from '../../api/customOrders';

const STATUS_STYLES = {
  'Pending Review': 'bg-yellow-100 text-yellow-700',
  'Quoted': 'bg-blue-100 text-blue-700',
  'Accepted': 'bg-emerald-100 text-emerald-700',
  'Rejected': 'bg-red-100 text-red-600',
  'Converted to Order': 'bg-purple-100 text-purple-700',
  'Cancelled': 'bg-gray-100 text-gray-500',
};

const ALL_STATUSES = ['Pending Review', 'Quoted', 'Accepted', 'Rejected', 'Converted to Order', 'Cancelled'];

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ─── Detail / Quote Panel ─────────────────────────────────────────────────────
const DetailPanel = ({ request, onClose, onUpdated }) => {
  const [quotePrice, setQuotePrice] = useState(request.quotedPrice || '');
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [statusVal, setStatusVal] = useState(request.status);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const customerName = request.userId?.name || 'Customer';
  const customerEmail = request.userId?.email || 'No email provided';
  const customerPhone = request.userId?.phone || '';
  const cleanPhone = customerPhone.replace(/\D/g, '');

  const handleSendQuote = async () => {
    if (!quotePrice || Number(quotePrice) <= 0) return toast.error('Enter a valid price');
    setSending(true);
    try {
      const res = await setQuote(request._id, { quotedPrice: Number(quotePrice), adminNotes });
      toast.success('Quote sent to customer! 💰');
      onUpdated(res.data.request);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send quote');
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const res = await updateCustomOrderStatus(request._id, statusVal);
      toast.success('Status updated');
      onUpdated(res.data.request);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div className="absolute inset-0 bg-choco-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-3xl border-b border-choco-100 px-6 py-4 flex items-center justify-between shadow-xs">
          <div>
            <h2 className="font-display text-lg font-bold text-choco-900">Custom Request Full Details</h2>
            <span className={`badge text-xs mt-1 ${STATUS_STYLES[request.status]}`}>{request.status}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-choco-400 hover:text-choco-900 hover:bg-choco-50 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 1. Customer Contact Details Block */}
          <div className="bg-gradient-to-br from-choco-50 to-amber-50/50 rounded-2xl p-5 border border-choco-100/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-choco-200/50 pb-2">
              <h3 className="font-display font-bold text-choco-900 text-base flex items-center gap-2">
                <span>👤</span> Customer Contact Information
              </h3>
              <span className="text-[11px] text-choco-400 font-medium">Submitted {formatDate(request.createdAt)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[11px] font-semibold text-choco-400 uppercase tracking-wider">Full Name</p>
                <p className="font-bold text-choco-900 text-base">{customerName}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-choco-400 uppercase tracking-wider">Email Address</p>
                <a
                  href={`mailto:${customerEmail}`}
                  className="font-medium text-blue-600 hover:underline text-xs break-all block"
                >
                  ✉️ {customerEmail}
                </a>
              </div>

              <div className="sm:col-span-2">
                <p className="text-[11px] font-semibold text-choco-400 uppercase tracking-wider">Phone / Mobile</p>
                <p className="font-bold text-choco-900 text-sm">
                  {customerPhone ? `📞 ${customerPhone}` : 'No phone number provided'}
                </p>
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-choco-200/40">
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=Hi%20${encodeURIComponent(customerName)},%20regarding%20your%20custom%20chocolate%20request%20"${encodeURIComponent(request.title)}"...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-transform hover:scale-105"
                >
                  <span>💬 WhatsApp Customer</span>
                </a>
              )}
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="bg-choco-800 hover:bg-choco-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-transform hover:scale-105"
                >
                  <span>📞 Call Customer</span>
                </a>
              )}
              <a
                href={`mailto:${customerEmail}`}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-transform hover:scale-105"
              >
                <span>✉️ Email Customer</span>
              </a>
            </div>
          </div>

          {/* 2. Full Request Specifications */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-choco-500 uppercase tracking-wider mb-1">Request Title / Message</p>
              <div className="bg-white border border-choco-200 rounded-2xl p-4 shadow-xs">
                <h4 className="font-display font-bold text-choco-900 text-lg">{request.title}</h4>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-choco-500 uppercase tracking-wider mb-1">Full Custom Chocolate Specifications</p>
              <div className="bg-choco-50/70 border border-choco-100 rounded-2xl p-4">
                <p className="text-choco-800 text-sm leading-relaxed whitespace-pre-wrap font-mono text-xs sm:text-sm">
                  {request.description}
                </p>
              </div>
            </div>

            {/* 3. Reference Images */}
            {request.referenceImageUrls?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-choco-500 uppercase tracking-wider mb-2">
                  Reference Images ({request.referenceImageUrls.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {request.referenceImageUrls.map((rawUrl, i) => {
                    const fullUrl = getImageUrl(rawUrl);
                    return (
                      <a
                        key={i}
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative rounded-2xl overflow-hidden border-2 border-choco-200 shadow-sm hover:shadow-md transition-all block aspect-square"
                      >
                        <img
                          src={fullUrl}
                          alt={`Reference ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-choco-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          🔍 View Full Image
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Current Quote Status */}
          {request.quotedPrice && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Current Price Quote</p>
                <p className="font-display text-3xl font-extrabold text-choco-900 mt-1">
                  ₹{request.quotedPrice.toLocaleString('en-IN')}
                </p>
                {request.adminNotes && (
                  <p className="text-xs text-choco-600 mt-1 font-medium">Notes: {request.adminNotes}</p>
                )}
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">
                Quoted {request.quotedAt ? formatDate(request.quotedAt) : ''}
              </span>
            </div>
          )}

          {/* 5. Set Price Quote Form */}
          {!['Converted to Order', 'Cancelled', 'Rejected'].includes(request.status) && (
            <div className="border-t border-choco-100 pt-5 space-y-3">
              <p className="font-bold text-choco-900 text-sm flex items-center gap-2">
                <span>💰</span> Set Price Quote for Customer
              </p>
              <div>
                <label className="label text-xs">Quoted Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-500 font-medium">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="Enter price"
                    className="input-field pl-7"
                    id="quote-price-input"
                  />
                </div>
              </div>
              <div>
                <label className="label text-xs">
                  Admin Notes <span className="text-choco-400 font-normal">(optional, visible to customer)</span>
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="input-field resize-none text-sm"
                  placeholder="e.g. Includes custom message, premium box packaging..."
                />
              </div>
              <button
                onClick={handleSendQuote}
                disabled={sending}
                id="send-quote-btn"
                className="btn-gold w-full py-3 text-sm font-bold shadow-gold"
              >
                {sending ? '⏳ Sending Quote...' : '💰 Send Quote to Customer'}
              </button>
            </div>
          )}

          {/* 6. Override Status */}
          <div className="border-t border-choco-100 pt-4 space-y-2">
            <p className="text-xs font-semibold text-choco-500 uppercase tracking-wider">Override Status</p>
            <div className="flex gap-2">
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
                className="input-field flex-1"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || statusVal === request.status}
                className="btn-secondary px-4 py-2 text-xs font-bold"
              >
                {updating ? '...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main AdminCustomRequests Page ────────────────────────────────────────────
const AdminCustomRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllCustomOrders(filterStatus || undefined);
      setRequests(res.data.requests || []);
    } catch {
      toast.error('Failed to load custom order requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdated = (updated) => {
    setRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  const pendingCount = requests.filter((r) => r.status === 'Pending Review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-choco-900">✏️ Custom Requests</h1>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                {pendingCount} new
              </span>
            )}
          </div>
          <p className="text-choco-500 mt-1 text-sm">Customer chocolate customization requests & contact details</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field max-w-[200px]"
          id="custom-order-status-filter"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ALL_STATUSES.map((s) => {
          const count = requests.filter((r) => r.status === s).length;
          return (
            <div
              key={s}
              className={`rounded-xl px-3 py-2 text-center cursor-pointer transition-all border ${
                filterStatus === s ? 'border-choco-600 shadow' : 'border-transparent'
              } ${STATUS_STYLES[s] || 'bg-gray-50'}`}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            >
              <p className="text-lg font-bold font-display">{count}</p>
              <p className="text-[10px] font-medium leading-tight">{s.split(' ')[0]}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-choco-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-choco-100 p-8">
          <span className="text-6xl block mb-4">✏️</span>
          <h3 className="font-display text-xl font-bold text-choco-900 mb-2">No custom requests found</h3>
          <p className="text-choco-500">Customers haven't submitted any customization requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-choco-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-choco-100 bg-choco-50">
                  <th className="text-left px-5 py-3.5 text-choco-700 font-semibold">Customer & Contact</th>
                  <th className="text-left px-5 py-3.5 text-choco-700 font-semibold">Request Title & Specifications</th>
                  <th className="text-center px-5 py-3.5 text-choco-700 font-semibold hidden md:table-cell">Status</th>
                  <th className="text-right px-5 py-3.5 text-choco-700 font-semibold hidden sm:table-cell">Quoted Price</th>
                  <th className="text-right px-5 py-3.5 text-choco-700 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedRequest(r)}
                    className="border-b border-choco-50 last:border-0 hover:bg-choco-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-choco-900 group-hover:text-choco-700">{r.userId?.name || 'Unknown'}</p>
                      <p className="text-choco-500 text-xs truncate max-w-[180px]">{r.userId?.email}</p>
                      {r.userId?.phone && <p className="text-choco-400 text-[11px]">📞 {r.userId?.phone}</p>}
                    </td>
                    <td className="px-5 py-4 max-w-sm">
                      <p className="font-bold text-choco-900 line-clamp-1">{r.title}</p>
                      <p className="text-choco-600 text-xs line-clamp-2 mt-0.5">{r.description}</p>
                      {r.referenceImageUrls?.length > 0 && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-choco-500 bg-choco-100/70 px-2 py-0.5 rounded-md">
                          📎 {r.referenceImageUrls.length} image{r.referenceImageUrls.length > 1 ? 's' : ''} attached
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <span className={`badge text-xs font-bold ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right hidden sm:table-cell">
                      {r.quotedPrice ? (
                        <span className="font-display font-bold text-choco-900 text-base">
                          ₹{r.quotedPrice.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-choco-300 text-xs font-medium">Not quoted</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(r);
                        }}
                        id={`view-request-${r._id}`}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-transform hover:scale-105 ${
                          r.status === 'Pending Review'
                            ? 'bg-gold-gradient text-choco-900 shadow-xs'
                            : 'bg-choco-100 text-choco-800 hover:bg-choco-200'
                        }`}
                      >
                        {r.status === 'Pending Review' ? '💡 View & Quote' : '🔍 View Details'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedRequest && (
          <DetailPanel
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onUpdated={(updated) => {
              handleUpdated(updated);
              setSelectedRequest(updated);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomRequests;
