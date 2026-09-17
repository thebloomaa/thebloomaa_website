import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/orders/[id]/skip
// Skips an order if requested before the 8:30 PM cutoff on the eve of delivery
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const isOwner = order.userId === session.user.id || (order.subscription && order.subscription.userId === session.user.id);
    const isAdmin = (session.user as any).role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden. You do not own this order.' }, { status: 403 });
    }

    if (order.status === 'DELIVERED') {
      return NextResponse.json({ error: 'Cannot skip an already delivered order.' }, { status: 400 });
    }

    if (order.status === 'SKIPPED') {
      return NextResponse.json({ error: 'This order has already been skipped.' }, { status: 400 });
    }

    // 8:30 PM Cutoff Check
    const now = new Date();
    const deliveryDate = new Date(order.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);

    const eveOfDelivery = new Date(deliveryDate);
    eveOfDelivery.setDate(deliveryDate.getDate() - 1);
    eveOfDelivery.setHours(20, 30, 0, 0); // 8:30 PM previous evening

    // If current time is past 8:30 PM on the day before delivery (or delivery day itself), reject skip for customers
    if (!isAdmin && now > eveOfDelivery) {
      return NextResponse.json(
        {
          error:
            'Orders cannot be skipped after 8:30 PM on the evening prior to morning delivery, as kitchen bloom-prep and cold-chain pack have commenced.',
        },
        { status: 400 }
      );
    }

    // Perform atomic transaction: mark order SKIPPED and push subscription nextDeliveryDate
    const updated = await prisma.$transaction(async (tx) => {
      const skippedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'SKIPPED',
          deliveryNote: order.deliveryNote
            ? `${order.deliveryNote} [User Skipped on ${now.toLocaleDateString()}]`
            : `Customer skipped on ${now.toLocaleDateString()}`,
        },
      });

      if (order.subscriptionId && order.subscription) {
        const currentNext = new Date(order.subscription.nextDeliveryDate);
        currentNext.setDate(currentNext.getDate() + 1);

        await tx.subscription.update({
          where: { id: order.subscriptionId },
          data: {
            nextDeliveryDate: currentNext,
          },
        });
      }

      return skippedOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Order successfully skipped. Your plan balance is preserved.',
      order: updated,
    });
  } catch (error: any) {
    console.error('Skip Order API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to skip order.' },
      { status: 500 }
    );
  }
}
