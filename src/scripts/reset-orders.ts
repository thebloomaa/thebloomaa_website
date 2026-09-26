import { prisma } from '../lib/prisma';

async function resetOrderData() {
  console.log('=== STARTING PURGE OF ALL ORDER & SUBSCRIPTION DATA ===');

  // 1. Delete all delivery orders
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`✓ Deleted ${deletedOrders.count} Order records.`);

  // 2. Delete all payments
  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`✓ Deleted ${deletedPayments.count} Payment records.`);

  // 3. Delete all subscription pauses
  const deletedPauses = await prisma.subscriptionPause.deleteMany({});
  console.log(`✓ Deleted ${deletedPauses.count} SubscriptionPause records.`);

  // 4. Delete all subscriptions
  const deletedSubs = await prisma.subscription.deleteMany({});
  console.log(`✓ Deleted ${deletedSubs.count} Subscription records.`);

  // Verification counts
  const remainingOrders = await prisma.order.count();
  const remainingSubs = await prisma.subscription.count();
  const remainingPayments = await prisma.payment.count();

  console.log('=== PURGE COMPLETE ===');
  console.log(`Remaining Orders in DB: ${remainingOrders}`);
  console.log(`Remaining Subscriptions in DB: ${remainingSubs}`);
  console.log(`Remaining Payments in DB: ${remainingPayments}`);
}

resetOrderData()
  .catch((e) => {
    console.error('Failed to reset order data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
