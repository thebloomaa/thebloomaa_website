import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Key Metrics
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const activeSubs = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
    const todaysOrders = await prisma.order.count({
      where: {
        deliveryDate: { gte: today, lt: tomorrow },
      },
    });

    const deliveredToday = await prisma.order.count({
      where: {
        deliveryDate: { gte: today, lt: tomorrow },
        status: 'DELIVERED',
      },
    });
    const failedToday = await prisma.order.count({
      where: {
        deliveryDate: { gte: today, lt: tomorrow },
        status: 'FAILED',
      },
    });
    const deliveryRate = todaysOrders > 0 ? ((deliveredToday / todaysOrders) * 100).toFixed(1) : '100.0';

    // Approximate Monthly Revenue
    const allActiveSubs = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { product: true },
    });
    let monthlyRevenue = 0;
    allActiveSubs.forEach((sub) => {
      monthlyRevenue += sub.product.price;
    });

    // 2. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, phone: true } },
        subscription: { include: { product: { select: { name: true } } } },
      },
    });

    // 3. Top Meals (Aggregation)
    const productStats = await prisma.subscription.groupBy({
      by: ['productId'],
      where: { status: 'ACTIVE' },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 4,
    });

    const topMeals = [];
    const totalActive = activeSubs > 0 ? activeSubs : 1;
    for (const stat of productStats) {
      const prod = await prisma.product.findUnique({ where: { id: stat.productId }, select: { name: true } });
      topMeals.push({
        name: prod?.name || 'Meal Plan',
        subs: stat._count.productId,
        pct: Math.round((stat._count.productId / totalActive) * 100),
      });
    }

    // 4. Orders by Zone (Pincode)
    const todayOrdersAll = await prisma.order.findMany({
      where: { deliveryDate: { gte: today, lt: tomorrow } },
      include: { address: { select: { pincode: true } } },
    });
    const zoneCounts: Record<string, number> = {};
    todayOrdersAll.forEach((o) => {
      const pin = o.address.pincode;
      zoneCounts[pin] = (zoneCounts[pin] || 0) + 1;
    });
    const topZones = Object.entries(zoneCounts)
      .map(([zone, orders]) => ({ zone, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4);

    // 5. Customer Directory (All Registered Members)
    const rawCustomers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
        subscriptions: {
          include: {
            product: { select: { name: true } },
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const customers = rawCustomers.map((c) => {
      const addr = c.addresses[0];
      const street = addr?.street || 'No street saved';

      // Parse GPS link or coordinates if embedded
      let mapsUrl: string | null = null;
      let cleanStreet = street;

      const mapsMatch = street.match(/https:\/\/maps\.google\.com\/\?q=[^\]\s]+/);
      if (mapsMatch) {
        mapsUrl = mapsMatch[0];
      }

      const gpsMatch = street.match(/📍 GPS:\s*([0-9.-]+),\s*([0-9.-]+)/);
      let gpsCoords = null;
      if (gpsMatch) {
        gpsCoords = `${gpsMatch[1]}, ${gpsMatch[2]}`;
        if (!mapsUrl) {
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${gpsMatch[1]},${gpsMatch[2]}`;
        }
      }

      // Remove the bracketed GPS metadata for clean street display
      cleanStreet = cleanStreet.replace(/\s*\[📍 GPS:.*?\]/, '').trim();

      return {
        id: c.id,
        name: c.name || 'Member',
        email: c.email,
        phone: c.phone || 'N/A',
        fitnessGoal: c.fitnessGoal || 'FITNESS',
        dietaryPreference: c.dietaryPreference || 'VEG',
        allergies: c.allergies || 'None',
        age: c.age,
        gender: c.gender,
        createdAt: c.createdAt.toISOString(),
        address: {
          street: cleanStreet,
          pincode: addr?.pincode || '800001',
          city: addr?.city || 'Patna',
          gpsCoords,
          mapsUrl,
        },
        activeSubscription: c.subscriptions[0]?.product?.name || null,
        totalOrders: c.orders.length,
      };
    });

    return NextResponse.json({
      metrics: {
        totalCustomers,
        activeSubs,
        todaysOrders,
        monthlyRevenue,
        deliveryRate,
        failedToday,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customer: o.user.name || 'Member',
        phone: o.user.phone || '',
        meal: o.subscription?.product.name || 'Macro Meal',
        status: o.status,
        time: o.deliveryTime || '07:00 AM',
      })),
      topMeals,
      topZones,
      customers,
    });
  } catch (error) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
