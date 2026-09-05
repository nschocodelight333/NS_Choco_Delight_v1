export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomOrderRequest from '@/models/CustomOrderRequest';
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
    const { id } = params;
    const body = await req.json();
    const { deliveryAddress, paymentInfo } = body;

    const customRequest = await CustomOrderRequest.findById(id);
    if (!customRequest) {
      return NextResponse.json(
        { success: false, message: 'Custom order request not found' },
        { status: 404 }
      );
    }

    if (customRequest.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Not authorized for this custom order' },
        { status: 403 }
      );
    }

    if (!customRequest.quotedPrice || customRequest.quotedPrice <= 0) {
      return NextResponse.json(
        { success: false, message: 'This custom order has not received a valid price quote yet' },
        { status: 400 }
      );
    }

    const isTakeaway = Boolean(
      deliveryAddress?.isTakeaway ||
      paymentInfo?.paymentMethod === 'takeaway'
    );

    const itemsTotal = customRequest.quotedPrice;
    const deliveryFee = isTakeaway ? 0 : (itemsTotal >= 500 ? 0 : 40);
    const totalAmount = itemsTotal + deliveryFee;

    const finalAddress = isTakeaway
      ? {
          street: 'NS Choco Delight Store (Self Pickup)',
          city: 'Store Pickup',
          state: 'Pickup',
          pincode: '500001',
          phone: deliveryAddress?.phone || user?.phone || '8185920511',
        }
      : deliveryAddress;

    const order = await Order.create({
      user: user._id,
      orderSource: 'website',
      items: [
        {
          name: customRequest.title || 'Custom Chocolate Order',
          price: customRequest.quotedPrice,
          quantity: 1,
          shape: 'Custom',
          image: customRequest.referenceImageUrls?.[0] || '',
        },
      ],
      deliveryAddress: finalAddress,
      itemsTotal,
      deliveryFee,
      totalAmount,
      notes: `Custom Request: ${customRequest.description || ''}`,
      paymentInfo: {
        status: (paymentInfo?.paymentMethod === 'cod' || isTakeaway) ? 'cod' : (paymentInfo?.status || 'pending'),
        razorpayOrderId: paymentInfo?.razorpayOrderId || '',
        razorpayPaymentId: paymentInfo?.razorpayPaymentId || '',
        razorpaySignature: paymentInfo?.razorpaySignature || '',
      },
      orderStatus: 'Pending',
    });

    customRequest.status = 'Converted to Order';
    customRequest.convertedOrderId = order._id;
    await customRequest.save();

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Custom order checkout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

