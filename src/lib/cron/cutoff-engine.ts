import { PrismaClient } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * 8:30 PM Order Cutoff Engine
 * This function handles freezing daily orders and generating next-day packing and delivery manifests.
 */
export async function processDailyCutoff() {
  console.log('Starting 8:30 PM Order Cutoff Engine...');
  
  // Define "tomorrow"
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow

  // Find all ACTIVE subscriptions that:
  // 1. Have deliveries left > 0
  // 2. nextDeliveryDate is on or before tomorrow
  const eligibleSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      deliveriesLeft: {
        gt: 0,
      },
      nextDeliveryDate: {
        lte: tomorrow,
      },
    },
    include: {
      pauses: {
        where: {
          // Check if there's an active pause for tomorrow's date
          startDate: { lte: tomorrow },
          OR: [
            { endDate: null },
            { endDate: { gte: tomorrow } }
          ]
        }
      }
    }
  });

  let processedCount = 0;
  let skippedDueToPauseCount = 0;

  for (const sub of eligibleSubscriptions) {
    // 1. Exclude subscriptions that have an active record in SubscriptionPause
    if (sub.pauses.length > 0) {
      skippedDueToPauseCount++;
      continue;
    }

    // Wrap the order creation and subscription update in a transaction
    await prisma.$transaction(async (tx) => {
      // 2. Create Order record marked QUEUED for tomorrow's date
      await tx.order.create({
        data: {
          subscriptionId: sub.id,
          userId: sub.userId,
          addressId: sub.addressId,
          status: 'QUEUED',
          deliveryDate: tomorrow,
        }
      });

      // 3. Decrement deliveriesLeft and advance nextDeliveryDate
      // Assuming a daily delivery cadence. For 15/30-day packs, this will decrement by 1 each day.
      const newNextDeliveryDate = new Date(sub.nextDeliveryDate);
      newNextDeliveryDate.setDate(newNextDeliveryDate.getDate() + 1);

      // If deliveriesLeft hits 1 before this update, it will become 0 and the subscription
      // should theoretically be marked COMPLETE/PAUSED, but we leave it ACTIVE for now to handle
      // renewal workflows or simply let the cron ignore it next time due to deliveriesLeft > 0 check.
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          deliveriesLeft: sub.deliveriesLeft - 1,
          nextDeliveryDate: newNextDeliveryDate,
        }
      });
    });

    processedCount++;
  }

  console.log(`Cutoff Engine Complete: Processed ${processedCount} orders, Skipped ${skippedDueToPauseCount} due to active pauses.`);
  
  return { 
    processedCount, 
    skippedDueToPauseCount,
    executionDate: new Date()
  };
}
