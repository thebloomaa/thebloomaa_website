import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/rider/manifest
// Returns today's stops for the authenticated rider
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const session = await getServerSession(authOptions);
    const isAdmin = Boolean(session?.user && (session.user as any).role === 'ADMIN');

    let riderId = searchParams.get('riderId') || cookieStore.get('thebloomaa_rider_id')?.value;

    let rider = null;
    if (riderId) {
      rider = await prisma.rider.findUnique({
        where: { id: riderId },
        include: { assignedZone: true },
      });
    }

    // Admin previewing manifest fallback
    if (!rider && isAdmin) {
      rider = await prisma.rider.findFirst({
        where: { active: true },
        include: { assignedZone: true },
      });
      if (rider) {
        riderId = rider.id;
      }
    }

    if (!rider) {
      return NextResponse.json(
        { error: 'Unauthorized: Rider sign-in required to view delivery manifest' },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Find orders assigned to this rider OR matching their assigned zone pincode
    const orders = await prisma.order.findMany({
      where: {
        deliveryDate: {
          gte: today,
          lt: tomorrow,
        },
        OR: [
          ...(riderId ? [{ riderId }] : []),
          ...(rider?.assignedZone?.pincode
            ? [{ address: { pincode: rider.assignedZone.pincode } }]
            : []),
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
            dietaryPreference: true,
          },
        },
        address: true,
        subscription: {
          include: {
            product: {
              select: {
                name: true,
                calories: true,
                type: true,
                dietaryPreference: true,
              },
            },
          },
        },
      },
      orderBy: [{ address: { street: 'asc' } }, { createdAt: 'asc' }],
    });

    const stops = orders.map((o, idx) => {
      const rawStreet = o.address?.street || 'Local delivery address';

      // Parse Google Maps URL if present
      let mapsUrl: string | null = null;
      let cleanStreet = rawStreet;

      const mapsMatch = rawStreet.match(/https:\/\/maps\.google\.com\/\?q=[^\]\s]+/);
      if (mapsMatch) {
        mapsUrl = mapsMatch[0];
      }

      const gpsMatch = rawStreet.match(/📍 GPS:\s*([0-9.-]+),\s*([0-9.-]+)/);
      let gpsCoords: string | null = null;
      if (gpsMatch) {
        gpsCoords = `${gpsMatch[1]}, ${gpsMatch[2]}`;
        if (!mapsUrl) {
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${gpsMatch[1]},${gpsMatch[2]}`;
        }
      }

      // Default fallback search query for maps
      if (!mapsUrl) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${rawStreet}, Patna ${o.address?.pincode || '800001'}`
        )}`;
      }

      cleanStreet = cleanStreet.replace(/\s*\[📍 GPS:.*?\]/, '').trim();

      return {
        id: o.id,
        stopNumber: idx + 1,
        customer: o.user?.name || 'Customer',
        phone: o.user?.phone || '',
        street: cleanStreet,
        pincode: o.address?.pincode || '800001',
        city: o.address?.city || 'Patna',
        gpsCoords,
        mapsUrl,
        meal: o.subscription?.product?.name || 'Custom Macro Prep',
        calories: o.subscription?.product?.calories || 520,
        dietary: o.subscription?.product?.dietaryPreference || o.user?.dietaryPreference || 'VEG',
        time: o.deliveryTime || '07:00 AM',
        deliveryNote: o.deliveryNote,
        status: o.status, // QUEUED | DELIVERED | FAILED
      };
    });

    return NextResponse.json({
      date: today.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      rider: rider
        ? {
            id: rider.id,
            name: rider.name,
            phone: rider.phone,
            vehicleType: rider.vehicleType || 'Bike',
            vehicleNumber: rider.vehicleNumber || 'Unregistered',
            assignedZone: rider.assignedZone
              ? `${rider.assignedZone.neighborhood} (${rider.assignedZone.pincode})`
              : 'All Patna',
          }
        : null,
      stops,
      totalStops: stops.length,
      deliveredCount: stops.filter((s) => s.status === 'DELIVERED' || s.status === 'RIDER_DELIVERED').length,
      failedCount: stops.filter((s) => s.status === 'FAILED').length,
      pendingCount: stops.filter((s) => s.status === 'QUEUED' || s.status === 'OUT_FOR_DELIVERY').length,
    });
  } catch (error) {
    console.error('Manifest API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/rider/manifest
// Update order status from rider mobile interface: transitions to RIDER_DELIVERED
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    // When rider marks delivered, transition to RIDER_DELIVERED for admin double-verification
    const effectiveStatus = status === 'DELIVERED' ? 'RIDER_DELIVERED' : status;
    const data: any = { status: effectiveStatus };

    if (status === 'DELIVERED') {
      data.riderDeliveredAt = new Date();
      data.deliveredAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data,
      include: { subscription: true },
    });

    // If subscription was PENDING, promote to ACTIVE once delivered
    if (updatedOrder.subscriptionId && status === 'DELIVERED') {
      await prisma.subscription.update({
        where: { id: updatedOrder.subscriptionId },
        data: { status: 'ACTIVE' },
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
