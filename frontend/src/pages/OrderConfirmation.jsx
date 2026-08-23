import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrder } from '../api/orders';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 float-animation">🍫</div>
          <p className="text-choco-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-choco-600">Order not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Go Home</Link>
      </div>
    );
  }

  const statusSteps = ['Pending', 'Confirmed', 'Preparing', 'Prepared', 'Out for Delivery', 'Delivered'];
  const currentStep = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="py-10 min-h-screen">
      <div className="page-container max-w-3xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-bold text-choco-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-choco-600 text-lg">Thank you for your order. We'll prepare it with love!</p>
        </motion.div>

        {/* Order ID */}
        <div className="bg-choco-50 rounded-2xl p-5 mb-6 text-center">
          <p className="text-choco-500 text-sm mb-1">Order ID</p>
          <p className="font-mono font-bold text-choco-900 text-lg">{order._id}</p>
          <p className="text-choco-400 text-xs mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </div>

        {/* Status tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6 mb-6">
          <h2 className="font-semibold text-choco-900 mb-5">Order Status</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-choco-100 z-0" />
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center z-10 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i <= currentStep
                    ? 'bg-choco-800 border-choco-800 text-cream'
                    : 'bg-white border-choco-200 text-choco-400'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] mt-2 text-center leading-tight max-w-[50px] ${i <= currentStep ? 'text-choco-800 font-medium' : 'text-choco-400'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6 mb-6">
          <h2 className="font-semibold text-choco-900 mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-choco-50 last:border-0">
                <div>
                  <p className="font-medium text-choco-900 text-sm">{item.name}</p>
                  {item.shape && <p className="text-xs text-choco-400">{item.shape} Shape</p>}
                  <p className="text-xs text-choco-500">× {item.quantity}</p>
                </div>
                <span className="font-semibold text-choco-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-choco-100 pt-4 mt-2 space-y-2">
            <div className="flex justify-between text-sm text-choco-600">
              <span>Items total</span>
              <span>₹{order.itemsTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-choco-600">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? '✓ Free' : `₹${order.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-choco-600 border-t border-choco-100 pt-3 mt-2">
              <span>Payment Mode</span>
              <span className={`font-semibold text-xs px-2.5 py-1 rounded-full ${
                order.paymentInfo?.status === 'cod'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {order.paymentInfo?.status === 'cod' ? '💵 Cash on Delivery' : '💳 Paid Online (Razorpay / UPI)'}
              </span>
            </div>
            <div className="flex justify-between font-bold text-choco-900 text-lg pt-1">
              <span>{order.paymentInfo?.status === 'cod' ? 'Total Payable on Delivery' : 'Total Paid'}</span>
              <span className="font-display">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6 mb-8">
          <h2 className="font-semibold text-choco-900 mb-3">Delivery Address</h2>
          <p className="text-choco-700 text-sm leading-relaxed">
            {order.deliveryAddress.street}, {order.deliveryAddress.city},
            {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
          </p>
          <p className="text-choco-500 text-sm mt-1">📞 {order.deliveryAddress.phone}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders" id="track-order-btn" className="btn-primary text-center">
            Track Order
          </Link>
          <Link to="/products" id="continue-shopping-btn" className="btn-secondary text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
