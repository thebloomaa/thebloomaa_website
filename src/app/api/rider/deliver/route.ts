import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/rider/deliver
// Mark an order as DELIVERED or FAILED
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const riderId = cookieStore.get('thebloomaa_rider_id')?.value;
    const session = await getServerSession(authOptions);
    const isAdmin = Boolean(session?.user && (session.user as any).role === 'ADMIN');

    if (!riderId && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Rider or admin sign-in required' }, { status: 401 });
    }

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
