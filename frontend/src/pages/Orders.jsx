import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrders } from '../api/orders';
import { OrderRowSkeleton } from '../components/SkeletonLoader';

const STATUS_COLORS = {
  Pending: 'badge-pending',
  Confirmed: 'badge-confirmed',
  Preparing: 'badge-preparing',
  Prepared: 'badge-prepared',
  'Out for Delivery': 'badge-delivery',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-10 min-h-screen">
      <div className="page-container">
        <h1 className="section-title mb-2">My Orders</h1>
        <p className="section-subtitle mb-8">Track and manage your chocolate orders</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <OrderRowSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <span className="text-7xl block mb-5 float-animation">📦</span>
            <h2 className="font-display text-3xl font-bold text-choco-900 mb-3">No orders yet</h2>
            <p className="text-choco-500 mb-8">Your chocolate journey starts with your first order!</p>
            <Link to="/products" id="orders-shop-btn" className="btn-primary text-base px-8 py-4">
              Shop Now 🍫
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl shadow-sm border border-choco-100 p-5 hover:shadow-choco transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={STATUS_COLORS[order.orderStatus] || 'badge bg-gray-100 text-gray-700'}>
                        {order.orderStatus}
                      </span>
                      {order.paymentInfo?.status === 'paid' && (
                        <span className="badge bg-green-100 text-green-700">✓ Paid</span>
                      )}
                    </div>
                    <p className="text-xs text-choco-400 font-mono mb-1">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-choco-700 text-sm">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} —{' '}
                      <span className="font-semibold text-choco-900">₹{order.totalAmount}</span>
                    </p>
                    <p className="text-choco-400 text-xs mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {order.items.slice(0, 3).map((item, j) => (
                        <div key={j} className="w-12 h-12 rounded-xl overflow-hidden bg-choco-50 border border-choco-100">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🍫</div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-xl bg-choco-100 border border-choco-100 flex items-center justify-center text-choco-600 text-xs font-bold">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/orders/${order._id}`}
                      id={`view-order-${order._id}`}
                      className={
                        order.orderStatus === 'Delivered'
                          ? 'ml-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold py-2 px-3.5 rounded-xl border border-amber-300 text-xs whitespace-nowrap transition-colors shadow-2xs flex items-center gap-1'
                          : 'ml-2 btn-secondary py-2 px-4 text-xs whitespace-nowrap'
                      }
                    >
                      {order.orderStatus === 'Delivered' ? '⭐ Review Items →' : 'View Details →'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
