import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deliveryDateParam = searchParams.get('deliveryDate'); // YYYY-MM-DD in IST

    // Compute IST "today" boundaries (UTC = IST - 5:30)
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Key Metrics & Action Counters
    const [
      totalCustomers,
      activeSubs,
      todaysOrders,
      deliveredToday,
      failedToday,
      unassignedOrdersCount,
      needsVerificationCount,
      doubleVerifiedCount,
      activeRidersCount,
      allActiveSubs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({
        where: {
          deliveryDate: { gte: today, lt: tomorrow },
        },
      }),
      prisma.order.count({
        where: {
          deliveryDate: { gte: today, lt: tomorrow },
          status: 'DELIVERED',
        },
      }),
      prisma.order.count({
        where: {
          deliveryDate: { gte: today, lt: tomorrow },
          status: 'FAILED',
        },
      }),
      prisma.order.count({
        where: {
          riderId: null,
          status: { in: ['QUEUED', 'PENDING'] },
        },
      }),
      prisma.order.count({
        where: {
          status: 'RIDER_DELIVERED',
        },
      }),
      prisma.order.count({
        where: {
          status: 'DELIVERED',
          adminVerifiedAt: { not: null },
        },
      }),
      prisma.rider.count({ where: { active: true } }),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { product: true },
      }),
    ]);

    const deliveryRate = todaysOrders > 0 ? ((deliveredToday / todaysOrders) * 100).toFixed(1) : '100.0';

    let monthlyRevenue = 0;
    allActiveSubs.forEach((sub) => {
      monthlyRevenue += sub.product.price;
    });

    // 2. Systematic Orders List — filtered by DELIVERY DATE (not placed date)
    // IST midnight = UTC midnight - 5h30m
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

    let deliveryDateStart: Date;
    let deliveryDateEnd: Date;

    if (deliveryDateParam) {
      // Parse as IST date: e.g. "2026-09-27" → IST midnight → UTC
      deliveryDateStart = new Date(new Date(`${deliveryDateParam}T00:00:00+05:30`).getTime());
      deliveryDateEnd = new Date(new Date(`${deliveryDateParam}T23:59:59+05:30`).getTime());
    } else {
      // Default: today in IST
      const todayIST = new Date(now.getTime() + IST_OFFSET_MS);
      const yyyy = todayIST.getUTCFullYear();
      const mm = String(todayIST.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(todayIST.getUTCDate()).padStart(2, '0');
      deliveryDateStart = new Date(`${yyyy}-${mm}-${dd}T00:00:00+05:30`);
      deliveryDateEnd = new Date(`${yyyy}-${mm}-${dd}T23:59:59+05:30`);
    }

    const rawOrders = await prisma.order.findMany({
      where: {
        deliveryDate: {
          gte: deliveryDateStart,
          lte: deliveryDateEnd,
        },
      },
      take: 500,
      orderBy: { deliveryTime: 'asc' },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, allergies: true, fitnessGoal: true, dietaryPreference: true } },
        address: true,
        subscription: {
          include: {
            product: { select: { name: true, calories: true, type: true } },
          },
        },
        rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
      },
    });

    const orders = rawOrders.map((o) => {
      const street = o.address?.street || 'Patna Hub';
      const mapsMatch = street.match(/https:\/\/maps\.google\.com\/\?q=[^\]\s]+/);
      let mapsUrl = mapsMatch ? mapsMatch[0] : null;

      const gpsMatch = street.match(/📍 GPS:\s*([0-9.-]+),\s*([0-9.-]+)/);
      let gpsCoords = null;
      if (gpsMatch) {
        gpsCoords = `${gpsMatch[1]}, ${gpsMatch[2]}`;
        if (!mapsUrl) {
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${gpsMatch[1]},${gpsMatch[2]}`;
        }
      }
      const cleanStreet = street.replace(/\s*\[📍 GPS:.*?\]/, '').trim();

      return {
        id: o.id,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        deliveryDate: o.deliveryDate.toISOString(),
        deliveryTime: o.deliveryTime || '07:00 AM',
        deliveryNote: o.deliveryNote,
        deliveredAt: o.deliveredAt?.toISOString() || null,
        riderDeliveredAt: o.riderDeliveredAt?.toISOString() || null,
        adminVerifiedAt: o.adminVerifiedAt?.toISOString() || null,
        user: {
          id: o.user.id,
          name: o.user.name || 'Patna Customer',
          phone: o.user.phone || '',
          email: o.user.email,
          allergies: o.user.allergies || null,
          fitnessGoal: o.user.fitnessGoal || null,
          dietaryPreference: o.user.dietaryPreference || null,
        },
        address: {
          id: o.address?.id,
          street: cleanStreet,
          pincode: o.address?.pincode || '800001',
          city: o.address?.city || 'Patna',
          gpsCoords,
          mapsUrl,
        },
        subscription: o.subscription
          ? {
              id: o.subscription.id,
              status: o.subscription.status,
              bundleType: o.subscription.bundleType,
              deliveriesLeft: o.subscription.deliveriesLeft,
              utr: o.subscription.utr,
              product: o.subscription.product,
            }
          : null,
        riderId: o.riderId,
        rider: o.rider,
      };
    });

    // 3. Fleet & Riders Roster (with today's workload and status)
    const rawRiders = await prisma.rider.findMany({
      include: {
        assignedZone: true,
        deliveries: {
          where: {
            deliveryDate: { gte: today, lt: tomorrow },
          },
          select: { id: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const riders = rawRiders.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      vehicleType: r.vehicleType || 'Bike',
      vehicleNumber: r.vehicleNumber || 'BR-01-XX',
      active: r.active,
      assignedZone: r.assignedZone ? { pincode: r.assignedZone.pincode, neighborhood: r.assignedZone.neighborhood } : null,
      todayTotalDrops: r.deliveries.length,
      todayCompletedDrops: r.deliveries.filter((d) => d.status === 'DELIVERED' || d.status === 'RIDER_DELIVERED').length,
    }));

    // 4. Delivery Zones
    const rawZones = await prisma.deliveryZone.findMany({
      include: {
        riders: { select: { id: true, name: true } },
      },
      orderBy: { pincode: 'asc' },
    });

    const zones = rawZones.map((z) => ({
      id: z.id,
      pincode: z.pincode,
      neighborhood: z.neighborhood || 'Patna Zone',
      city: z.city,
      state: z.state,
      isActive: z.isActive,
      ridersCount: z.riders.length,
      riders: z.riders,
    }));

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
            product: { select: { name: true, price: true, calories: true } },
          },
          orderBy: { createdAt: 'desc' },
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

      cleanStreet = cleanStreet.replace(/\s*\[📍 GPS:.*?\]/, '').trim();

      const latestSub = c.subscriptions[0] || null;

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
        subscription: latestSub
          ? {
              id: latestSub.id,
              status: latestSub.status,
              planName: latestSub.product?.name || 'Diet Bundle',
              utr: latestSub.utr,
              deliveriesLeft: latestSub.deliveriesLeft,
            }
          : null,
        activeSubscription: latestSub?.product?.name || null,
        totalOrders: c.orders.length,
      };
    });

    // 6. Top Meals (Aggregation)
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

    // 7. Orders by Zone (Pincode)
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
      .map(([zone, ordersCount]) => ({ zone, orders: ordersCount }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4);

    return NextResponse.json({
      metrics: {
        totalCustomers,
        activeSubs,
        todaysOrders,
        monthlyRevenue,
        deliveryRate,
        failedToday,
        unassignedOrdersCount,
        needsVerificationCount,
        doubleVerifiedCount,
        activeRidersCount,
      },
      orders,
      riders,
      customers,
      zones,
      topMeals,
      topZones,
    });
  } catch (error) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
