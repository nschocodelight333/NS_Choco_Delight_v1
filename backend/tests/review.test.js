const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');

jest.setTimeout(20000);

describe('Review - Product Link & Rating Recalculation Safeguard', () => {
  let testProduct;
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      name: 'Review Tester',
      email: `review_tester_${Date.now()}@example.com`,
      password: 'Password123!',
    });
    testProduct = await Product.create({
      name: 'Rating Test Chocolate',
      description: 'Product for testing average rating static calculation',
      category: 'Bites',
      price: 99,
      stock: 50,
    });
  }, 20000);

  afterAll(async () => {
    if (testProduct) await Product.findByIdAndDelete(testProduct._id);
    if (testUser) await User.findByIdAndDelete(testUser._id);
    await Review.deleteMany({ product: testProduct?._id });
    await mongoose.connection.close();
  }, 20000);

  test('Review.calcAverageRating updates ratingAverage and numReviews on Product', async () => {
    await Review.create({
      user: testUser._id,
      product: testProduct._id,
      rating: 5,
      comment: 'Absolutely delicious test chocolate!',
    });

    await Review.create({
      user: testUser._id,
      product: testProduct._id,
      rating: 4,
      comment: 'Very good flavor!',
    });

    await Review.calcAverageRating(testProduct._id);

    const updatedProd = await Product.findById(testProduct._id);
    expect(updatedProd.numReviews).toBe(2);
    expect(updatedProd.ratingAverage).toBe(4.5);
  });
});
