'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/imageUrl';
import { getMyCustomOrders, respondToQuote, checkoutCustomOrder } from '@/api/customOrders';
import { getMyOrders } from '@/api/orders';

const STATUS_STYLES = {
  'Pending Review': { badge: 'bg-yellow-100 text-yellow-700', icon: '⏳', desc: "We're reviewing your request and will send a quote soon." },
  'Quoted': { badge: 'bg-blue-100 text-blue-700', icon: '💰', desc: "We've prepared a price quote for your request!" },
  'Accepted': { badge: 'bg-emerald-100 text-emerald-700', icon: '✅', desc: "You've accepted the quote. Proceed to checkout to complete your order." },
  'Rejected': { badge: 'bg-red-100 text-red-600', icon: '❌', desc: "You declined this quote." },
  'Converted to Order': { badge: 'bg-purple-100 text-purple-700', icon: '📦', desc: "Your custom order has been placed successfully!" },
  'Cancelled': { badge: 'bg-gray-100 text-gray-500', icon: '🚫', desc: "This request was cancelled." },
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const CheckoutModal = ({ request, onClose, onConverted }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    phone: user?.phone || '',
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedIdx, setSelectedSavedIdx] = useState('0');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const addrs = [];
    if (user?.address?.street) {
      addrs.push({
        label: `📍 Profile Default (${user.address.street}, ${user.address.city || ''})`,
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        pincode: user.address.pincode || '',
        phone: user.phone || '',
      });
    }

    getMyOrders()
      .then((res) => {
        const orders = res.data?.orders || [];
        orders.forEach((o) => {
          if (o.deliveryAddress?.street) {
            const exists = addrs.some(
              (a) => a.street?.toLowerCase() === o.deliveryAddress.street?.toLowerCase()
            );
            if (!exists) {
              addrs.push({
                label: `📦 Order #${o._id.slice(-6)} (${o.deliveryAddress.street}, ${o.deliveryAddress.city || ''})`,
                street: o.deliveryAddress.street || '',
                city: o.deliveryAddress.city || '',
                state: o.deliveryAddress.state || '',
                pincode: o.deliveryAddress.pincode || '',
                phone: o.deliveryAddress.phone || user?.phone || '',
              });
            }
          }
        });
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setAddress({
            street: addrs[0].street,
            city: addrs[0].city,
            state: addrs[0].state,
            pincode: addrs[0].pincode,
            phone: addrs[0].phone,
          });
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSavedAddressSelect = (idxStr) => {
    setSelectedSavedIdx(idxStr);
    if (idxStr === 'new') {
      setAddress({ street: '', city: '', state: '', pincode: '', phone: user?.phone || '' });
    } else {
      const idx = Number(idxStr);
      if (savedAddresses[idx]) {
        const selected = savedAddresses[idx];
        setAddress({
          street: selected.street,
          city: selected.city,
          state: selected.state,
          pincode: selected.pincode,
          phone: selected.phone || user?.phone || '',
        });
      }
    }
  };

  const handleField = (key, val) => setAddress((p) => ({ ...p, [key]: val }));

  const handleCheckout = async () => {
    if (paymentMethod !== 'takeaway') {
      if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
        return toast.error('Please fill in all delivery details');
      }
    }

    setProcessing(true);
    try {
      const finalAddress = paymentMethod === 'takeaway'
        ? {
            street: 'NS Choco Delight Store (Self Pickup)',
            city: 'Store Pickup',
            state: 'Pickup',
            pincode: '500001',
            phone: address.phone || user?.phone || '8185920511',
            isTakeaway: true,
          }
        : address;

      const paymentInfo = {
        status: paymentMethod === 'cod' ? 'cod' : (paymentMethod === 'online' ? 'pending' : 'takeaway'),
        paymentMethod,
        phone: '8185920511',
      };

      const res = await checkoutCustomOrder(request._id, { deliveryAddress: finalAddress, paymentInfo });
      toast.success(paymentMethod === 'takeaway' ? 'Self Pickup Order Created! 🛍️' : 'Order placed! 🍫');
      onConverted(res.data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  const isTakeaway = paymentMethod === 'takeaway';
  const deliveryFee = isTakeaway ? 0 : ((request.quotedPrice || 0) >= 500 ? 0 : 40);
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
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-choco-100 px-6 py-4 flex items-center justify-between z-10 shadow-xs">
          <h2 className="font-display text-xl font-bold text-choco-900">Complete Your Order</h2>
          <button onClick={onClose} className="p-2 text-choco-400 hover:text-choco-900 rounded-xl">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-choco-50 rounded-2xl p-4 space-y-2">
            <p className="font-semibold text-choco-900 text-sm">📦 {request.title}</p>
            <div className="flex justify-between font-bold text-choco-900 border-t border-choco-100 pt-2 mt-2">
              <span>Total</span><span className="text-lg">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={processing}
            id="custom-order-pay-btn"
            className="btn-gold w-full py-4 text-base font-bold shadow-gold"
          >
            {processing ? 'Processing...' : `Place Order — ₹${total.toLocaleString('en-IN')}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function MyCustomOrdersPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutReq, setCheckoutReq] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await getMyCustomOrders();
      setRequests(res.data.requests || []);
    } catch {
      toast.error('Failed to load your custom order requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, action) => {
    try {
      const res = await respondToQuote(id, action);
      toast.success(action === 'accept' ? 'Quote accepted! Proceeding to checkout.' : 'Quote declined.');
      setRequests((prev) => prev.map((r) => (r._id === id ? res.data.request : r)));
      if (action === 'accept') {
        setCheckoutReq(res.data.request);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleConverted = (order) => {
    setCheckoutReq(null);
    router.push(`/orders/${order._id}`);
  };

  return (
    <div className="min-h-screen bg-cream/40 py-12">
      <div className="page-container max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-choco-900">✨ My Custom Requests</h1>
            <p className="text-choco-600 mt-1 text-sm">Track your personalized chocolate design requests</p>
          </div>
          <Link href="/customize" className="btn-gold py-3 px-6 text-sm font-bold shadow-xs">
            + New Request
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-choco-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-choco-100 p-8">
            <span className="text-6xl block mb-4">✨</span>
            <h3 className="font-display text-xl font-bold text-choco-900 mb-2">No custom requests yet</h3>
            <p className="text-choco-600 text-sm mb-6">Create a personalized chocolate design for your special occasion!</p>
            <Link href="/customize" className="btn-gold py-3 px-6 text-sm font-bold">
              Design Custom Chocolate
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => {
              const style = STATUS_STYLES[r.status] || STATUS_STYLES['Pending Review'];

              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-choco-100 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-choco-100 pb-3">
                    <div>
                      <h3 className="font-display font-bold text-choco-900 text-lg">{r.title}</h3>
                      <p className="text-choco-400 text-xs mt-0.5">Submitted: {formatDate(r.createdAt)}</p>
                    </div>
                    <span className={`badge text-xs font-bold px-3 py-1 self-start sm:self-auto ${style.badge}`}>
                      {r.status}
                    </span>
                  </div>

                  <p className="text-choco-700 text-sm leading-relaxed bg-choco-50/60 rounded-2xl p-4 whitespace-pre-wrap">
                    {r.description}
                  </p>

                  {r.quotedPrice && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Quoted Price</p>
                        <p className="font-display text-2xl font-extrabold text-choco-900 mt-0.5">
                          ₹{r.quotedPrice.toLocaleString('en-IN')}
                        </p>
                      </div>
                      {r.status === 'Quoted' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRespond(r._id, 'accept')}
                            className="btn-gold py-2 px-4 text-xs font-bold rounded-xl"
                          >
                            ✅ Accept Quote
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {checkoutReq && (
          <CheckoutModal
            request={checkoutReq}
            onClose={() => setCheckoutReq(null)}
            onConverted={handleConverted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
