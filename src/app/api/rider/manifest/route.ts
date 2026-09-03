import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/rider/manifest
// Returns today's orders, grouped by pincode
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get('riderId');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        ...(riderId ? { riderId } : {}),
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

    // Convert to array format expected by UI
    const routesArray = Object.keys(grouped).map(pincode => ({
      pincode,
      neighborhood: 'Delivery Zone',
      orders: grouped[pincode].map(o => ({
        id: o.id,
        customer: o.user.name || 'Customer',
        address: o.address.street,
        phone: o.user.phone || '',
        meal: o.subscription?.product.name || 'Meal',
        calories: o.subscription?.product.calories || 0,
        time: o.deliveryTime || 'Morning',
        status: o.status,
      }))
    }));

    return NextResponse.json({ date: today.toLocaleDateString(), routes: routesArray });
  } catch (error) {
    console.error('Manifest API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
