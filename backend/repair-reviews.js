require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Review = require('./models/Review');
const Order = require('./models/Order');

const connectDB = require('./config/db');

const repairReviewsAndRatings = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB for review repair');

    const reviews = await Review.find({});
    console.log(`🔍 Found ${reviews.length} existing reviews.`);

    for (const rev of reviews) {
      if (!rev.product && rev.order) {
        const order = await Order.findById(rev.order);
        if (order && order.items && order.items.length > 0) {
          rev.product = order.items[0].product?._id || order.items[0].product;
          await rev.save();
          console.log(`🛠️ Backfilled product ID ${rev.product} for review ${rev._id}`);
        }
      }
    }

    const products = await Product.find({});
    console.log(`📊 Recalculating ratings for ${products.length} products...`);

    for (const prod of products) {
      await Review.calcAverageRating(prod._id);
    }

    console.log('🎉 Review repair & rating recalculation complete!');
  } catch (err) {
    console.error('❌ Error during review repair script:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

repairReviewsAndRatings();
