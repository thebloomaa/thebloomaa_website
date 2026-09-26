import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BLOOMAA_PRODUCTS } from '@/lib/bioCalculator';
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const {
      productId,
      address,
      bundleType,
      deliveryTime,
      deliveryNote,
      allergies,
      customerName,
      customerPhone,
      customerEmail,
      utr,
    } = body;

    if (!address || !address.street || !address.pincode) {
      return NextResponse.json({ error: 'Delivery address and pincode are required.' }, { status: 400 });
    }

    // 1. Resolve User: Authenticated Session OR Guest Pre-Book Account
    let userId: string | null = null;
    if (session && session.user && (session.user as any).id) {
      userId = (session.user as any).id;
    } else {
      const cleanPhone = customerPhone ? customerPhone.trim().replace(/\s+/g, '') : null;
      const cleanEmail = customerEmail && customerEmail.includes('@')
        ? customerEmail.trim().toLowerCase()
        : `guest_${cleanPhone || Date.now().toString().slice(-6)}@thebloomaa.com`;

      // Find existing user by phone or email
      let user = cleanPhone
        ? await prisma.user.findFirst({
            where: {
              OR: [{ phone: cleanPhone }, { email: cleanEmail }],
            },
          })
        : await prisma.user.findUnique({ where: { email: cleanEmail } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            phone: cleanPhone,
            name: customerName || 'Patna Pre-Book Subscriber',
            allergies: allergies || null,
          },
        });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unable to identify user profile for pre-booking.' }, { status: 400 });
    }

    // 2. Resolve or upsert Diet Product
    let product = await prisma.product.findUnique({
      where: { id: productId || 'prod-just-bloomed-7d-trial' },
    });

    if (!product) {
      const preset = Object.values(BLOOMAA_PRODUCTS).find(
        (p) => p.id === productId || p.name.toLowerCase() === (productId || '').toLowerCase()
      ) || BLOOMAA_PRODUCTS.JUST_BLOOMED_TRIAL;

      product = await prisma.product.upsert({
        where: { id: preset.id },
        update: {},
        create: {
          id: preset.id,
          name: preset.name,
          description: preset.description,
          price: preset.price,
          imageUrl: preset.imageUrl,
          type: preset.type,
          calories: preset.calories,
          protein: preset.protein,
          carbs: preset.carbs,
          fats: preset.fats,
          dietaryPreference: preset.dietaryPreference,
        },
      });
    }

    // 3. Normalize plan to Just Bloom Plan or Custom Monthly Plan
    const isMonthly = bundleType === 'DAYS_30';
    const effectiveBundleType = isMonthly ? 'DAYS_30' : 'DAYS_7';
    const bundleDays = isMonthly ? 30 : 7;

    // Check first 100 early bird customer threshold
    const earlyBirdSlots = parseInt(process.env.NEXT_PUBLIC_EARLY_BIRD_SLOTS || '100');
    const earlyBirdPrice = parseInt(process.env.NEXT_PUBLIC_EARLY_BIRD_PRICE || '499');
    const regularPrice = parseInt(process.env.NEXT_PUBLIC_REGULAR_PRICE || '599');

    let isEarlyBird = true;
    let finalAmount = 0;

    if (!isMonthly) {
      const currentBookedCount = await prisma.subscription.count({
        where: {
          productId: 'prod-just-bloomed-7d-trial',
          status: { in: ['PENDING', 'ACTIVE', 'CONFIRMED', 'PRE_BOOK'] },
        },
      });
      isEarlyBird = currentBookedCount < earlyBirdSlots;
      finalAmount = isEarlyBird ? earlyBirdPrice : regularPrice;
    }

    // Launch target date: 30 September 2026 06:00 AM IST
    const launchDate = new Date('2026-09-30T06:00:00+05:30');
    const now = new Date();
    const firstDeliveryDate = launchDate > now ? launchDate : new Date(now.setDate(now.getDate() + 1));

    const effectiveUtr = utr && utr.trim().length > 0
      ? utr.trim()
      : `PRE_BOOK_${Date.now().toString().slice(-8)}`;

    // 4. Perform Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Save delivery address
      const newAddress = await tx.address.create({
        data: {
          userId,
          street: address.street,
          city: address.city || 'Patna',
          state: address.state || 'Bihar',
          pincode: address.pincode,
          isDefault: true,
        },
      });

      // Create subscription record
      const subscription = await tx.subscription.create({
        data: {
          userId,
          productId: product.id,
          addressId: newAddress.id,
          bundleType: effectiveBundleType,
          deliveriesLeft: bundleDays,
          status: 'PENDING', // Awaiting 30 Sept launch confirmation
          utr: effectiveUtr,
          startDate: firstDeliveryDate,
          nextDeliveryDate: firstDeliveryDate,
          deliveryTime: deliveryTime || '07:00 AM',
        },
      });

      // Payment info note
      const paymentInfoTag = isMonthly
        ? '[Custom Monthly Plan - Price TBA]'
        : `[Paid ₹${finalAmount} via UPI | UTR: ${effectiveUtr} | ${isEarlyBird ? 'Early Bird (First 100)' : 'Regular Price'}]`;

      const combinedOrderNote = [deliveryNote, paymentInfoTag].filter(Boolean).join(' | ');

      // Create queued first order
      const order = await tx.order.create({
        data: {
          subscriptionId: subscription.id,
          userId,
          addressId: newAddress.id,
          status: 'QUEUED',
          deliveryDate: firstDeliveryDate,
          deliveryTime: deliveryTime || '07:00 AM',
          deliveryNote: combinedOrderNote || `Pre-Launch Pre-Order for 30 Sept. Slot: ${deliveryTime || '07:00 AM'}`,
        },
      });

      // Update customer allergies if provided
      if (allergies && typeof allergies === 'string') {
        try {
          await tx.user.update({
            where: { id: userId },
            data: { allergies: allergies.trim() },
          });
        } catch (uErr) {
          console.error('Failed to update customer allergies on user profile:', uErr);
        }
      }

      // Record pre-booking payment record with actual amount paid
      await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: finalAmount,
          currency: 'INR',
          gateway: isMonthly ? 'pre_launch_booking' : 'upi_direct',
          gatewayPaymentId: effectiveUtr,
          gatewayOrderId: `PREBOOK-${subscription.id.slice(0, 8).toUpperCase()}`,
          method: isMonthly ? 'PRE_BOOK' : 'UPI',
          status: 'PRE_BOOK_CONFIRMED',
          paidAt: new Date(),
        },
      });

      return {
        subscriptionId: subscription.id,
        orderId: order.id,
        launchDate: '30 September 2026',
        amount: finalAmount,
        isEarlyBird,
        utr: effectiveUtr,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Checkout Pre-Book Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process pre-booking. Please check your connection and try again.' },
      { status: 500 }
    );
  }
}
