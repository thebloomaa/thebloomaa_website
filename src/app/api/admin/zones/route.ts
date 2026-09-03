import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const zones = await prisma.deliveryZone.findMany({
      orderBy: { pincode: 'asc' }
    });

    // Count active subscriptions per zone (approximate orders per day)
    const stats = await prisma.subscription.groupBy({
      by: ['addressId'],
      where: { status: 'ACTIVE' },
      _count: true
    });

    // Map address to pincode to get order counts
    // For a real app, this would be a proper join or aggregation query.
    // For this MVP, we'll fetch addresses and match.
    const addresses = await prisma.address.findMany({
      where: { id: { in: stats.map(s => s.addressId) } }
    });

    const pincodeCounts: Record<string, number> = {};
    for (const stat of stats) {
      const address = addresses.find(a => a.id === stat.addressId);
      if (address) {
        pincodeCounts[address.pincode] = (pincodeCounts[address.pincode] || 0) + stat._count;
      }
    }

    const zonesWithOrders = zones.map(z => ({
      ...z,
      orders: pincodeCounts[z.pincode] || 0
    }));

    return NextResponse.json({ zones: zonesWithOrders });
  } catch (error) {
    console.error('Admin Zones API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pincode, neighborhood, city, state } = body;

    const zone = await prisma.deliveryZone.create({
      data: { pincode, neighborhood, city, state, isActive: true }
    });

    return NextResponse.json({ zone });
  } catch (error) {
    console.error('Create Zone Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
