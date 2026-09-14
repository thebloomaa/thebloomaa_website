import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BLOOMAA_PRODUCTS } from '@/lib/bioCalculator';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, address, bundleType, deliveryTime, utr, deliveryNote } = body;

    if (!address || !address.street || !address.pincode) {
      return NextResponse.json({ error: 'Delivery address and pincode are required.' }, { status: 400 });
    }

    // 1. Resolve and ensure product exists in database
    let product = await prisma.product.findUnique({
      where: { id: productId || 'prod-just-bloomed-7d-trial' },
    });

    if (!product) {
      // Find preset by ID or name
      const preset = Object.values(BLOOMAA_PRODUCTS).find(
        (p) => p.id === productId || p.name.toLowerCase() === (productId || '').toLowerCase()
      );

      if (preset) {
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
      } else {
        // Fallback to any existing product
        product = await prisma.product.findFirst();
      }
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found. Please re-select your diet plan.' }, { status: 404 });
    }

    const bundleDays = bundleType === 'DAYS_30' ? 30 : bundleType === 'DAYS_15' ? 15 : 7;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isTrial =
      product.type === 'TRIAL_PLAN' ||
      product.dietaryPreference === 'LIVING_RAW' ||
      product.name.toLowerCase().includes('trial');

    const totalAmount = isTrial ? 451 : Math.round(product.price * bundleDays);

    const effectiveUtr =
      utr && utr.trim().length >= 6
        ? utr.trim()
        : `DIRECT_UPI_${Date.now().toString().slice(-8)}`;

    // 2. Perform Atomic Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Save address
      const newAddress = await tx.address.create({
        data: {
          userId: (session.user as any).id,
          street: address.street,
          city: address.city || 'Patna',
          state: address.state || 'Bihar',
          pincode: address.pincode,
          isDefault: true,
        },
      });

      // Create subscription
      const subscription = await tx.subscription.create({
        data: {
          userId: (session.user as any).id,
          productId: product.id,
          addressId: newAddress.id,
          bundleType: isTrial ? 'DAYS_7' : (bundleType || 'DAYS_15'),
          deliveriesLeft: isTrial ? 7 : bundleDays,
          status: 'PENDING', // Awaiting verification
          utr: effectiveUtr,
          startDate: new Date(),
          nextDeliveryDate: tomorrow,
          deliveryTime: deliveryTime || '07:00 AM',
        },
      });

      // Create first order
      const order = await tx.order.create({
        data: {
          subscriptionId: subscription.id,
          userId: (session.user as any).id,
          addressId: newAddress.id,
          status: 'QUEUED',
          deliveryDate: tomorrow,
          deliveryTime: deliveryTime || '07:00 AM',
          deliveryNote: deliveryNote || (isTrial ? 'Just Bloomed 7D Trial Morning Delivery' : null),
        },
      });

      // Record direct UPI payment record
      await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: totalAmount,
          currency: 'INR',
          gateway: 'direct_upi',
          gatewayPaymentId: effectiveUtr,
          gatewayOrderId: `SUB-${subscription.id.slice(0, 8).toUpperCase()}`,
          method: 'UPI',
          status: effectiveUtr.startsWith('DIRECT_UPI_') ? 'AWAITING_VERIFICATION' : 'UTR_SUBMITTED',
          paidAt: new Date(),
        },
      });

      return { subscriptionId: subscription.id, orderId: order.id };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process checkout. Please check your connection and try again.' },
      { status: 500 }
    );
  }
}

