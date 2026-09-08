export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Review from '@/models/Review';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized as admin' },
        { status: 403 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const orderType = searchParams.get('orderType');
    const search = searchParams.get('search')?.trim();
    const sort = searchParams.get('sort');
    const userId = searchParams.get('userId');

    let query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    if (orderType && orderType !== 'all') {
      if (orderType === 'takeaway') {
        query.$or = [
          { orderType: 'takeaway' },
          { 'deliveryAddress.isTakeaway': true },
          { paymentMethod: 'takeaway' },
        ];
      } else if (orderType === 'delivery') {
        query.$and = [
          { orderType: { $ne: 'takeaway' } },
          { 'deliveryAddress.isTakeaway': { $ne: true } },
        ];
      }
    }
    if (userId) {
      query.user = userId;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'amount_desc' || sort === 'price_high') {
      sortOption = { totalAmount: -1 };
    } else if (sort === 'amount_asc' || sort === 'price_low') {
      sortOption = { totalAmount: 1 };
    }

    let ordersList = await Order.find(query)
      .populate('user', 'name email phone address')
      .sort(sortOption)
      .lean();

    // In-memory search if search parameter is provided (for customer name/email, order ID, product name)
    if (search) {
      const searchLower = search.toLowerCase();
      ordersList = ordersList.filter((o) => {
        const idMatch = o._id?.toString().toLowerCase().includes(searchLower);
        const nameMatch = (o.user?.name || o.guestCustomer?.name || o.deliveryAddress?.name || '').toLowerCase().includes(searchLower);
        const emailMatch = (o.user?.email || '').toLowerCase().includes(searchLower);
        const phoneMatch = (o.user?.phone || o.guestCustomer?.phone || o.deliveryAddress?.phone || '').toLowerCase().includes(searchLower);
        const productMatch = o.items?.some((item) => item.name?.toLowerCase().includes(searchLower));
        return idMatch || nameMatch || emailMatch || phoneMatch || productMatch;
      });
    }

    // Attach reviews for each order
    const orderIds = ordersList.map((o) => o._id);
    const reviews = await Review.find({ order: { $in: orderIds } }).lean();
    const reviewsByOrder = new Map();
    reviews.forEach((r) => {
      const oId = r.order?.toString();
      if (!reviewsByOrder.has(oId)) reviewsByOrder.set(oId, []);
      reviewsByOrder.get(oId).push(r);
    });

    const enrichedOrders = ordersList.map((order) => {
      const orderReviews = reviewsByOrder.get(order._id.toString()) || [];
      const isTakeaway = Boolean(
        order.orderType === 'takeaway' ||
        order.deliveryAddress?.isTakeaway ||
        order.paymentMethod === 'takeaway' ||
        order.paymentInfo?.paymentMethod === 'takeaway'
      );
      return {
        ...order,
        orderType: isTakeaway ? 'takeaway' : 'delivery',
        paymentMethod: order.paymentMethod === 'takeaway' ? 'cod' : (order.paymentMethod || order.paymentInfo?.status || 'cod'),
        hasReview: orderReviews.length > 0,
        reviews: orderReviews,
      };
    });

    return NextResponse.json({
      success: true,
      count: enrichedOrders.length,
      orders: enrichedOrders,
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
