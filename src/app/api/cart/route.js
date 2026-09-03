export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
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
    let cart = await Cart.findOne({ user: user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: user._id, items: [] });
    }

    return NextResponse.json({
      success: true,
      cart,
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
    const { productId, quantity = 1, shape = '' } = await req.json();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = await Cart.create({ user: user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.shape === shape
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, shape });
    }

    await cart.save();
    cart = await cart.populate('items.product');

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    await connectDB();
    let cart = await Cart.findOne({ user: user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Cart cleared',
      cart: cart || { items: [] },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
