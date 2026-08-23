import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../api/orders';
import { checkCanReview } from '../api/products';
import ReviewModal from '../components/ReviewModal';

const STATUS_COLORS = {
  Pending: 'badge-pending',
  Confirmed: 'badge-confirmed',
  Preparing: 'badge-preparing',
  Prepared: 'badge-prepared',
  'Out for Delivery': 'badge-delivery',
  Delivered: 'badge-delivered',
  Cancelled: 'badge-cancelled',
};

const statusSteps = ['Pending', 'Confirmed', 'Preparing', 'Prepared', 'Out for Delivery', 'Delivered'];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewedMap, setReviewedMap] = useState({});
  const [reviewingItem, setReviewingItem] = useState(null);

  useEffect(() => {
    getOrder(id)
      .then(async (res) => {
        const fetchedOrder = res.data.order;
        setOrder(fetchedOrder);

        // If order is delivered, check review status for each item
        if (fetchedOrder && fetchedOrder.orderStatus === 'Delivered') {
          const map = {};
          for (const item of fetchedOrder.items) {
            const pId = item.product?._id || item.product;
            if (pId) {
              try {
                const canRes = await checkCanReview(pId);
                if (canRes.data.reason === 'already_reviewed') {
                  map[pId] = true;
                }
              } catch (err) {
                // Ignore silent check errors
              }
            }
          }
          setReviewedMap(map);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl float-animation">🍫</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-choco-600">Order not found.</p>
        <Link to="/orders" className="btn-primary mt-4 inline-flex">Back to Orders</Link>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="py-10 min-h-screen">
      <div className="page-container max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/orders" className="text-choco-600 hover:text-choco-900 transition-colors text-sm">← Back to Orders</Link>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <h1 className="font-display text-3xl font-bold text-choco-900">Order Details</h1>
          <span className={STATUS_COLORS[order.orderStatus] || 'badge bg-gray-100 text-gray-700'}>
            {order.orderStatus}
          </span>
          {order.orderSource === 'whatsapp' ? (
            <span className="badge bg-green-100 text-green-700 font-semibold text-xs px-2.5 py-0.5 rounded-full">
              💬 WhatsApp
            </span>
          ) : (
            <span className="badge bg-blue-100 text-blue-700 font-semibold text-xs px-2.5 py-0.5 rounded-full">
              🌐 Website
            </span>
          )}
        </div>

        {/* Order ID */}
        <div className="bg-choco-50 rounded-xl p-4 mb-6">
          <p className="text-choco-500 text-xs">Order ID</p>
          <p className="font-mono font-bold text-choco-900">{order._id}</p>
          <p className="text-choco-400 text-xs mt-1">
            {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </div>

        {/* Top Review Banner for Delivered Orders */}
        {order.orderStatus === 'Delivered' && (
          <div className="bg-gradient-to-r from-amber-950 via-choco-900 to-amber-900 text-cream rounded-3xl p-6 shadow-xl mb-6 border border-amber-600/40 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-800/60">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🎉</span>
                  <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Order Delivered!</span>
                </div>
                <h2 className="text-xl font-display font-bold text-white">How were your chocolates?</h2>
                <p className="text-xs text-choco-200 mt-0.5">Share your review for your delivered items</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-400/30 shrink-0">
                ✓ Verified Purchase
              </span>
            </div>

            {/* Delivered items review quick list */}
            <div className="pt-4 space-y-3">
              {order.items.map((item, idx) => {
                const productId = item.product?._id || item.product;
                const isReviewed = reviewedMap[productId];

                return (
                  <div key={idx} className="flex items-center justify-between bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-choco-900 shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🍫</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                        <p className="text-[11px] text-choco-200">₹{item.price} × {item.quantity}</p>
                      </div>
                    </div>

                    {isReviewed ? (
                      <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40 shrink-0">
                        ✓ Reviewed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReviewingItem(item)}
                        id={`top-review-btn-${idx}`}
                        className="text-xs font-bold text-choco-950 bg-gold-400 hover:bg-gold-300 px-4 py-2 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>⭐</span> Write Review
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Tracker */}
        {order.orderStatus !== 'Cancelled' && (
          <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6 mb-6">
            <h2 className="font-semibold text-choco-900 mb-5">Tracking</h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-choco-100 z-0" />
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i <= currentStep ? 'bg-choco-800 border-choco-800 text-cream' : 'bg-white border-choco-200 text-choco-400'
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
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6 mb-6">
          <h2 className="font-semibold text-choco-900 mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => {
              const productId = item.product?._id || item.product;
              const isDelivered = order.orderStatus === 'Delivered';
              const isReviewed = reviewedMap[productId];

              return (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-choco-50 last:border-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-choco-50 flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🍫</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-choco-900 text-sm truncate">{item.name}</p>
                    {item.shape && <p className="text-xs text-choco-400">{item.shape} Shape</p>}
                    <p className="text-xs text-choco-500">₹{item.price} × {item.quantity}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-bold text-choco-900 text-sm">₹{item.price * item.quantity}</span>
                    {isDelivered && (
                      isReviewed ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Reviewed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReviewingItem(item)}
                          id={`review-item-btn-${i}`}
                          className="text-[11px] font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-xl border border-amber-400 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>⭐</span> Write Review
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-sm text-choco-600">
              <span>Items total</span><span>₹{order.itemsTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-choco-600">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? '✓ Free' : `₹${order.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-choco-900 text-lg border-t border-choco-100 pt-2">
              <span>Total</span><span className="font-display">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6">
          <h2 className="font-semibold text-choco-900 mb-3">Delivery Address</h2>
          {order.orderSource === 'whatsapp' ? (
            <>
              <p className="text-choco-700 text-sm">
                {order.guestCustomer?.address?.street}, {order.guestCustomer?.address?.city}, {order.guestCustomer?.address?.state} — {order.guestCustomer?.address?.pincode}
              </p>
              <p className="text-choco-500 text-sm mt-1">📞 {order.guestCustomer?.phone}</p>
              {order.notes && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-800">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}
              <p className="text-xs text-choco-400 mt-2 font-medium">Manually entered — no customer account</p>
            </>
          ) : (
            <>
              <p className="text-choco-700 text-sm">
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
              </p>
              <p className="text-choco-500 text-sm mt-1">📞 {order.deliveryAddress?.phone}</p>
            </>
          )}
        </div>
      </div>

      {reviewingItem && (
        <ReviewModal
          productId={reviewingItem.product?._id || reviewingItem.product}
          productName={reviewingItem.name}
          productImage={reviewingItem.image}
          onClose={() => setReviewingItem(null)}
          onSuccess={() => {
            const pId = reviewingItem.product?._id || reviewingItem.product;
            if (pId) {
              setReviewedMap((prev) => ({ ...prev, [pId]: true }));
            }
          }}
        />
      )}
    </div>
  );
};

export default OrderDetails;
