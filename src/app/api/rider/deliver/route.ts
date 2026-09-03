import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/rider/deliver
// Mark an order as DELIVERED or FAILED
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !['DELIVERED', 'FAILED'].includes(status)) {
      return NextResponse.json({ error: 'orderId and valid status (DELIVERED/FAILED) are required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Deliver API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
