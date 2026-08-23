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

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Detail / Quote Panel ─────────────────────────────────────────────────────
const DetailPanel = ({ request, onClose, onUpdated }) => {
  const [quotePrice, setQuotePrice] = useState('');
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [statusVal, setStatusVal] = useState(request.status);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

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
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-white rounded-t-3xl border-b border-choco-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-choco-900">Custom Request Detail</h2>
            <span className={`badge text-xs mt-1 ${STATUS_STYLES[request.status]}`}>{request.status}</span>
          </div>
          <button onClick={onClose} className="p-2 text-choco-400 hover:text-choco-900 hover:bg-choco-50 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer info */}
          <div className="bg-choco-50 rounded-2xl p-4 space-y-1">
            <p className="text-sm font-semibold text-choco-900">👤 {request.userId?.name || 'Unknown'}</p>
            <p className="text-xs text-choco-500">{request.userId?.email}</p>
            <p className="text-xs text-choco-400">Submitted: {formatDate(request.createdAt)}</p>
            {request.quotedAt && <p className="text-xs text-blue-600">Quoted: {formatDate(request.quotedAt)}</p>}
          </div>

          {/* Request details */}
          <div>
            <p className="label">Request Title</p>
            <p className="font-semibold text-choco-900 text-base">{request.title}</p>
          </div>
          <div>
            <p className="label">Description</p>
            <p className="text-choco-700 text-sm leading-relaxed bg-choco-50 rounded-xl p-3 whitespace-pre-wrap">{request.description}</p>
          </div>

          {/* Reference Images */}
          {request.referenceImageUrls?.length > 0 && (
            <div>
              <p className="label">Reference Images ({request.referenceImageUrls.length})</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {request.referenceImageUrls.map((rawUrl, i) => {
                  const fullUrl = getImageUrl(rawUrl);
                  return (
                    <a key={i} href={fullUrl} target="_blank" rel="noopener noreferrer">
                      <img src={fullUrl} alt={`Reference ${i + 1}`} className="w-20 h-20 rounded-xl object-cover border-2 border-choco-100 hover:border-choco-400 transition-colors shadow-sm" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Existing quote if any */}
          {request.quotedPrice && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-medium text-blue-600 mb-1">Current Quote</p>
              <p className="font-display text-2xl font-bold text-choco-900">₹{request.quotedPrice.toLocaleString('en-IN')}</p>
              {request.adminNotes && <p className="text-xs text-choco-500 mt-1">Notes: {request.adminNotes}</p>}
            </div>
          )}

          {/* Quote form */}
          {!['Converted to Order', 'Cancelled', 'Rejected'].includes(request.status) && (
            <div className="border-t border-choco-100 pt-5 space-y-3">
              <p className="font-semibold text-choco-900 text-sm">💰 Send Price Quote</p>
              <div>
                <label className="label text-xs">Quoted Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-500 font-medium">₹</span>
                  <input type="number" min="1" value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="Enter price" className="input-field pl-7" id="quote-price-input" />
                </div>
              </div>
              <div>
                <label className="label text-xs">Admin Notes <span className="text-choco-400 font-normal">(optional, visible to customer)</span></label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2} className="input-field resize-none text-sm" placeholder="e.g. Includes custom message, special packaging..." />
              </div>
              <button onClick={handleSendQuote} disabled={sending} id="send-quote-btn" className="btn-gold w-full py-3">
                {sending ? '⏳ Sending...' : '💰 Send Quote to Customer'}
              </button>
            </div>
          )}

          {/* Status override */}
          <div className="border-t border-choco-100 pt-4 space-y-2">
            <p className="text-xs font-medium text-choco-500">Override Status</p>
            <div className="flex gap-2">
              <select value={statusVal} onChange={(e) => setStatusVal(e.target.value)} className="input-field flex-1">
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleStatusUpdate} disabled={updating || statusVal === request.status} className="btn-secondary px-4 py-2 text-xs">
                {updating ? '...' : 'Update'}
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

  useEffect(() => { fetchRequests(); }, [filterStatus]);

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
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{pendingCount} new</span>
            )}
          </div>
          <p className="text-choco-500 mt-1 text-sm">Customer chocolate customization requests</p>
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field max-w-[200px]" id="custom-order-status-filter">
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ALL_STATUSES.map((s) => {
          const count = requests.filter((r) => r.status === s).length;
          return (
            <div key={s} className={`rounded-xl px-3 py-2 text-center cursor-pointer transition-all border ${filterStatus === s ? 'border-choco-600 shadow' : 'border-transparent'} ${STATUS_STYLES[s] || 'bg-gray-50'}`}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}>
              <p className="text-lg font-bold font-display">{count}</p>
              <p className="text-[10px] font-medium leading-tight">{s.split(' ')[0]}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-choco-100 animate-pulse rounded-2xl" />)}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">✏️</span>
          <h3 className="font-display text-xl font-bold text-choco-900 mb-2">No custom requests yet</h3>
          <p className="text-choco-500">Customers haven't submitted any customization requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-choco-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-choco-100 bg-choco-50">
                  <th className="text-left px-5 py-3 text-choco-700 font-semibold">Customer</th>
                  <th className="text-left px-5 py-3 text-choco-700 font-semibold">Request</th>
                  <th className="text-center px-5 py-3 text-choco-700 font-semibold hidden md:table-cell">Status</th>
                  <th className="text-right px-5 py-3 text-choco-700 font-semibold hidden sm:table-cell">Quote</th>
                  <th className="text-right px-5 py-3 text-choco-700 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-choco-50 last:border-0 hover:bg-choco-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-choco-900">{r.userId?.name || 'Unknown'}</p>
                      <p className="text-choco-400 text-xs">{r.userId?.email}</p>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-medium text-choco-900 line-clamp-1">{r.title}</p>
                      <p className="text-choco-400 text-xs line-clamp-1 mt-0.5">{r.description}</p>
                      {r.referenceImageUrls?.length > 0 && (
                        <span className="text-[10px] text-choco-400">📎 {r.referenceImageUrls.length} image{r.referenceImageUrls.length > 1 ? 's' : ''}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <span className={`badge text-xs ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right hidden sm:table-cell">
                      {r.quotedPrice ? (
                        <span className="font-bold text-choco-900">₹{r.quotedPrice.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-choco-300 text-xs">Not quoted</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelectedRequest(r)} id={`view-request-${r._id}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${r.status === 'Pending Review' ? 'bg-gold-gradient text-choco-900' : 'bg-choco-100 text-choco-700 hover:bg-choco-200'}`}>
                        {r.status === 'Pending Review' ? '💰 Quote' : 'View'}
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
            onUpdated={(updated) => { handleUpdated(updated); setSelectedRequest(updated); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomRequests;
