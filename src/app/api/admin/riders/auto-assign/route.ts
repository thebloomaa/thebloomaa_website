import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/admin/riders/auto-assign - Automatically match unassigned orders to zone riders
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Fetch active riders that have an assigned zone
    const riders = await prisma.rider.findMany({
      where: {
        active: true,
        assignedZoneId: { not: null },
      },
      include: {
        assignedZone: true,
      },
    });

    // Map pincode to riderId
    const pinToRiderId: Record<string, string> = {};
    for (const r of riders) {
      if (r.assignedZone?.pincode) {
        pinToRiderId[r.assignedZone.pincode] = r.id;
      }
    }

    // 2. Fetch unassigned orders for today
    const unassignedOrders = await prisma.order.findMany({
      where: {
        riderId: null,
        deliveryDate: { gte: today, lt: tomorrow },
      },
      include: {
        address: true,
      },
    });

    let assignedCount = 0;

    for (const order of unassignedOrders) {
      const orderPin = order.address?.pincode;
      const riderId = pinToRiderId[orderPin];

      if (riderId) {
        await prisma.order.update({
          where: { id: order.id },
          data: { riderId },
        });
        assignedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      assignedCount,
      totalUnassigned: unassignedOrders.length,
      remainingUnassigned: unassignedOrders.length - assignedCount,
    });
  } catch (error) {
    console.error('Error in auto-assigning orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
