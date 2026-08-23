const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const CustomOrderRequest = require('../models/CustomOrderRequest');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    totalRevenue,
    pendingOrders,
    totalCustomers,
    lowStockProducts,
    recentOrders,
    ordersByStatus,
    websiteOrdersThisMonth,
    whatsappOrdersThisMonth,
    totalCustomRequests,
    pendingCustomRequests,
    recentCustomRequests,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({ orderStatus: 'Pending' }),
    User.countDocuments({ role: 'customer' }),
    Product.find({ stock: { $lte: 5 } }).select('name stock category').limit(10),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email'),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
    Order.countDocuments({ orderSource: 'website', createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ orderSource: 'whatsapp', createdAt: { $gte: startOfMonth } }),
    CustomOrderRequest.countDocuments(),
    CustomOrderRequest.countDocuments({ status: 'Pending Review' }),
    CustomOrderRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email'),
  ]);

  // Combine standard orders & custom requests into unified feed
  const normalizedOrders = recentOrders.map((o) => ({
    _id: o._id,
    orderSource: o.orderSource || 'website',
    customerName: o.orderSource === 'whatsapp' ? (o.guestCustomer?.name || 'Guest') : (o.user?.name || 'Customer'),
    orderStatus: o.orderStatus,
    totalAmount: o.totalAmount,
    createdAt: o.createdAt,
    type: o.orderSource === 'whatsapp' ? 'whatsapp' : 'website',
  }));

  const normalizedCustom = recentCustomRequests.map((c) => ({
    _id: c._id,
    orderSource: 'custom',
    customerName: c.userId?.name || 'Customer',
    orderStatus: c.status,
    totalAmount: c.quotedPrice || 0,
    createdAt: c.createdAt,
    type: 'custom',
    title: c.title,
  }));

  const combinedRecent = [...normalizedOrders, ...normalizedCustom]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  // Ensure all standard order statuses are represented
  const allStatuses = ['Pending', 'Confirmed', 'Preparing', 'Prepared', 'Out for Delivery', 'Delivered', 'Cancelled'];
  const statusCountsMap = {};
  ordersByStatus.forEach((item) => {
    if (item._id) statusCountsMap[item._id] = item.count;
  });
  const fullOrdersByStatus = allStatuses.map((status) => ({
    _id: status,
    count: statusCountsMap[status] || 0,
  }));

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      totalCustomers,
      lowStockProducts,
      recentOrders: combinedRecent,
      ordersByStatus: fullOrdersByStatus,
      websiteOrdersThisMonth,
      whatsappOrdersThisMonth,
      totalCustomRequests,
      pendingCustomRequests,
    },
  });
};

// @desc    Get all customers (view only)
// @route   GET /api/admin/customers
// @access  Admin
const getCustomers = async (req, res) => {
  const customers = await User.find({ role: 'customer' })
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({ success: true, customers });
};

