export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const productId = params.id;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed
    const existingReview = await Review.findOne({ product: productId, user: user._id });
    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Check for verified purchase
    const order = await Order.findOne({
      user: user._id,
      'items.product': productId,
      orderStatus: 'Delivered',
    });

    const review = await Review.create({
      product: productId,
      user: user._id,
      rating,
      comment: comment || '',
      verifiedPurchase: !!order,
      order: order ? order._id : null,
    });

    return NextResponse.json({
      success: true,
      review,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
