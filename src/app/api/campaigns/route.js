export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get('all') === 'true';

    let query = {};
    if (!includeDrafts) {
      query.status = 'published';
    }

    const campaigns = await Campaign.find(query)
      .populate('products.special')
      .populate('products.hampers')
      .populate('products.customWrappers')
      .populate('products.normal')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error', campaigns: [] },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized as admin' },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await req.json();

    const campaign = await Campaign.create(body);

    return NextResponse.json({
      success: true,
      campaign,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
