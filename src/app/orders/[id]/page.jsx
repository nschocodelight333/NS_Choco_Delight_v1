'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getOrder } from '@/api/orders';
import { checkCanReview } from '@/api/products';
import ReviewModal from '@/components/ReviewModal';

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

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewedMap, setReviewedMap] = useState({});
  const [reviewingItem, setReviewingItem] = useState(null);

  useEffect(() => {
    if (!id) return;
    getOrder(id)
      .then(async (res) => {
        const fetchedOrder = res.data.order;
        setOrder(fetchedOrder);

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
              } catch (err) {}
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
        <Link href="/orders" className="btn-primary mt-4 inline-flex">Back to Orders</Link>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="py-10 min-h-screen">
      <div className="page-container max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/orders" className="text-choco-600 hover:text-choco-900 transition-colors text-sm">← Back to Orders</Link>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <h1 className="font-display text-3xl font-bold text-choco-900">Order Details</h1>
          <span className={STATUS_COLORS[order.orderStatus] || 'badge bg-gray-100 text-gray-700'}>
            {order.orderStatus}
          </span>
        </div>

        <div className="bg-choco-50 rounded-xl p-4 mb-6">
          <p className="text-choco-500 text-xs">Order ID</p>
          <p className="font-mono font-bold text-choco-900">{order._id}</p>
          <p className="text-choco-400 text-xs mt-1">
            {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </div>

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

        <div className="bg-white rounded-2xl shadow-sm border border-choco-100 p-6 mb-6">
          <h2 className="font-semibold text-choco-900 mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items?.map((item, i) => {
              const productId = item.product?._id || item.product;
              const isDelivered = order.orderStatus === 'Delivered';
              const isReviewed = reviewedMap[productId];

              return (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-choco-50 last:border-0">
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
                          className="text-[11px] font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-xl border border-amber-400 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          ⭐ Write Review
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-4 space-y-2">
            <div className="flex justify-between font-bold text-choco-900 text-lg border-t border-choco-100 pt-2">
              <span>Total</span><span className="font-display">₹{order.totalAmount}</span>
            </div>
          </div>
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
}
