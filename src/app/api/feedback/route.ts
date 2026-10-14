import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const totalCount = await prisma.feedback.count({ where: { approved: true } });
    const avgRatingAgg = await prisma.feedback.aggregate({
      where: { approved: true },
      _avg: { rating: true },
    });

    const averageRating = avgRatingAgg._avg.rating
      ? Number(avgRatingAgg._avg.rating.toFixed(1))
      : 5.0;

    return NextResponse.json({
      success: true,
      feedbacks,
      totalCount,
      averageRating,
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, orderId, rating, mealPlan, comment } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide your name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please write a brief feedback comment (at least 5 characters).' },
        { status: 400 }
      );
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));

    // Clean order ID if given
    let cleanOrderId: string | null = null;
    if (orderId && typeof orderId === 'string' && orderId.trim()) {
      cleanOrderId = orderId.trim().toUpperCase();
      if (!cleanOrderId.startsWith('ORD-') && cleanOrderId.length >= 5) {
        cleanOrderId = `ORD-${cleanOrderId}`;
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        name: name.trim(),
        phone: phone && typeof phone === 'string' ? phone.trim() : null,
        orderId: cleanOrderId,
        rating: numericRating,
        mealPlan: mealPlan && typeof mealPlan === 'string' ? mealPlan.trim() : null,
        comment: comment.trim(),
        approved: true, // auto-approved for public customer reviews
      },
    });

    return NextResponse.json({
      success: true,
      feedback,
      message: 'Thank you for your valuable feedback! It has been recorded.',
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    );
  }
}
