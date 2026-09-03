import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import CustomOrderRequest from '@/models/CustomOrderRequest';
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

    const [totalOrders, totalProducts, totalUsers, pendingCustomRequests, orders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      CustomOrderRequest.countDocuments({ status: 'Pending Review' }),
      Order.find({ 'paymentInfo.status': 'paid' }),
    ]);

    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'Confirmed' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalProducts,
        totalUsers,
        pendingCustomRequests,
        totalRevenue,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
