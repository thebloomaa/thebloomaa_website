import { prisma } from '../prisma';

/**
 * 8:30 PM Order Cutoff Engine
 * 
 * Responsibilities:
 * 1. Freezes daily active orders at 8:30 PM for next-morning (5:00 AM – 8:00 AM) delivery.
 * 2. Enforces the "6+1 Double Drop" logistics rule for the "Just Bloomed 7D Trial":
 *    - When an ACTIVE trial subscription reaches `deliveriesLeft === 2`, decrement by 2 (setting deliveriesLeft to 0 and status to COMPLETED).
 *    - Appends "6+1 BUNDLE DROP: Deliver Box 6 and Box 7 together" to Order.deliveryNote.
 * 3. QA Safeguard: Standard 7, 15, and 30-day subscriptions strictly decrement by 1 day at a time.
 * 4. Respects active customer pauses (SubscriptionPause).
 */
export async function processDailyCutoff() {
  console.log('[Cutoff Engine] Starting 8:30 PM Order Cutoff processing...');

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Normalized start of tomorrow

  // Fetch all active subscriptions eligible for next-day delivery
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
      product: true,
      pauses: {
        where: {
          startDate: { lte: tomorrow },
          OR: [
            { endDate: null },
            { endDate: { gte: tomorrow } },
          ],
        },
      },
    },
  });

  let processedCount = 0;
  let doubleDropCount = 0;
  let standardDecrementCount = 0;
  let skippedDueToPauseCount = 0;

  for (const sub of eligibleSubscriptions) {
    // 1. Skip subscriptions with an active pause record
    if (sub.pauses.length > 0) {
      skippedDueToPauseCount++;
      continue;
    }

    const isJustBloomedTrial = 
      sub.product.name.toLowerCase().includes('just bloomed') ||
      sub.product.dietaryPreference === 'LIVING_RAW' ||
      sub.product.type === 'TRIAL_PLAN';

    await prisma.$transaction(async (tx) => {
      // 2. Determine if 6+1 Double Drop applies (ONLY on Just Bloomed Trial when deliveriesLeft === 2)
      if (isJustBloomedTrial && sub.deliveriesLeft === 2) {
        // This is delivery day 6 of the 6 active days: deliver Box 6 + Box 7 together
        await tx.order.create({
          data: {
            subscriptionId: sub.id,
            userId: sub.userId,
            addressId: sub.addressId,
            status: 'QUEUED',
            deliveryDate: tomorrow,
            deliveryTime: sub.deliveryTime || '06:00',
            deliveryNote: '6+1 BUNDLE DROP: Deliver Box 6 and Box 7 together',
          },
        });

        // Decrement by 2, complete the trial subscription
        await tx.subscription.update({
          where: { id: sub.id },
          data: {
            deliveriesLeft: 0,
            status: 'COMPLETED',
          },
        });

        doubleDropCount++;
      } else {
        // 3. Standard Delivery: Decrement exactly by 1 (For standard 7/15/30D plans, or earlier trial days)
        await tx.order.create({
          data: {
            subscriptionId: sub.id,
            userId: sub.userId,
            addressId: sub.addressId,
            status: 'QUEUED',
            deliveryDate: tomorrow,
            deliveryTime: sub.deliveryTime || '06:00',
            deliveryNote: isJustBloomedTrial 
              ? `Day ${7 - sub.deliveriesLeft + 1} of 7 Living Raw Box`
              : null,
          },
        });

        const newDeliveriesLeft = sub.deliveriesLeft - 1;
        const newNextDeliveryDate = new Date(sub.nextDeliveryDate);
        newNextDeliveryDate.setDate(newNextDeliveryDate.getDate() + 1);

        await tx.subscription.update({
          where: { id: sub.id },
          data: {
            deliveriesLeft: newDeliveriesLeft,
            status: newDeliveriesLeft <= 0 ? 'COMPLETED' : 'ACTIVE',
            nextDeliveryDate: newNextDeliveryDate,
          },
        });

        standardDecrementCount++;
      }
    });

    processedCount++;
  }

  console.log(
    `[Cutoff Engine] Complete: Processed ${processedCount} orders. Standard: ${standardDecrementCount}, 6+1 Double Drops: ${doubleDropCount}, Paused: ${skippedDueToPauseCount}`
  );

  return {
    processedCount,
    standardDecrementCount,
    doubleDropCount,
    skippedDueToPauseCount,
    executionDate: new Date(),
  };
}
