import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/subscriptions/[id]/resume
// Ends the active SubscriptionPause by setting endDate to now
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
