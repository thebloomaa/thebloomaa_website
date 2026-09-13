import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [zones, allRiders] = await Promise.all([
      prisma.deliveryZone.findMany({
        orderBy: { pincode: 'asc' },
        include: {
          riders: {
            where: { active: true },
            select: { id: true, name: true, phone: true, vehicleType: true, active: true },
          },
        },
      }),
      prisma.rider.findMany({
        where: { active: true },
        select: { id: true, name: true, phone: true, vehicleType: true, assignedZoneId: true },
      }),
    ]);

    // Count active subscriptions per zone
    const stats = await prisma.subscription.groupBy({
      by: ['addressId'],
      where: { status: 'ACTIVE' },
      _count: true,
    });

    const addresses = await prisma.address.findMany({
      where: { id: { in: stats.map((s) => s.addressId) } },
    });

    const pincodeCounts: Record<string, number> = {};
    for (const stat of stats) {
      const address = addresses.find((a) => a.id === stat.addressId);
      if (address) {
        pincodeCounts[address.pincode] = (pincodeCounts[address.pincode] || 0) + stat._count;
      }
    }

    const zonesWithOrders = zones.map((z) => ({
      ...z,
      orders: pincodeCounts[z.pincode] || 0,
      assignedRider: z.riders[0] || null,
    }));

    return NextResponse.json({ zones: zonesWithOrders, allRiders });
  } catch (error) {
    console.error('Admin Zones API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pincode, neighborhood, city, state } = body;

    const zone = await prisma.deliveryZone.create({
      data: { pincode, neighborhood, city, state, isActive: true },
    });

    return NextResponse.json({ zone });
  } catch (error) {
    console.error('Create Zone Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
