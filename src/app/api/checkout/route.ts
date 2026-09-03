import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, address, bundleType, deliveryTime, utr } = body;

    // Save address
    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: true,
      }
    });

    const bundleDays = bundleType === 'DAYS_30' ? 30 : bundleType === 'DAYS_15' ? 15 : 7;
    
    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        productId,
        addressId: newAddress.id,
        bundleType,
        deliveriesLeft: bundleDays,
        status: 'PENDING', // Awaiting admin verification of UTR
        utr: utr,
        startDate: new Date(),
        nextDeliveryDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        deliveryTime,
      }
    });

    // Create first order
    await prisma.order.create({
      data: {
        subscriptionId: subscription.id,
        userId: session.user.id,
        addressId: newAddress.id,
        status: 'QUEUED',
        deliveryDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        deliveryTime,
      }
    });

    return NextResponse.json({ success: true, subscriptionId: subscription.id });
  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
