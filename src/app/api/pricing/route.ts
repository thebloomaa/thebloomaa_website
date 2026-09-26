import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EARLY_BIRD_SLOTS = parseInt(process.env.NEXT_PUBLIC_EARLY_BIRD_SLOTS || '100');
const EARLY_BIRD_PRICE = parseInt(process.env.NEXT_PUBLIC_EARLY_BIRD_PRICE || '499');
const REGULAR_PRICE = parseInt(process.env.NEXT_PUBLIC_REGULAR_PRICE || '599');
const JUST_BLOOM_PRODUCT_ID = 'prod-just-bloomed-7d-trial';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Count all active Just Bloom pre-bookings
    const bookedCount = await prisma.subscription.count({
      where: {
        productId: JUST_BLOOM_PRODUCT_ID,
        status: { in: ['PENDING', 'ACTIVE', 'CONFIRMED', 'PRE_BOOK'] },
      },
    });

    const spotsLeft = Math.max(0, EARLY_BIRD_SLOTS - bookedCount);
    const isEarlyBird = bookedCount < EARLY_BIRD_SLOTS;
    const currentPrice = isEarlyBird ? EARLY_BIRD_PRICE : REGULAR_PRICE;

    return NextResponse.json({
      price: currentPrice,
      originalPrice: REGULAR_PRICE,
      earlyBirdPrice: EARLY_BIRD_PRICE,
      bookedCount,
      spotsLeft,
      totalSlots: EARLY_BIRD_SLOTS,
      isEarlyBird,
      percentFilled: Math.min(100, Math.round((bookedCount / EARLY_BIRD_SLOTS) * 100)),
    });
  } catch (error) {
    console.error('Pricing API error:', error);
    // Fallback to early bird price if DB fails
    return NextResponse.json({
      price: EARLY_BIRD_PRICE,
      originalPrice: REGULAR_PRICE,
      earlyBirdPrice: EARLY_BIRD_PRICE,
      bookedCount: 0,
      spotsLeft: EARLY_BIRD_SLOTS,
      totalSlots: EARLY_BIRD_SLOTS,
      isEarlyBird: true,
      percentFilled: 0,
    });
  }
}
