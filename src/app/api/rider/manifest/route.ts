import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/rider/manifest?riderId=xxx
// Returns today's orders assigned to a rider, grouped by pincode
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get('riderId');

    if (!riderId) {
      return NextResponse.json({ error: 'riderId is required' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        riderId,
        deliveryDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: { select: { name: true, phone: true } },
        address: true,
        subscription: {
          include: { product: { select: { name: true, calories: true } } },
        },
      },
      orderBy: [
        { address: { pincode: 'asc' } },
        { createdAt: 'asc' },
      ],
    });

    // Group by pincode
    const grouped: Record<string, typeof orders> = {};
    for (const order of orders) {
      const pin = order.address.pincode;
      if (!grouped[pin]) grouped[pin] = [];
      grouped[pin].push(order);
    }

    return NextResponse.json({ date: today.toISOString(), orders: grouped });
  } catch (error) {
    console.error('Manifest API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
