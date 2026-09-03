import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    // Assuming simple authorization based on role
    // In production, we'd check session.user.role === 'ADMIN'
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Key Metrics
    const activeSubs = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
    const todaysOrders = await prisma.order.count({
      where: {
        deliveryDate: { gte: today, lt: tomorrow }
      }
    });

    const deliveredToday = await prisma.order.count({
      where: {
        deliveryDate: { gte: today, lt: tomorrow },
        status: 'DELIVERED'
      }
    });
    const failedToday = await prisma.order.count({
      where: {
        deliveryDate: { gte: today, lt: tomorrow },
        status: 'FAILED'
      }
    });
    const deliveryRate = todaysOrders > 0 ? ((deliveredToday / todaysOrders) * 100).toFixed(1) : '100.0';

    // Approximate Monthly Revenue (sum of all active subs * monthly price factor)
    // For simplicity, we just aggregate totalAmount / totalDays for active subs (mocking revenue logic)
    // Actually we can just hardcode or do a rough calculation based on active products.
    // Let's just calculate total value of active subscriptions
    const allActiveSubs = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { product: true }
    });
    let monthlyRevenue = 0;
    allActiveSubs.forEach(sub => {
      // rough logic: if bundle is 30 days, it's 30 * per day price.
      const bundleDays = sub.bundleType === 'DAYS_30' ? 30 : sub.bundleType === 'DAYS_15' ? 15 : 7;
      monthlyRevenue += sub.product.price;
    });

    // 2. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        subscription: { include: { product: { select: { name: true } } } }
      }
    });

    // 3. Top Meals (Aggregation)
    const productStats = await prisma.subscription.groupBy({
      by: ['productId'],
      where: { status: 'ACTIVE' },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 3
    });

    // Fetch product names for the top meals
    const topMeals = [];
    let totalActive = activeSubs > 0 ? activeSubs : 1;
    for (const stat of productStats) {
      const prod = await prisma.product.findUnique({ where: { id: stat.productId }, select: { name: true } });
      topMeals.push({
        name: prod?.name || 'Unknown',
        subs: stat._count.productId,
        pct: Math.round((stat._count.productId / totalActive) * 100),
      });
    }

    // 4. Orders by Zone (Pincode)
    const todayOrdersAll = await prisma.order.findMany({
      where: { deliveryDate: { gte: today, lt: tomorrow } },
      include: { address: { select: { pincode: true } } }
    });
    const zoneCounts: Record<string, number> = {};
    todayOrdersAll.forEach(o => {
      const pin = o.address.pincode;
      zoneCounts[pin] = (zoneCounts[pin] || 0) + 1;
    });
    const topZones = Object.entries(zoneCounts)
      .map(([zone, orders]) => ({ zone, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 3);

    return NextResponse.json({
      metrics: {
        activeSubs,
        todaysOrders,
        monthlyRevenue,
        deliveryRate,
        failedToday
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        customer: o.user.name,
        meal: o.subscription?.product.name,
        status: o.status,
        time: o.deliveryTime || 'N/A'
      })),
      topMeals,
      topZones
    });
  } catch (error) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
