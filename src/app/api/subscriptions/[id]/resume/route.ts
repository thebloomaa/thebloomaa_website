import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/subscriptions/[id]/resume
// Ends the active SubscriptionPause and updates subscription.status to 'ACTIVE'
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify subscription ownership
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this subscription' }, { status: 403 });
    }

    // Compute next delivery date based on 8:30 PM cutoff
    const now = new Date();
    const nextDelivery = new Date(now);
    const isPastCutoff = now.getHours() > 20 || (now.getHours() === 20 && now.getMinutes() >= 30);

    if (isPastCutoff) {
      // Past 8:30 PM: Next morning prep is already closed, schedule for day after tomorrow
      nextDelivery.setDate(now.getDate() + 2);
    } else {
      // Before 8:30 PM: Morning delivery resumes tomorrow
      nextDelivery.setDate(now.getDate() + 1);
    }
    nextDelivery.setHours(0, 0, 0, 0);

    const result = await prisma.$transaction(async (tx) => {
      // Find and close any active pause
      const activePause = await tx.subscriptionPause.findFirst({
        where: {
          subscriptionId: id,
          endDate: null,
        },
      });

      let updatedPause = null;
      if (activePause) {
        updatedPause = await tx.subscriptionPause.update({
          where: { id: activePause.id },
          data: { endDate: new Date() },
        });
      }

      // Update subscription status back to ACTIVE and set nextDeliveryDate
      const updatedSub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          nextDeliveryDate: nextDelivery,
        },
      });

      return { pause: updatedPause, subscription: updatedSub };
    });

    return NextResponse.json({
      success: true,
      ...result,
      message: `Plan resumed! Deliveries resume on ${nextDelivery.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}.`,
    });
  } catch (error) {
    console.error('Resume API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
