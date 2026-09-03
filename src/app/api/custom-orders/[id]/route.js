export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomOrderRequest from '@/models/CustomOrderRequest';
import { getAuthUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;

    const request = await CustomOrderRequest.findById(id).populate('userId', 'name email phone');
    if (!request) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin' && request.userId._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      request,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;
    const body = await req.json();

    const request = await CustomOrderRequest.findById(id);
    if (!request) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }

    if (user.role === 'admin') {
      if (body.status) request.status = body.status;
      if (body.quotedPrice !== undefined) {
        request.quotedPrice = body.quotedPrice;
        request.quotedAt = new Date();
      }
      if (body.adminNotes !== undefined) request.adminNotes = body.adminNotes;
    } else {
      if (request.userId.toString() !== user._id.toString()) {
        return NextResponse.json(
          { success: false, message: 'Not authorized' },
          { status: 403 }
        );
      }
      if (body.status === 'Accepted' || body.status === 'Rejected' || body.status === 'Cancelled') {
        request.status = body.status;
        request.respondedAt = new Date();
      }
    }

    await request.save();

    return NextResponse.json({
      success: true,
      request,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
