import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/subscriptions/[id]/pause
// Creates a SubscriptionPause record for a specific date or open-ended pause
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
    const body = await request.json();
    const { startDate, endDate } = body;

    // Validate subscription exists and is ACTIVE
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

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Can only pause an active subscription' }, { status: 400 });
    }

    // Check for existing overlapping pause
    const existingPause = await prisma.subscriptionPause.findFirst({
      where: {
        subscriptionId: id,
        endDate: null, // Open-ended active pause
      },
    });

    if (existingPause) {
      return NextResponse.json({ error: 'Subscription already has an active pause' }, { status: 409 });
    }

    // Create the pause record
    const pause = await prisma.subscriptionPause.create({
      data: {
        subscriptionId: id,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ success: true, pause });
  } catch (error) {
    console.error('Pause API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
