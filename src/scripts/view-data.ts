import { prisma } from '../lib/prisma';

async function main() {
  const userCount = await prisma.user.count();
  const addressCount = await prisma.address.count();
  const subCount = await prisma.subscription.count();
  const orderCount = await prisma.order.count();
  const otpCount = await prisma.otp.count();

  console.log('=== DATABASE AUDIT SUMMARY ===');
  console.log(`Users: ${userCount}`);
  console.log(`Addresses: ${addressCount}`);
  console.log(`Subscriptions: ${subCount}`);
  console.log(`Orders: ${orderCount}`);
  console.log(`OTPs: ${otpCount}`);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      addresses: true,
      subscriptions: true,
      orders: true,
    },
  });

  console.log('\n=== RECENT 5 USERS & SAVED DETAILS ===');
  console.log(JSON.stringify(recentUsers, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
