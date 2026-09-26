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

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
