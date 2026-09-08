export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import Review from '@/models/Review';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized as admin' },
        { status: 403 }
      );
    }

    await connectDB();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search')?.trim();
    const sort = searchParams.get('sort');

    // Single Customer Drill-down
    if (userId) {
      const customer = await User.findById(userId).select('-password').lean();
      if (!customer) {
        return NextResponse.json(
          { success: false, message: 'Customer not found' },
          { status: 404 }
        );
      }

      const [customerOrders, customerReviews] = await Promise.all([
        Order.find({ user: userId }).sort({ createdAt: -1 }).lean(),
        Review.find({ user: userId }).populate('product', 'name images price').sort({ createdAt: -1 }).lean(),
      ]);

      const totalSpent = customerOrders
        .filter((o) => o.orderStatus !== 'Cancelled')
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      const pendingOrdersCount = customerOrders.filter((o) => o.orderStatus === 'Pending').length;
      const deliveredOrdersCount = customerOrders.filter((o) => o.orderStatus === 'Delivered').length;
      const cancelledOrdersCount = customerOrders.filter((o) => o.orderStatus === 'Cancelled').length;

      return NextResponse.json({
        success: true,
        customer: {
          ...customer,
          totalOrders: customerOrders.length,
          totalSpent,
          pendingOrdersCount,
          deliveredOrdersCount,
          cancelledOrdersCount,
          orders: customerOrders,
          reviews: customerReviews,
        },
      });
    }

    // All Customers List
    let users = await User.find({}).select('-password').lean();

    // Fetch all orders and reviews to enrich customer profiles
    const [allOrders, allReviews] = await Promise.all([
      Order.find({}).lean(),
      Review.find({}).lean(),
    ]);

    const ordersByUser = new Map();
    allOrders.forEach((o) => {
      const uId = o.user?.toString();
      if (uId) {
        if (!ordersByUser.has(uId)) ordersByUser.set(uId, []);
        ordersByUser.get(uId).push(o);
      }
    });

    const reviewsByUser = new Map();
    allReviews.forEach((r) => {
      const uId = r.user?.toString();
      if (uId) {
        if (!reviewsByUser.has(uId)) reviewsByUser.set(uId, []);
        reviewsByUser.get(uId).push(r);
      }
    });

    let enrichedUsers = users.map((u) => {
      const uId = u._id.toString();
      const userOrders = ordersByUser.get(uId) || [];
      const userReviews = reviewsByUser.get(uId) || [];

      const totalSpent = userOrders
        .filter((o) => o.orderStatus !== 'Cancelled')
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      const pendingOrdersCount = userOrders.filter((o) => o.orderStatus === 'Pending').length;
      const deliveredOrdersCount = userOrders.filter((o) => o.orderStatus === 'Delivered').length;
      const cancelledOrdersCount = userOrders.filter((o) => o.orderStatus === 'Cancelled').length;

      return {
        ...u,
        totalOrders: userOrders.length,
        totalSpent,
        pendingOrdersCount,
        deliveredOrdersCount,
        cancelledOrdersCount,
        reviewCount: userReviews.length,
        recentOrders: userOrders.slice(0, 3),
      };
    });

    // In-memory search (by name, email, phone)
    if (search) {
      const s = search.toLowerCase();
      enrichedUsers = enrichedUsers.filter((u) => {
        return (
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.phone?.toLowerCase().includes(s) ||
          u.address?.street?.toLowerCase().includes(s) ||
          u.address?.city?.toLowerCase().includes(s)
        );
      });
    }

    // In-memory sorting
    if (sort === 'name_asc') {
      enrichedUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sort === 'name_desc') {
      enrichedUsers.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sort === 'oldest') {
      enrichedUsers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'orders_desc') {
      enrichedUsers.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (sort === 'spent_desc') {
      enrichedUsers.sort((a, b) => b.totalSpent - a.totalSpent);
    } else {
      // Default: newest first
      enrichedUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
