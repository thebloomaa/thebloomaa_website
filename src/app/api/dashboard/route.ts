import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look for user's latest primary subscription (ACTIVE, PAUSED, PENDING, or CONFIRMED)
    // Ordered by updatedAt desc so recently paused/resumed subscriptions are always reflected immediately
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['ACTIVE', 'PAUSED', 'PENDING', 'CONFIRMED'] },
      },
      include: {
        product: true,
        address: true,
        orders: {
          orderBy: { deliveryDate: 'asc' },
        },
        pauses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Auto-skip any Sunday orders that are currently queued/pending, and advance Sunday nextDeliveryDate
    if (subscription) {
      if (subscription.orders && subscription.orders.length > 0) {
        for (const ord of subscription.orders) {
          const d = new Date(ord.deliveryDate);
          if (d.getDay() === 0 && (ord.status === 'QUEUED' || ord.status === 'PENDING')) {
            await prisma.order.update({
              where: { id: ord.id },
              data: {
                status: 'SKIPPED',
                deliveryNote: ord.deliveryNote
                  ? `${ord.deliveryNote} [Auto-skipped: No Sunday Deliveries]`
                  : 'Auto-skipped: No Sunday Deliveries',
              },
            });
            ord.status = 'SKIPPED';
          }
        }
      }

      if (subscription.nextDeliveryDate && new Date(subscription.nextDeliveryDate).getDay() === 0) {
        const nextMon = new Date(subscription.nextDeliveryDate);
        nextMon.setDate(nextMon.getDate() + 1);
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { nextDeliveryDate: nextMon },
        });
        subscription.nextDeliveryDate = nextMon;
      }
    }

    // Also fetch user profile with default address
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        allergies: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
      },
    });

    // If no active subscription, get their most recent past subscription
    const lastSubscription = !subscription
      ? await prisma.subscription.findFirst({
          where: { userId: session.user.id },
          include: { product: true, address: true },
          orderBy: { createdAt: 'desc' },
        })
      : null;

    return NextResponse.json({
      subscription: subscription || null,
      user,
      lastSubscription,
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
