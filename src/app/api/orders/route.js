export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
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
    const body = await req.json();
    const {
      items,
      deliveryAddress,
      itemsTotal,
      deliveryFee,
      totalAmount,
      notes,
      paymentMethod,
      paymentInfo,
    } = body;

    if (!items || items.length === 0) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No items in order' },
        { status: 400 }
      );
    }

    // Fetch product details from DB for all items
    const rawIds = items
      .map((item) => item.product?._id || item.product || item.productId)
      .filter(Boolean);
    const dbProducts = await Product.find({ _id: { $in: rawIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    let calculatedItemsTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const pId = (item.product?._id || item.product || item.productId)?.toString();
      const dbProduct = pId ? productMap.get(pId) : null;

      const name = dbProduct?.name || item.name || 'Handcrafted Chocolate';
      const price = dbProduct?.price !== undefined ? dbProduct.price : (Number(item.price) || 0);
      const image = dbProduct?.images?.[0] || dbProduct?.image || item.image || '';
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const shape = item.shape || '';

      validatedItems.push({
        product: dbProduct ? dbProduct._id : (pId || null),
        name,
        image,
        price,
        quantity,
        shape,
      });

      calculatedItemsTotal += price * quantity;
    }

    const isTakeaway = Boolean(
      deliveryAddress?.isTakeaway ||
      paymentMethod === 'takeaway' ||
      paymentInfo?.paymentMethod === 'takeaway'
    );

    const finalItemsTotal = typeof itemsTotal === 'number' && itemsTotal > 0 ? itemsTotal : calculatedItemsTotal;
    const finalDeliveryFee = isTakeaway
      ? 0
      : (finalItemsTotal >= 500 ? 0 : (typeof deliveryFee === 'number' ? deliveryFee : 40));
    const finalTotalAmount = typeof totalAmount === 'number' && totalAmount > 0
      ? totalAmount
      : (finalItemsTotal + finalDeliveryFee);

    const paymentStatus = (paymentMethod === 'cod' || paymentMethod === 'takeaway' || isTakeaway)
      ? 'cod'
      : (paymentInfo?.status || 'pending');

    const order = await Order.create({
      user: user._id,
      orderSource: 'website',
      items,
      items: validatedItems,
      deliveryAddress,
      itemsTotal,
      deliveryFee,
      totalAmount,
      itemsTotal: finalItemsTotal,
      deliveryFee: finalDeliveryFee,
      totalAmount: finalTotalAmount,
      notes: notes || '',
      paymentInfo: {
        status: paymentMethod === 'cod' ? 'cod' : 'pending',
        status: paymentStatus,
        razorpayOrderId: paymentInfo?.razorpayOrderId || '',
        razorpayPaymentId: paymentInfo?.razorpayPaymentId || '',
        razorpaySignature: paymentInfo?.razorpaySignature || '',
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
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
