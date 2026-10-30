import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BLOOMAA_PRODUCTS } from '@/lib/bioCalculator';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please log in to renew your plan.' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const {
      deliveryTime,
      deliveryNote,
      allergies,
      paymentMode, // 'PAY_ON_DELIVERY' | 'QR_SCAN' | 'UPI_APP'
      utr,
      screenshotUrl,
      addressOverride,
    } = body;

    const effectiveMode = paymentMode || 'PAY_ON_DELIVERY';

    // 1. Get or create product (Just Bloom 7D Trial)
    let product = await prisma.product.findUnique({
      where: { id: 'prod-just-bloomed-7d-trial' },
    });

    if (!product) {
      const preset = BLOOMAA_PRODUCTS.JUST_BLOOMED_TRIAL;
      product = await prisma.product.create({
        data: {
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

    // 2. Fetch user's address
    let address = null;
    if (addressOverride && addressOverride.street && addressOverride.pincode) {
      address = await prisma.address.create({
        data: {
          userId,
          street: addressOverride.street,
          city: addressOverride.city || 'Patna',
          state: addressOverride.state || 'Bihar',
          pincode: addressOverride.pincode,
          isDefault: true,
        },
      });
    } else {
      address = await prisma.address.findFirst({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }],
      });
    }

    if (!address) {
      return NextResponse.json(
        { error: 'No delivery address found. Please provide an address to renew.' },
        { status: 400 }
      );
    }

    // 3. Flat standard pricing for 7-Day Plan: ₹499
    const planPrice = parseInt(process.env.NEXT_PUBLIC_REGULAR_PRICE || '499');
    const finalAmount = planPrice;

    // Validate payment if UPI
    if (effectiveMode !== 'PAY_ON_DELIVERY') {
      const cleanUtr = utr ? String(utr).trim() : '';
      const hasScreenshot = Boolean(screenshotUrl && String(screenshotUrl).trim().length > 0);
      const hasValidUtr = cleanUtr.length >= 8;

      if (!hasValidUtr && !hasScreenshot) {
        return NextResponse.json(
          { error: 'Please enter your UPI UTR / reference number, or attach a payment screenshot to verify your payment.' },
          { status: 400 }
        );
      }
    }

    // 4. Calculate continuity start date
    // Check user's most recent active or queued orders
    const latestOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['QUEUED', 'PACKED', 'OUT_FOR_DELIVERY', 'PENDING'] },
      },
      orderBy: { deliveryDate: 'desc' },
    });

    const now = new Date();
    let renewalStartDate = new Date(now);
    renewalStartDate.setDate(now.getDate() + 1);
    renewalStartDate.setHours(6, 0, 0, 0);

    if (latestOrder && latestOrder.deliveryDate) {
      const latestDate = new Date(latestOrder.deliveryDate);
      if (latestDate >= now) {
        // Schedule next day after the latest scheduled drop
        renewalStartDate = new Date(latestDate);
        renewalStartDate.setDate(latestDate.getDate() + 1);
        renewalStartDate.setHours(6, 0, 0, 0);
      }
    }

    const cleanUtr = utr && String(utr).trim().length >= 6 ? String(utr).trim() : null;
    const effectiveUtr = cleanUtr
      ? cleanUtr
      : effectiveMode === 'PAY_ON_DELIVERY'
      ? `POD_RENEW_${Date.now().toString().slice(-8)}`
      : screenshotUrl
      ? `RECEIPT_RENEW_${Date.now().toString().slice(-8)}`
      : `PENDING_RENEW_${Date.now().toString().slice(-8)}`;

    const modeLabel = effectiveMode === 'QR_SCAN'
      ? 'QR Code Scan'
      : effectiveMode === 'PAY_ON_DELIVERY'
      ? 'Cash on Delivery (COD)'
      : 'UPI App Direct';

    // 5. Database transaction
    const result = await prisma.$transaction(async (tx) => {
      const newSubscription = await tx.subscription.create({
        data: {
          userId,
          productId: product.id,
          addressId: address.id,
          bundleType: 'DAYS_7',
          deliveriesLeft: 7,
          status: 'PENDING',
          utr: effectiveUtr,
          startDate: renewalStartDate,
          nextDeliveryDate: renewalStartDate,
          deliveryTime: deliveryTime || '07:00 AM',
        },
      });

      const proofSnippet = screenshotUrl ? ` | PROOF: ${screenshotUrl}` : '';
      const paymentInfoTag = effectiveMode === 'PAY_ON_DELIVERY'
        ? `[Mode: Cash on Delivery (COD) | To Collect: ₹${finalAmount} | Pay on Delivery | 7D Renewal]`
        : `[Mode: ${modeLabel} | Paid: ₹${finalAmount} | UTR: ${effectiveUtr}${proofSnippet} | 7D Renewal]`;

      const combinedOrderNote = [deliveryNote, paymentInfoTag].filter(Boolean).join(' | ');

      const order = await tx.order.create({
        data: {
          subscriptionId: newSubscription.id,
          userId,
          addressId: address.id,
          status: 'QUEUED',
          deliveryDate: renewalStartDate,
          deliveryTime: deliveryTime || '07:00 AM',
          deliveryNote: `RENEWAL 7D PLAN. ${combinedOrderNote}`,
        },
      });

      if (allergies && typeof allergies === 'string') {
        try {
          await tx.user.update({
            where: { id: userId },
            data: { allergies: allergies.trim() },
          });
        } catch {
          // Non-critical
        }
      }

      await tx.payment.create({
        data: {
          subscriptionId: newSubscription.id,
          amount: finalAmount,
          currency: 'INR',
          gateway: effectiveMode === 'PAY_ON_DELIVERY' ? 'cash_on_delivery' : 'upi_qr_scan',
          gatewayOrderId: effectiveUtr,
          gatewayPaymentId: effectiveUtr,
          method: effectiveMode === 'PAY_ON_DELIVERY' ? 'COD' : 'UPI_QR',
          status: effectiveMode === 'PAY_ON_DELIVERY' ? 'PENDING_ON_DELIVERY' : 'AWAITING_ADMIN_VERIFICATION',
        },
      });

      return { subscription: newSubscription, order };
    });

    return NextResponse.json({
      success: true,
      subscriptionId: result.subscription.id,
      startDate: renewalStartDate.toISOString(),
      message: 'Your 7-day Just Bloom plan has been renewed successfully!',
    });
  } catch (error: any) {
    console.error('Subscription renewal error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process plan renewal.' },
      { status: 500 }
    );
  }
}
