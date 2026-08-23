const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The specific order that qualifies this review
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    // Set to true by backend when purchase+delivery is verified
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// A user can only review a product once
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to recalculate average rating on Product
reviewSchema.statics.calcAverageRating = async function (productId) {
  if (!productId) return;
  const prodId = typeof productId === 'string' ? new mongoose.Types.ObjectId(productId) : productId;

  const stats = await this.aggregate([
    { $match: { product: prodId } },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Product = mongoose.model('Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: 0,
      numReviews: 0,
    });
  }
};

// Recalculate after save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

// Recalculate after document delete
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.calcAverageRating(this.product);
});

// Recalculate after query delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.product);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
