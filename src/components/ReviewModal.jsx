'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { createReview } from '@/api/products';
import StarRating from './StarRating';

const ReviewModal = ({ productId, productName, productImage, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createReview(productId, { rating, comment });
      toast.success('Review submitted! Thank you 🍫');
      if (onSuccess) onSuccess(res.data.review);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div className="absolute inset-0 bg-choco-900/60 backdrop-blur-xs" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 z-10"
      >
        <div className="flex items-center justify-between pb-4 border-b border-choco-100 mb-4">
          <h2 className="font-display font-bold text-xl text-choco-900">Write a Review</h2>
          <button onClick={onClose} className="p-1 text-choco-400 hover:text-choco-900 rounded-lg">
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-choco-50 rounded-2xl mb-5">
          {productImage ? (
            <img src={productImage} alt={productName} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-choco-100 flex items-center justify-center text-xl">🍫</div>
          )}
          <div>
            <p className="font-semibold text-choco-900 text-sm leading-tight">{productName}</p>
            <p className="text-[11px] text-emerald-700 font-medium">✓ Verified Delivered Purchase</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label text-xs">Rating *</label>
            <StarRating rating={rating} interactive onRate={setRating} size="lg" />
          </div>

          <div>
            <label className="label text-xs" htmlFor="modal-review-comment">Your Feedback (Optional)</label>
            <textarea
              id="modal-review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love about this chocolate?"
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              id="submit-modal-review-btn"
              className="btn-gold flex-1 py-3 text-xs font-bold"
            >
              {submitting ? 'Submitting...' : 'Submit Review ⭐'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReviewModal;
