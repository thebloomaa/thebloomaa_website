import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPreBookingLocked, PRE_BOOKING_OPENS_AT } from '@/lib/preBookingConfig';

const EARLY_BIRD_SLOTS = parseInt(process.env.NEXT_PUBLIC_EARLY_BIRD_SLOTS || '100');
const EARLY_BIRD_PRICE = parseInt(process.env.NEXT_PUBLIC_EARLY_BIRD_PRICE || '599');
const REGULAR_PRICE = parseInt(process.env.NEXT_PUBLIC_REGULAR_PRICE || '599');
const ORIGINAL_PRICE = parseInt(process.env.NEXT_PUBLIC_ORIGINAL_PRICE || '699');
const JUST_BLOOM_PRODUCT_ID = 'prod-just-bloomed-7d-trial';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bookedCount = await prisma.subscription.count({
      where: {
        productId: JUST_BLOOM_PRODUCT_ID,
        status: { in: ['PENDING', 'ACTIVE', 'CONFIRMED', 'PRE_BOOK'] },
      },
    });

    return NextResponse.json({
      price: REGULAR_PRICE,
      originalPrice: ORIGINAL_PRICE,
      earlyBirdPrice: EARLY_BIRD_PRICE,
      bookedCount,
      spotsLeft: 0,
      totalSlots: 100,
      isEarlyBird: false,
      percentFilled: 100,
      isLocked: false,
      opensAt: '2026-09-30T00:00:00.000Z',
      opensAtLabel: 'Live Now',
    });
  } catch (error) {
    console.error('Pricing API error:', error);
    return NextResponse.json({
      price: REGULAR_PRICE,
      originalPrice: ORIGINAL_PRICE,
      earlyBirdPrice: EARLY_BIRD_PRICE,
      bookedCount: 0,
      spotsLeft: 0,
      totalSlots: 100,
      isEarlyBird: false,
      percentFilled: 100,
      isLocked: false,
      opensAt: '2026-09-30T00:00:00.000Z',
      opensAtLabel: 'Live Now',
    });
  }
}
