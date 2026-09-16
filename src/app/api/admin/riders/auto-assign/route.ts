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

    // Look at orders scheduled for today or tomorrow (upcoming morning deliveries)
    const windowEnd = new Date(today);
    windowEnd.setDate(today.getDate() + 2);
    windowEnd.setHours(0, 0, 0, 0);

    // 1. Fetch all active riders with their assigned zones
    const activeRiders = await prisma.rider.findMany({
      where: { active: true },
      include: { assignedZone: true },
    });

    if (activeRiders.length === 0) {
      return NextResponse.json(
        { error: 'No active delivery riders found in fleet.' },
        { status: 400 }
      );
    }

    // Map pincode to riderId
    const pinToRiderId: Record<string, string> = {};
    for (const r of activeRiders) {
      if (r.assignedZone?.pincode) {
        pinToRiderId[r.assignedZone.pincode] = r.id;
      }
    }

    // Default primary fallback rider for unzoned orders
    const fallbackRider = activeRiders[0];

    // 2. Fetch unassigned queued orders
    const unassignedOrders = await prisma.order.findMany({
      where: {
        riderId: null,
        status: 'QUEUED',
        deliveryDate: { gte: today, lt: windowEnd },
      },
      include: {
        address: true,
      },
    });

    let assignedCount = 0;
    let fallbackAssignedCount = 0;

    for (const order of unassignedOrders) {
      const orderPin = order.address?.pincode || '';
      let targetRiderId = pinToRiderId[orderPin];
      let noteAddition = '';

      if (!targetRiderId && fallbackRider) {
        targetRiderId = fallbackRider.id;
        noteAddition = ` [Fleet Pool: Assigned to ${fallbackRider.name}]`;
        fallbackAssignedCount++;
      }

      if (targetRiderId) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            riderId: targetRiderId,
            deliveryNote: noteAddition
              ? order.deliveryNote
                ? `${order.deliveryNote}${noteAddition}`
                : noteAddition.trim()
              : order.deliveryNote,
          },
        });
        assignedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      assignedCount,
      fallbackAssignedCount,
      totalUnassigned: unassignedOrders.length,
      remainingUnassigned: unassignedOrders.length - assignedCount,
    });
  } catch (error) {
    console.error('Error in auto-assigning orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
