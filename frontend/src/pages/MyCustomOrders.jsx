import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUrl';
import { getMyCustomOrders, respondToQuote, checkoutCustomOrder } from '../api/customOrders';

const STATUS_STYLES = {
  'Pending Review': { badge: 'bg-yellow-100 text-yellow-700', icon: '⏳', desc: "We're reviewing your request and will send a quote soon." },
  'Quoted': { badge: 'bg-blue-100 text-blue-700', icon: '💰', desc: "We've prepared a price quote for your request!" },
  'Accepted': { badge: 'bg-emerald-100 text-emerald-700', icon: '✅', desc: "You've accepted the quote. Proceed to checkout to complete your order." },
  'Rejected': { badge: 'bg-red-100 text-red-600', icon: '❌', desc: "You declined this quote." },
  'Converted to Order': { badge: 'bg-purple-100 text-purple-700', icon: '📦', desc: "Your custom order has been placed successfully!" },
  'Cancelled': { badge: 'bg-gray-100 text-gray-500', icon: '🚫', desc: "This request was cancelled." },
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// ─── Checkout Modal ───────────────────────────────────────────────────────────
const CheckoutModal = ({ request, onClose, onConverted }) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });
  const [processing, setProcessing] = useState(false);

  const handleField = (key, val) => setAddress((p) => ({ ...p, [key]: val }));

  const handleCheckout = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
      return toast.error('Please fill in all delivery details');
    }

    setProcessing(true);
    try {
      const paymentInfo = { status: paymentMethod === 'cod' ? 'cod' : 'pending' };
      const res = await checkoutCustomOrder(request._id, { deliveryAddress: address, paymentInfo });
      toast.success('Order placed! 🍫');
      onConverted(res.data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  const deliveryFee = (request.quotedPrice || 0) >= 500 ? 0 : 40;
  const total = (request.quotedPrice || 0) + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div className="absolute inset-0 bg-choco-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-choco-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-choco-900">Complete Your Order</h2>
          <button onClick={onClose} className="p-2 text-choco-400 hover:text-choco-900 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Order summary */}
          <div className="bg-choco-50 rounded-2xl p-4 space-y-2">
            <p className="font-semibold text-choco-900 text-sm">📦 {request.title}</p>
            <div className="flex justify-between text-sm text-choco-600">
              <span>Custom Chocolate</span><span>₹{request.quotedPrice?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-choco-600">
              <span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-choco-900 border-t border-choco-100 pt-2 mt-2">
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="label">Payment Method</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'cod', icon: '💵', label: 'Cash on Delivery' },
                { value: 'upi', icon: '📱', label: 'PhonePe / Paytm / GPay' },
              ].map((m) => (
                <button key={m.value} type="button" onClick={() => setPaymentMethod(m.value)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all ${paymentMethod === m.value ? 'border-choco-800 bg-choco-50' : 'border-choco-100 hover:border-choco-300'}`}>
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-xs font-medium text-choco-700">{m.label}</span>
                </button>
              ))}
            </div>
            {paymentMethod === 'upi' && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <p className="text-xs font-semibold text-choco-900">PhonePe / Paytm / GPay Number</p>
                <p className="font-mono font-bold text-amber-950 text-base my-0.5 tracking-wider">8185920511</p>
                <p className="text-[11px] text-choco-500">
                  Pay via PhonePe, Paytm, Google Pay, or Razorpay Gateway
                </p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-3">
            <p className="label">Delivery Address</p>
            {[
              { key: 'street', placeholder: 'Street / House No.', label: 'Street *' },
              { key: 'city', placeholder: 'City', label: 'City *' },
              { key: 'state', placeholder: 'State', label: 'State *' },
              { key: 'pincode', placeholder: 'Pincode', label: 'Pincode *' },
              { key: 'phone', placeholder: '10-digit mobile number', label: 'Phone *' },
            ].map(({ key, placeholder, label }) => (
              <div key={key}>
                <label className="text-xs text-choco-500 font-medium">{label}</label>
                <input
                  className="input-field mt-0.5"
                  placeholder={placeholder}
                  value={address[key]}
                  onChange={(e) => handleField(key, e.target.value)}
                  id={`checkout-${key}`}
                />
              </div>
            ))}
          </div>

          <button onClick={handleCheckout} disabled={processing} id="custom-order-pay-btn"
            className="btn-gold w-full py-4">
            {processing ? '⏳ Processing...' : `✅ Place Order — ₹${total.toLocaleString('en-IN')}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main MyCustomOrders Page ─────────────────────────────────────────────────
const MyCustomOrders = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutRequest, setCheckoutRequest] = useState(null);
  const [responding, setResponding] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyCustomOrders()
      .then((res) => setRequests(res.data.requests || []))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  const handleDecline = async (id) => {
    if (!window.confirm('Decline this quote?')) return;
    setResponding(id);
    try {
      const res = await respondToQuote(id, 'reject');
      setRequests((p) => p.map((r) => (r._id === id ? res.data.request : r)));
      toast.success('Quote declined');
    } catch { toast.error('Failed to decline quote'); }
    finally { setResponding(null); }
  };

  const handleAccept = async (id) => {
    setResponding(id);
    try {
      const res = await respondToQuote(id, 'accept');
      setRequests((p) => p.map((r) => (r._id === id ? res.data.request : r)));
      // Open checkout modal
      setCheckoutRequest(res.data.request);
    } catch { toast.error('Failed to accept quote'); }
    finally { setResponding(null); }
  };

  const handleConverted = (order) => {
    setRequests((p) =>
      p.map((r) => (r._id === checkoutRequest?._id ? { ...r, status: 'Converted to Order' } : r))
    );
    setCheckoutRequest(null);
    if (order.paymentInfo?.status === 'pending' || order.paymentInfo?.status !== 'cod') {
      navigate(`/online-payment/${order._id}`, { replace: true });
    } else {
      navigate(`/orders`, { replace: true });
    }
  };

  return (
    <div className="py-12 bg-cream min-h-screen">
      <div className="page-container max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-choco-900">My Custom Requests</h1>
            <p className="text-choco-500 mt-1 text-sm">Track your personalized chocolate requests</p>
          </div>
          <Link to="/customize" className="btn-primary text-sm">
            ➕ New Request
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-choco-100 animate-pulse rounded-2xl" />)}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <span className="text-6xl block mb-4">✏️</span>
            <h3 className="font-display text-xl font-bold text-choco-900 mb-2">No requests yet</h3>
            <p className="text-choco-500 mb-6">Submit your first custom chocolate request!</p>
            <Link to="/customize" className="btn-primary">Create Custom Order</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r, i) => {
              const style = STATUS_STYLES[r.status] || STATUS_STYLES['Pending Review'];
              return (
                <motion.div key={r._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-choco-100 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{style.icon}</span>
                        <h3 className="font-display font-bold text-choco-900 text-lg leading-tight">{r.title}</h3>
                        <span className={`badge text-xs ${style.badge}`}>{r.status}</span>
                      </div>
                      <p className="text-choco-500 text-sm mt-2 line-clamp-2">{r.description}</p>
                      <p className="text-choco-400 text-xs mt-1">Submitted: {formatDate(r.createdAt)}</p>
                    </div>
                    {r.referenceImageUrls?.length > 0 && (
                      <div className="flex flex-wrap gap-1 flex-shrink-0">
                        {r.referenceImageUrls.map((url, imgIdx) => (
                          <a key={imgIdx} href={getImageUrl(url)} target="_blank" rel="noopener noreferrer">
                            <img src={getImageUrl(url)} alt={`Reference ${imgIdx + 1}`} className="w-16 h-16 rounded-xl object-cover border border-choco-100 shadow-sm" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status message */}
                  <p className="text-sm text-choco-500 italic">{style.desc}</p>

                  {/* Quoted price + actions */}
                  {r.status === 'Quoted' && r.quotedPrice && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="text-xs font-medium text-blue-600">Your Quote</p>
                          <p className="font-display text-2xl font-bold text-choco-900">₹{r.quotedPrice.toLocaleString('en-IN')}</p>
                          {r.adminNotes && <p className="text-xs text-choco-500 mt-1">Note: {r.adminNotes}</p>}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(r._id)}
                          disabled={responding === r._id}
                          id={`accept-quote-${r._id}`}
                          className="btn-gold flex-1 py-2.5"
                        >
                          {responding === r._id ? '⏳' : '✅ Accept & Pay'}
                        </button>
                        <button
                          onClick={() => handleDecline(r._id)}
                          disabled={responding === r._id}
                          id={`decline-quote-${r._id}`}
                          className="btn-secondary px-6 py-2.5"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {r.status === 'Accepted' && (
                    <button onClick={() => setCheckoutRequest(r)} className="btn-gold w-full py-3">
                      🛒 Proceed to Checkout — ₹{r.quotedPrice?.toLocaleString('en-IN')}
                    </button>
                  )}

                  {r.status === 'Converted to Order' && r.convertedOrderId && (
                    <Link to={`/orders/${typeof r.convertedOrderId === 'object' ? r.convertedOrderId._id : r.convertedOrderId}`} className="btn-secondary w-full py-3 text-center block">
                      📦 View Order
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {checkoutRequest && (
          <CheckoutModal
            request={checkoutRequest}
            onClose={() => setCheckoutRequest(null)}
            onConverted={handleConverted}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyCustomOrders;
