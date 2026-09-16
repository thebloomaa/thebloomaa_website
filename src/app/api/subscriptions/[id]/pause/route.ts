import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/subscriptions/[id]/pause
// Creates a SubscriptionPause record and updates subscription.status to 'PAUSED'
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
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty for quick pause
    }
    const { startDate, endDate } = body;

    // Validate subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Ensure only the owner or an admin can pause the subscription
    if (subscription.userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this subscription' }, { status: 403 });
    }

    if (subscription.status === 'PAUSED') {
      return NextResponse.json({ error: 'Subscription is already paused.' }, { status: 400 });
    }

    if (subscription.status === 'COMPLETED' || subscription.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot pause a completed or cancelled subscription.' }, { status: 400 });
    }

    const effectiveStartDate = startDate ? new Date(startDate) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Create the pause record
      const pause = await tx.subscriptionPause.create({
        data: {
          subscriptionId: id,
          startDate: effectiveStartDate,
          endDate: endDate ? new Date(endDate) : null,
        },
      });

      // Update subscription status to PAUSED
      const updatedSub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'PAUSED',
        },
      });

      // If there is an immediate queued order for tomorrow, mark it skipped so kitchen doesn't dispatch
      await tx.order.updateMany({
        where: {
          subscriptionId: id,
          status: 'QUEUED',
        },
        data: {
          status: 'SKIPPED',
          deliveryNote: `Plan paused by customer on ${new Date().toLocaleDateString()}`,
        },
      });

      return { pause, subscription: updatedSub };
    });

    return NextResponse.json({ success: true, ...result, message: 'Subscription successfully paused.' });
  } catch (error) {
    console.error('Pause API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
