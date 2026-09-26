const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== CLEARING ALL BOOKING & ORDER DATA ===');

  // Check counts before deletion
  const ordersBefore = await prisma.order.count();
  const paymentsBefore = await prisma.payment.count();
  const pausesBefore = await prisma.subscriptionPause.count();
  const subsBefore = await prisma.subscription.count();

  console.log(`Found:`);
  console.log(`- Orders: ${ordersBefore}`);
  console.log(`- Payments: ${paymentsBefore}`);
  console.log(`- Subscription Pauses: ${pausesBefore}`);
  console.log(`- Subscriptions: ${subsBefore}`);

  // 1. Delete Orders
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`✓ Deleted ${deletedOrders.count} Order records.`);

  // 2. Delete Payments
  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`✓ Deleted ${deletedPayments.count} Payment records.`);

  // 3. Delete Subscription Pauses
  const deletedPauses = await prisma.subscriptionPause.deleteMany({});
  console.log(`✓ Deleted ${deletedPauses.count} SubscriptionPause records.`);

  // 4. Delete Subscriptions
  const deletedSubs = await prisma.subscription.deleteMany({});
  console.log(`✓ Deleted ${deletedSubs.count} Subscription records.`);

  // Verify counts after deletion
  const ordersAfter = await prisma.order.count();
  const paymentsAfter = await prisma.payment.count();
  const pausesAfter = await prisma.subscriptionPause.count();
  const subsAfter = await prisma.subscription.count();

  console.log('=== PURGE COMPLETE ===');
  console.log(`Remaining Orders: ${ordersAfter}`);
  console.log(`Remaining Payments: ${paymentsAfter}`);
  console.log(`Remaining Subscription Pauses: ${pausesAfter}`);
  console.log(`Remaining Subscriptions: ${subsAfter}`);
}

main()
  .catch((err) => {
    console.error('Error clearing booking data:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
