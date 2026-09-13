import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/subscriptions/[id]/resume
// Ends the active SubscriptionPause by setting endDate to now
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

    // Find the active (open-ended) pause
    const activePause = await prisma.subscriptionPause.findFirst({
      where: {
        subscriptionId: id,
        endDate: null,
      },
    });

    if (!activePause) {
      return NextResponse.json({ error: 'No active pause found for this subscription' }, { status: 404 });
    }

    // End the pause
    const updated = await prisma.subscriptionPause.update({
      where: { id: activePause.id },
      data: { endDate: new Date() },
    });

    return NextResponse.json({ success: true, pause: updated });
  } catch (error) {
    console.error('Resume API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
