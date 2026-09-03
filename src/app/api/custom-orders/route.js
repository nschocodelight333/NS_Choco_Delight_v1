export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomOrderRequest from '@/models/CustomOrderRequest';
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
    let query = {};
    if (user.role !== 'admin') {
      query.userId = user._id;
    }

    const requests = await CustomOrderRequest.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: requests.length,
      requests,
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
    const { title, description, referenceImageUrls } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Please provide title and description' },
        { status: 400 }
      );
    }

    const customRequest = await CustomOrderRequest.create({
      userId: user._id,
      title,
      description,
      referenceImageUrls: referenceImageUrls || [],
      status: 'Pending Review',
    });

    return NextResponse.json({
      success: true,
      request: customRequest,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
