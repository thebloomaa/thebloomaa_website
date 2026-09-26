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
    const { startDate, endDate, pauseType } = body;

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

    const now = new Date();
    const isPastCutoff = now.getHours() > 20 || (now.getHours() === 20 && now.getMinutes() >= 30);

    let effectiveStartDate = startDate ? new Date(startDate) : new Date();
    let effectiveEndDate: Date | null = null;
    let nextDelivery = new Date(subscription.nextDeliveryDate);
    let successMessage = 'Subscription successfully paused.';

    if (pauseType === 'ONE_DAY') {
      // 1-Day Pause:
      // If before 8:30 PM: skip tomorrow's morning delivery, resume day after tomorrow
      // If past 8:30 PM: tomorrow's prep is locked, skip day after tomorrow, resume the following day
      const skipDay = new Date(now);
      skipDay.setDate(now.getDate() + (isPastCutoff ? 2 : 1));
      skipDay.setHours(0, 0, 0, 0);

      const resumeDay = new Date(skipDay);
      resumeDay.setDate(skipDay.getDate() + 1);
      resumeDay.setHours(7, 0, 0, 0);

      effectiveStartDate = skipDay;
      effectiveEndDate = new Date(skipDay.getTime() + 24 * 60 * 60 * 1000 - 1);
      nextDelivery = resumeDay;

      const skipLabel = skipDay.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const resumeLabel = resumeDay.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      successMessage = isPastCutoff
        ? `1-Day Pause active: Past 8:30 PM cutoff, so tomorrow's box is already prepped. Delivery on ${skipLabel} will be skipped and resumes automatically on ${resumeLabel}.`
        : `1-Day Pause active: Tomorrow's delivery is skipped. Morning deliveries will automatically resume on ${resumeLabel}.`;
    } else if (endDate) {
      // Custom date pause
      effectiveEndDate = new Date(endDate);
      nextDelivery = new Date(effectiveEndDate);
      nextDelivery.setHours(7, 0, 0, 0);
      const dateLabel = nextDelivery.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      successMessage = `Plan paused until ${dateLabel}. Deliveries will automatically resume on that morning.`;
    } else {
      // Indefinite Pause: remains paused until customer taps 'Resume Plan'
      effectiveEndDate = null;
      successMessage = isPastCutoff
        ? 'Subscription paused: Because it is past the 8:30 PM cutoff, tomorrow morning’s prepped delivery will arrive as scheduled. Subsequent deliveries are on hold until you tap Resume Plan.'
        : 'Subscription successfully paused. Morning deliveries are on hold until you tap Resume Plan.';
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the pause record
      const pause = await tx.subscriptionPause.create({
        data: {
          subscriptionId: id,
          startDate: effectiveStartDate,
          endDate: effectiveEndDate,
        },
      });

      // Update subscription status to PAUSED and set next scheduled delivery
      const updatedSub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'PAUSED',
          nextDeliveryDate: nextDelivery,
        },
      });

      // Mark affected queued orders as skipped
      if (pauseType === 'ONE_DAY') {
        const startOfSkip = new Date(effectiveStartDate);
        startOfSkip.setHours(0, 0, 0, 0);
        const endOfSkip = new Date(effectiveStartDate);
        endOfSkip.setHours(23, 59, 59, 999);

        await tx.order.updateMany({
          where: {
            subscriptionId: id,
            status: 'QUEUED',
            deliveryDate: {
              gte: startOfSkip,
              lte: endOfSkip,
            },
          },
          data: {
            status: 'SKIPPED',
            deliveryNote: `1-Day Pause: Skipped by customer on ${now.toLocaleDateString('en-IN')}`,
          },
        });
      } else {
        // Indefinite pause:
        // If past 8:30 PM cutoff, keep tomorrow's order intact for morning delivery and skip from day-after-tomorrow
        const cutoffBoundary = new Date(now);
        if (isPastCutoff) {
          cutoffBoundary.setDate(now.getDate() + 1);
          cutoffBoundary.setHours(23, 59, 59, 999);
        } else {
          cutoffBoundary.setHours(0, 0, 0, 0);
        }

        await tx.order.updateMany({
          where: {
            subscriptionId: id,
            status: 'QUEUED',
            deliveryDate: {
              gte: cutoffBoundary,
            },
          },
          data: {
            status: 'SKIPPED',
            deliveryNote: `Plan paused by customer on ${now.toLocaleDateString('en-IN')}`,
          },
        });
      }

      return { pause, subscription: updatedSub };
    });

    return NextResponse.json({ success: true, ...result, message: successMessage });
  } catch (error) {
    console.error('Pause API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
