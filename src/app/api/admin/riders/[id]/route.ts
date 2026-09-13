import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Context {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/riders/[id] - Update rider details or zone assignment
export async function PATCH(request: Request, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, phone, passcode, vehicleType, vehicleNumber, assignedZoneId, active } = body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (phone !== undefined) data.phone = phone.replace(/\D/g, '').slice(-10);
    if (passcode !== undefined && passcode.trim().length === 6) data.passcode = passcode.trim();
    if (vehicleType !== undefined) data.vehicleType = vehicleType;
    if (vehicleNumber !== undefined) data.vehicleNumber = vehicleNumber ? vehicleNumber.trim() : null;
    if (assignedZoneId !== undefined) data.assignedZoneId = assignedZoneId || null;
    if (active !== undefined) data.active = Boolean(active);

    const updated = await prisma.rider.update({
      where: { id },
      data,
      include: { assignedZone: true },
    });

    return NextResponse.json({ success: true, rider: updated });
  } catch (error) {
    console.error('Error updating rider:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/riders/[id] - Delete a rider
export async function DELETE(request: Request, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Unassign any orders assigned to this rider first
    await prisma.order.updateMany({
      where: { riderId: id },
      data: { riderId: null },
    });

    await prisma.rider.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rider:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
