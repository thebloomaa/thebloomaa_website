import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/riders - List all riders with assigned zone and today's delivery metrics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [riders, zones, todaysOrders] = await Promise.all([
      prisma.rider.findMany({
        orderBy: { name: 'asc' },
        include: {
          assignedZone: true,
        },
      }),
      prisma.deliveryZone.findMany({
        where: { isActive: true },
        orderBy: { pincode: 'asc' },
      }),
      prisma.order.findMany({
        where: {
          deliveryDate: { gte: today, lt: tomorrow },
        },
        select: {
          id: true,
          riderId: true,
          status: true,
          address: { select: { pincode: true } },
        },
      }),
    ]);

    // Calculate metrics per rider
    const formattedRiders = riders.map((r) => {
      const riderOrders = todaysOrders.filter((o) => o.riderId === r.id);
      const delivered = riderOrders.filter((o) => o.status === 'DELIVERED').length;
      const failed = riderOrders.filter((o) => o.status === 'FAILED').length;
      const pending = riderOrders.length - delivered - failed;

      return {
        id: r.id,
        name: r.name,
        phone: r.phone,
        passcode: r.passcode || '123456',
        active: r.active,
        vehicleType: r.vehicleType || 'Bike',
        vehicleNumber: r.vehicleNumber || 'Unregistered',
        assignedZone: r.assignedZone
          ? {
              id: r.assignedZone.id,
              pincode: r.assignedZone.pincode,
              neighborhood: r.assignedZone.neighborhood || 'Patna Zone',
              city: r.assignedZone.city,
            }
          : null,
        stats: {
          totalAssigned: riderOrders.length,
          delivered,
          failed,
          pending,
        },
        createdAt: r.createdAt.toISOString(),
      };
    });

    // Unassigned orders count today
    const unassignedOrdersCount = todaysOrders.filter((o) => !o.riderId).length;

    return NextResponse.json({
      riders: formattedRiders,
      zones: zones.map((z) => ({
        id: z.id,
        pincode: z.pincode,
        neighborhood: z.neighborhood || 'Patna Zone',
      })),
      unassignedOrdersCount,
      totalFleetCount: riders.length,
      activeFleetCount: riders.filter((r) => r.active).length,
    });
  } catch (error) {
    console.error('Error fetching admin riders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/riders - Create a new rider
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, passcode, vehicleType, vehicleNumber, assignedZoneId, active } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    // Check if phone already exists
    const existing = await prisma.rider.findUnique({
      where: { phone: cleanPhone },
    });
    if (existing) {
      return NextResponse.json({ error: 'A rider with this mobile number is already registered.' }, { status: 409 });
    }

    // Use assigned passcode or auto-generate a 6-digit random PIN
    const assignedPasscode =
      passcode && passcode.trim().length === 6
        ? passcode.trim()
        : Math.floor(100000 + Math.random() * 900000).toString();

    const rider = await prisma.rider.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        passcode: assignedPasscode,
        vehicleType: vehicleType || 'Bike',
        vehicleNumber: vehicleNumber?.trim() || null,
        assignedZoneId: assignedZoneId || null,
        active: active !== undefined ? Boolean(active) : true,
      },
      include: { assignedZone: true },
    });

    return NextResponse.json({ success: true, rider }, { status: 201 });
  } catch (error) {
    console.error('Error creating rider:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
