import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NotificationService } from '@/lib/notifications';

// GET /api/cron/expiry
// Finds subscriptions with 3 or fewer deliveries left and triggers warnings or auto-renewals
export async function GET(request: Request) {
  try {
    // 1. Find all active subscriptions nearing expiry (e.g., 3 days left)
    const expiringSubs = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        deliveriesLeft: {
          lte: 3,
          gt: 0,
        },
      },
      include: {
        user: true,
        product: true,
      },
    });

    let warningsSent = 0;
    let autoRenewalsTriggered = 0;

    for (const sub of expiringSubs) {
      if (!sub.user.phone) continue;

      if (sub.deliveriesLeft === 3) {
        // Send warning 3 days before expiry
        await NotificationService.notifyBundleExpiryWarning(
          sub.user.phone,
          sub.user.name || 'Customer',
          sub.deliveriesLeft
        );
        warningsSent++;
      } else if (sub.deliveriesLeft === 1) {
        // Mock AutoPay Trigger (In real app, this calls Razorpay/PhonePe API)
        console.log(`[MOCK AutoPay] Attempting to charge subscription ${sub.id} for renewal.`);
        
        // Simulate successful charge
        const renewedStatus = true; 

        if (renewedStatus) {
          await NotificationService.notifyAutoPaySuccess(
            sub.user.phone,
            sub.user.name || 'Customer',
            sub.product.price.toString(),
            'Tomorrow'
          );
          autoRenewalsTriggered++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      expiringFound: expiringSubs.length,
      warningsSent,
      autoRenewalsTriggered,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Expiry Cron API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
