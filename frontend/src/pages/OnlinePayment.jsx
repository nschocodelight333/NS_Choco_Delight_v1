import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getOrder, confirmOrderPayment } from '../api/orders';

const PAYMENT_PLATFORMS = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '/payments/phonepe.png',
    color: 'from-purple-600 to-indigo-700',
    borderColor: 'border-purple-200 hover:border-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-900',
    vpa: '8185920511@ybl',
    upiScheme: (amount, orderId) =>
      `upi://pay?pa=8185920511@ybl&pn=NS%20Choco%20Delight&am=${amount}&cu=INR&tn=Order%20${orderId}`,
    badge: 'Popular',
  },
  {
    id: 'gpay',
    name: 'Google Pay (GPay)',
    icon: '/payments/gpay.png',
    color: 'from-blue-600 to-cyan-600',
    borderColor: 'border-blue-200 hover:border-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    vpa: '8185920511@okbizaxis',
    upiScheme: (amount, orderId) =>
      `upi://pay?pa=8185920511@okbizaxis&pn=NS%20Choco%20Delight&am=${amount}&cu=INR&tn=Order%20${orderId}`,
    badge: 'Instant',
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    icon: '/payments/paytm.png',
    color: 'from-sky-500 to-blue-700',
    borderColor: 'border-sky-200 hover:border-sky-500',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-900',
    vpa: '8185920511@paytm',
    upiScheme: (amount, orderId) =>
      `upi://pay?pa=8185920511@paytm&pn=NS%20Choco%20Delight&am=${amount}&cu=INR&tn=Order%20${orderId}`,
    badge: 'Fast',
  },
  {
    id: 'navi',
    name: 'Navi Pay / BHIM',
    icon: '/payments/navi.png',
    color: 'from-emerald-600 to-teal-700',
    borderColor: 'border-emerald-200 hover:border-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-900',
    vpa: '8185920511@ybl',
    upiScheme: (amount, orderId) =>
      `upi://pay?pa=8185920511@ybl&pn=NS%20Choco%20Delight&am=${amount}&cu=INR&tn=Order%20${orderId}`,
    badge: 'Direct',
  },
];

const STORE_NUMBER = '8185920511';

const OnlinePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('phonepe');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getOrder(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => toast.error('Failed to load order details'))
      .finally(() => setLoading(false));
  }, [id]);

  const copyNumber = () => {
    navigator.clipboard.writeText(STORE_NUMBER);
    setCopied(true);
    toast.success('Mobile number 8185920511 copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLaunchPayment = (platform) => {
    setSelectedPlatform(platform.id);
    const amount = order?.totalAmount || 0;
    const upiUrl = platform.upiScheme(amount, order?._id || '');

    toast.success(`Opening ${platform.name}...`);

    // Attempt to open deep link app
    window.location.href = upiUrl;
  };

  const handleWhatsAppChat = () => {
    const amount = order?.totalAmount || 0;
    const orderId = order?._id || '';

    let textMessage = '';
    if (order?.orderStatus === 'Delivered') {
      textMessage = `Hi NS Choco Delight! 🍫\nMy Order #${orderId} (₹${amount}) has been delivered! Thank you for the delicious chocolates! 🎉`;
    } else if (order?.paymentInfo?.status === 'paid') {
      textMessage = `Hi NS Choco Delight! 🍫\nI have completed payment of ₹${amount} for Order #${orderId}. Please update me on the delivery status! 📦`;
    } else {
      textMessage = `Hi NS Choco Delight! 🍫\nI am making payment of ₹${amount} for Order #${orderId}.\nPhonePe / Paytm / GPay number: 8185920511.\nPlease confirm my order!`;
    }

    const msg = encodeURIComponent(textMessage);
    window.open(`https://wa.me/918185920511?text=${msg}`, '_blank');
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await confirmOrderPayment(id, {
        paymentMethod: selectedPlatform,
        transactionId: transactionId.trim(),
      });
      toast.success('Payment details recorded! Order confirmed 🎉');
      navigate(`/order-confirmation/${id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment status. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center min-h-screen flex items-center justify-center">
        <div>
          <span className="text-5xl block animate-bounce mb-4">💳</span>
          <p className="text-choco-600 font-medium">Loading Online Payment options...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center min-h-screen">
        <p className="text-choco-600 text-lg mb-4">Order not found.</p>
        <Link to="/orders" className="btn-primary">View My Orders</Link>
      </div>
    );
  }

  const amount = order.totalAmount;
  const qrUpiData = encodeURIComponent(`upi://pay?pa=8185920511@ybl&pn=NS%20Choco%20Delight&am=${amount}&cu=INR&tn=Order%20${order._id}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrUpiData}&color=3E2723&bgcolor=FFF8F0`;

  return (
    <div className="py-10 min-h-screen bg-cream">
      <div className="page-container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300">
            Official Store Payment Gateway
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-choco-900 mt-3 mb-2">
            Complete Online Payment
          </h1>
          <p className="text-choco-600 text-sm">
            Pay directly using PhonePe, Google Pay, Paytm, or Navi Pay
          </p>
        </div>

        {/* Delivered Order Banner */}
        {order.orderStatus === 'Delivered' && (
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 shadow-lg mb-8 border border-emerald-500/40 text-center">
            <span className="text-4xl block mb-2">🎉</span>
            <h2 className="font-display font-bold text-2xl mb-1">Order Delivered!</h2>
            <p className="text-emerald-100 text-xs mb-4">
              This order has already been successfully delivered. No payment required!
            </p>
            <Link to={`/orders/${order._id}`} className="btn-gold text-xs py-2.5 px-6 font-bold inline-flex items-center gap-1.5">
              <span>⭐</span> Review Delivered Items
            </Link>
          </div>
        )}

        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-md border border-choco-100 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-choco-100">
            <div>
              <p className="text-xs text-choco-500 font-medium">Order Number</p>
              <p className="font-mono font-bold text-choco-900 text-base">{order._id}</p>
            </div>
            <div className="sm:text-right bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
              <p className="text-xs text-choco-600 font-medium">Total Amount Payable</p>
              <p className="font-display font-extrabold text-2xl text-choco-900">₹{amount}</p>
            </div>
          </div>

          <div className="pt-4 text-xs text-choco-600 space-y-1">
            <p><strong className="text-choco-800">Delivery Address:</strong> {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}</p>
            <p><strong className="text-choco-800">Phone:</strong> {order.deliveryAddress?.phone}</p>
          </div>
        </motion.div>

        {/* Official Payment Number Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-900 to-choco-900 text-cream rounded-3xl p-6 shadow-xl mb-8 border border-amber-600/40 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 text-9xl pointer-events-none">
            📱
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-gold-300 font-bold uppercase tracking-wider">Store Payment Number</span>
              </div>
              <h2 className="text-sm text-choco-200 font-medium mb-1">PhonePe / Paytm / GPay / Navi Pay Number:</h2>
              <div className="flex items-center gap-3">
                <span className="font-mono text-3xl font-extrabold text-gold-400 tracking-wider">
                  {STORE_NUMBER}
                </span>
                <button
                  type="button"
                  onClick={copyNumber}
                  id="copy-payment-number-btn"
                  className="px-3 py-1.5 bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  {copied ? '✓ Copied' : '📋 Copy Number'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppChat}
              id="payment-whatsapp-chat-btn"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 shrink-0"
            >
              <span>💬</span> Chat on WhatsApp
            </button>
          </div>
        </motion.div>

        {/* Payment Platform Selection */}
        <div className="mb-8">
          <h3 className="font-display font-bold text-choco-900 text-xl mb-4 flex items-center gap-2">
            <span>👇</span> Choose Payment Method to Pay ₹{amount}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PAYMENT_PLATFORMS.map((platform) => (
              <motion.div
                key={platform.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLaunchPayment(platform)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all bg-white shadow-sm flex items-center justify-between ${
                  selectedPlatform === platform.id ? 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/30' : platform.borderColor
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center p-1.5 bg-white border border-choco-100 shadow-sm shrink-0">
                    <img src={platform.icon} alt={platform.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-choco-900 text-base">{platform.name}</h4>
                      <span className="text-[10px] font-semibold bg-choco-100 text-choco-800 px-2 py-0.5 rounded-full">
                        {platform.badge}
                      </span>
                    </div>
                    <p className="text-xs text-choco-500 font-mono mt-0.5">{platform.vpa}</p>
                  </div>
                </div>
                <div className="text-amber-700 text-sm font-bold flex items-center gap-1">
                  <span>Pay</span>
                  <span>➔</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* UPI QR Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-md border border-choco-100 mb-8 text-center"
        >
          <h3 className="font-display text-lg font-bold text-choco-900 mb-2">
            📷 Scan & Pay with Any UPI App
          </h3>
          <p className="text-choco-500 text-xs mb-4">
            Open PhonePe, GPay, Paytm, Navi, or BHIM on your mobile device and scan this QR code
          </p>

          <div className="inline-block p-4 bg-choco-50 rounded-2xl border border-choco-200 shadow-inner mb-4">
            <img
              src={qrUrl}
              alt="UPI Payment QR Code"
              className="w-48 h-48 mx-auto rounded-lg shadow-sm"
            />
          </div>

          <div className="flex justify-center gap-3 flex-wrap text-xs font-semibold text-choco-700 items-center">
            <span className="flex items-center gap-1.5 bg-purple-50 text-purple-900 px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
              <img src="/payments/phonepe.png" alt="PhonePe" className="w-4 h-4 object-contain" /> PhonePe
            </span>
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
              <img src="/payments/gpay.png" alt="GPay" className="w-4 h-4 object-contain" /> Google Pay
            </span>
            <span className="flex items-center gap-1.5 bg-sky-50 text-sky-900 px-3 py-1.5 rounded-xl border border-sky-200 shadow-2xs">
              <img src="/payments/paytm.png" alt="Paytm" className="w-4 h-4 object-contain" /> Paytm
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              <img src="/payments/navi.png" alt="Navi" className="w-4 h-4 object-contain" /> Navi Pay
            </span>
          </div>
        </motion.div>

        {/* Confirmation Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-md border border-choco-100"
        >
          <h3 className="font-display text-xl font-bold text-choco-900 mb-2">
            ✅ Confirm Payment
          </h3>
          <p className="text-choco-600 text-xs mb-5">
            Once you have transferred ₹{amount} via PhonePe / GPay / Paytm / Navi Pay to <strong>{STORE_NUMBER}</strong>, click below to complete your order!
          </p>

          <form onSubmit={handleConfirmPayment} className="space-y-4">
            <div>
              <label htmlFor="transaction-utr" className="label text-xs">
                Transaction Ref / UTR No. (Optional)
              </label>
              <input
                id="transaction-utr"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 423984920192 or UTR number"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              id="confirm-online-payment-btn"
              className="btn-gold w-full py-4 text-base font-bold shadow-lg"
            >
              {submitting ? '⏳ Verifying Payment...' : '✅ I Have Completed Payment'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default OnlinePayment;