// @desc    Get detailed stock-market style analytics (time-series buckets + period totals + % changes)
// @route   GET /api/admin/dashboard/stats
// @access  Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();

    const getStartOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const getEndOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    // Today & Yesterday & Day Before Yesterday
    const startOfToday = getStartOfDay(now);
    const endOfToday = getEndOfDay(now);

    const startOfYesterday = getStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    const endOfYesterday = getEndOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

    const startOfPrevDay = getStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2));
    const endOfPrevDay = getEndOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2));

    // This Week & Previous Week (Mon - Sun)
    const dayOfWeek = now.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = getStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon));
    const endOfWeek = getEndOfDay(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6));

    const startOfPrevWeek = getStartOfDay(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() - 7));
    const endOfPrevWeek = getEndOfDay(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() - 1));

    // This Month & Previous Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // This Year & Previous Year
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const startOfPrevYear = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
    const endOfPrevYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

    // Fetch valid orders from startOfPrevYear to endOfToday (or endOfYear)
    const orders = await Order.find({
      orderStatus: { $ne: 'Cancelled' },
      'paymentInfo.status': { $ne: 'failed' },
      createdAt: { $gte: startOfPrevYear, $lte: endOfYear },
    }).select('totalAmount paymentInfo createdAt orderStatus');

    // Helper to calculate period metrics
    const processPeriod = (start, end, prevStart, prevEnd, bucketType) => {
      let buckets = [];

      if (bucketType === 'hourly') {
        // 24 hours (00:00 to 23:00)
        for (let h = 0; h < 24; h++) {
          const label = `${h.toString().padStart(2, '0')}:00`;
          buckets.push({ time: label, hour: h, totalRevenue: 0, upiRevenue: 0, codRevenue: 0, orders: 0 });
        }
      } else if (bucketType === 'dailyWeek') {
        // Mon-Sun
        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        for (let i = 0; i < 7; i++) {
          buckets.push({ time: dayLabels[i], dayIndex: i, totalRevenue: 0, upiRevenue: 0, codRevenue: 0, orders: 0 });
        }
      } else if (bucketType === 'dailyMonth') {
        // Days of current month (e.g. 1..31)
        const daysCount = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
        const monthShort = start.toLocaleString('en-US', { month: 'short' });
        for (let d = 1; d <= daysCount; d++) {
          buckets.push({ time: `${monthShort} ${d}`, day: d, totalRevenue: 0, upiRevenue: 0, codRevenue: 0, orders: 0 });
        }
      } else if (bucketType === 'monthly') {
        // 12 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let m = 0; m < 12; m++) {
          buckets.push({ time: monthNames[m], month: m, totalRevenue: 0, upiRevenue: 0, codRevenue: 0, orders: 0 });
        }
      }

      let totalRevenue = 0;
      let upiRevenue = 0;
      let codRevenue = 0;
      let totalOrders = 0;
      let prevTotalRevenue = 0;

      orders.forEach((o) => {
        const created = new Date(o.createdAt);
        const amt = o.totalAmount || 0;
        const isPaid = o.paymentInfo?.status === 'paid';
        const isCod = o.paymentInfo?.status === 'cod';

        // Check if order falls in current period
        if (created >= start && created <= end) {
          totalRevenue += amt;
          totalOrders += 1;
          if (isPaid) upiRevenue += amt;
          else if (isCod) codRevenue += amt;
          else upiRevenue += amt; // default online payment

          // Populate bucket
          if (bucketType === 'hourly') {
            const h = created.getHours();
            if (buckets[h]) {
              buckets[h].totalRevenue += amt;
              buckets[h].orders += 1;
              if (isPaid) buckets[h].upiRevenue += amt;
              else if (isCod) buckets[h].codRevenue += amt;
              else buckets[h].upiRevenue += amt;
            }
          } else if (bucketType === 'dailyWeek') {
            // JS getDay(): 0=Sun, 1=Mon ... -> converted to Mon=0 ... Sun=6
            const idx = (created.getDay() + 6) % 7;
            if (buckets[idx]) {
              buckets[idx].totalRevenue += amt;
              buckets[idx].orders += 1;
              if (isPaid) buckets[idx].upiRevenue += amt;
              else if (isCod) buckets[idx].codRevenue += amt;
              else buckets[idx].upiRevenue += amt;
            }
          } else if (bucketType === 'dailyMonth') {
            const d = created.getDate() - 1;
            if (buckets[d]) {
              buckets[d].totalRevenue += amt;
              buckets[d].orders += 1;
              if (isPaid) buckets[d].upiRevenue += amt;
              else if (isCod) buckets[d].codRevenue += amt;
              else buckets[d].upiRevenue += amt;
            }
          } else if (bucketType === 'monthly') {
            const m = created.getMonth();
            if (buckets[m]) {
              buckets[m].totalRevenue += amt;
              buckets[m].orders += 1;
              if (isPaid) buckets[m].upiRevenue += amt;
              else if (isCod) buckets[m].codRevenue += amt;
              else buckets[m].upiRevenue += amt;
            }
          }
        }

        // Check if order falls in previous period
        if (prevStart && prevEnd && created >= prevStart && created <= prevEnd) {
          prevTotalRevenue += amt;
        }
      });

      let percentChange = 0;
      if (prevTotalRevenue > 0) {
        percentChange = Number((((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100).toFixed(1));
      } else if (totalRevenue > 0) {
        percentChange = 100;
      }

      return {
        totalRevenue,
        upiRevenue,
        codRevenue,
        orders: totalOrders,
        prevTotalRevenue,
        percentChange,
        chartData: buckets,
      };
    };

    const analytics = {
      today: processPeriod(startOfToday, endOfToday, startOfYesterday, endOfYesterday, 'hourly'),
      yesterday: processPeriod(startOfYesterday, endOfYesterday, startOfPrevDay, endOfPrevDay, 'hourly'),
      thisWeek: processPeriod(startOfWeek, endOfWeek, startOfPrevWeek, endOfPrevWeek, 'dailyWeek'),
      thisMonth: processPeriod(startOfMonth, endOfMonth, startOfPrevMonth, endOfPrevMonth, 'dailyMonth'),
      thisYear: processPeriod(startOfYear, endOfYear, startOfPrevYear, endOfPrevYear, 'monthly'),
    };

    res.json({
      success: true,
      analytics,
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ success: false, message: 'Server error loading analytics' });
  }
};

