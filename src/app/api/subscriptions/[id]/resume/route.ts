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
      // Find and close any active pause (both indefinite and date-bounded)
      const activePauses = await tx.subscriptionPause.findMany({
        where: {
          subscriptionId: id,
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      });

      for (const p of activePauses) {
        await tx.subscriptionPause.update({
          where: { id: p.id },
          data: { endDate: now },
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

      // Ensure an order is queued for nextDeliveryDate
      const startOfDay = new Date(nextDelivery);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(nextDelivery);
      endOfDay.setHours(23, 59, 59, 999);

      const existingOrder = await tx.order.findFirst({
        where: {
          subscriptionId: id,
          deliveryDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (!existingOrder) {
        await tx.order.create({
          data: {
            subscriptionId: id,
            userId: subscription.userId,
            addressId: subscription.addressId,
            status: 'QUEUED',
            deliveryDate: nextDelivery,
            deliveryTime: subscription.deliveryTime || '07:00 AM',
            deliveryNote: `Morning delivery resumed by customer. Slot: ${subscription.deliveryTime || '07:00 AM'}`,
          },
        });
      } else if (existingOrder.status === 'SKIPPED') {
        await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            status: 'QUEUED',
            deliveryNote: `Reactivated: Morning delivery resumed by customer. Slot: ${subscription.deliveryTime || '07:00 AM'}`,
          },
        });
      }

      return { subscription: updatedSub };
    });

    return NextResponse.json({
      success: true,
      ...result,
      message: isPastCutoff
        ? `Plan resumed! Note: Because it is past the 8:30 PM cutoff, tomorrow morning's kitchen prep is locked. Deliveries will restart on ${nextDelivery.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at ${subscription.deliveryTime || '07:00 AM'}.`
        : `Plan resumed! Morning deliveries restart tomorrow (${nextDelivery.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}) at ${subscription.deliveryTime || '07:00 AM'}.`,
    });
  } catch (error) {
    console.error('Resume API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
