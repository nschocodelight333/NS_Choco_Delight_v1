export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { items, deliveryAddress, itemsTotal, deliveryFee = 40, totalAmount, notes, paymentMethod } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No items in order' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      user: user._id,
      orderSource: 'website',
      items,
      deliveryAddress,
      itemsTotal,
      deliveryFee,
      totalAmount,
      notes: notes || '',
      paymentInfo: {
        status: paymentMethod === 'cod' ? 'cod' : 'pending',
      },
      orderStatus: 'Pending',
    });

    // Clear user cart after placing order
    await Cart.findOneAndUpdate({ user: user._id }, { items: [] });

    return NextResponse.json({
      success: true,
      order,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