// @desc    Get all reviews for admin with sorting, filtering, and summary statistics
// @route   GET /api/admin/reviews
// @access  Admin
const getAdminReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'newest',
      product,
      rating,
    } = req.query;

    const query = {};
    if (product) query.product = product;
    if (rating) query.rating = Number(rating);

    // Sorting options
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
    else if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    // Execute queries in parallel
    const [total, rawReviews, allStats] = await Promise.all([
      Review.countDocuments(query),
      Review.find(query)
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('product', 'name images price category')
        .populate('user', 'name email phone')
        .populate('order', '_id orderStatus createdAt'),
      Review.aggregate([
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Calculate total review count & rating average across ALL reviews
    const totalAllReviews = await Review.countDocuments();
    const avgStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$rating' },
        },
      },
    ]);
    const overallAvgRating = avgStats[0]?.avg ? Math.round(avgStats[0].avg * 10) / 10 : 0;

    // Rating breakdown counts (5, 4, 3, 2, 1 stars)
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allStats.forEach((s) => {
      if (s._id >= 1 && s._id <= 5) {
        ratingBreakdown[s._id] = s.count;
      }
    });

    const pages = Math.ceil(total / limitNum) || 1;

    res.json({
      success: true,
      total,
      page: pageNum,
      pages,
      reviews: rawReviews,
      summary: {
        totalReviews: totalAllReviews,
        avgRating: overallAvgRating,
        breakdown: ratingBreakdown,
      },
    });
  } catch (err) {
    console.error('Error fetching admin reviews:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

// @desc    Get customers with DELIVERED orders who haven't submitted a review yet
// @route   GET /api/admin/reviews/pending
// @access  Admin
const getAdminPendingReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'longest_waiting',
      product,
    } = req.query;

    // 1. Find all delivered orders
    const deliveredOrders = await Order.find({ orderStatus: 'Delivered' })
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price category');

    // 2. Fetch all existing reviews to build a lookup set: key = `${userId}_${productId}`
    const existingReviews = await Review.find({}).select('user product');
    const reviewedSet = new Set(
      existingReviews.map((r) => `${r.user?.toString()}_${r.product?.toString()}`)
    );

    const pendingList = [];

    deliveredOrders.forEach((order) => {
      const deliveryDate = order.updatedAt || order.createdAt;
      const daysSinceDelivered = Math.floor((Date.now() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24));

      order.items.forEach((item) => {
        const prodId = item.product?._id ? item.product._id.toString() : item.product?.toString();
        const userId = order.user?._id ? order.user._id.toString() : order.user?.toString();

        if (prodId && userId) {
          const key = `${userId}_${prodId}`;
          if (!reviewedSet.has(key)) {
            // Apply optional product filter
            if (!product || product === prodId) {
              const customerName = order.orderSource === 'whatsapp'
                ? (order.guestCustomer?.name || 'WhatsApp Customer')
                : (order.user?.name || 'Customer');

              const customerPhone = order.orderSource === 'whatsapp'
                ? (order.guestCustomer?.phone || '')
                : (order.deliveryAddress?.phone || order.user?.phone || '');

              const customerEmail = order.orderSource === 'whatsapp'
                ? ''
                : (order.user?.email || '');

              pendingList.push({
                _id: `${order._id}_${prodId}`,
                orderId: order._id,
                orderSource: order.orderSource,
                deliveryDate,
                daysSinceDelivered,
                customer: {
                  _id: userId,
                  name: customerName,
                  phone: customerPhone,
                  email: customerEmail,
                },
                product: {
                  _id: prodId,
                  name: item.product?.name || item.name || 'Chocolate Product',
                  image: item.product?.images?.[0] || item.image || '',
                  price: item.price,
                },
              });
            }
          }
        }
      });
    });

    // 3. Sorting
    if (sort === 'longest_waiting') {
      pendingList.sort((a, b) => b.daysSinceDelivered - a.daysSinceDelivered);
    } else if (sort === 'recent_delivery') {
      pendingList.sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate));
    } else if (sort === 'customer_name') {
      pendingList.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
    } else if (sort === 'product_name') {
      pendingList.sort((a, b) => a.product.name.localeCompare(b.product.name));
    }

    // 4. Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const total = pendingList.length;
    const pages = Math.ceil(total / limitNum) || 1;
    const paginatedItems = pendingList.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages,
      pendingReviews: paginatedItems,
    });
  } catch (err) {
    console.error('Error fetching admin pending reviews:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch pending reviews' });
  }
};

module.exports = {
  getDashboardStats,
  getCustomers,
  getDashboardAnalytics,
  getAdminReviews,
  getAdminPendingReviews,
};
