export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    let query = { isAvailable: true };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let productQuery = Product.find(query);

    if (sort === 'price-low') {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sort === 'price-high') {
      productQuery = productQuery.sort({ price: -1 });
    } else if (sort === 'rating') {
      productQuery = productQuery.sort({ ratingAverage: -1 });
    } else {
      productQuery = productQuery.sort({ createdAt: -1 });
    }

    const products = await productQuery;

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error', products: [] },
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

    const product = await Product.create(body);

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
