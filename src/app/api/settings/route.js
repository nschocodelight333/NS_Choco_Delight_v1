export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const settingsList = await Setting.find({});
    const settings = {};
    settingsList.forEach((item) => {
      settings[item.key] = item.value;
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
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

    // Support updating key-value or whatsappNumber directly
    if (body.key && body.value !== undefined) {
      await Setting.findOneAndUpdate(
        { key: body.key },
        { key: body.key, value: body.value },
        { upsert: true, new: true }
      );
    }

    if (body.whatsappNumber !== undefined) {
      const cleanNum = String(body.whatsappNumber).replace(/\D/g, '');
      await Setting.findOneAndUpdate(
        { key: 'store_whatsapp_number' },
        { key: 'store_whatsapp_number', value: cleanNum },
        { upsert: true, new: true }
      );
    }

    const settingsList = await Setting.find({});
    const settings = {};
    settingsList.forEach((item) => {
      settings[item.key] = item.value;
    });

    return NextResponse.json({
      success: true,
      settings,
      message: 'Store settings updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
