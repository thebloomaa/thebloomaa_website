import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const deliveryDateParam = searchParams.get('deliveryDate'); // YYYY-MM-DD in IST
    const approvedOnly = searchParams.get('approvedOnly') === 'true';

    const where: any = {};

    // Only show admin-approved orders on the Order Management (dispatch) page
    if (approvedOnly) {
      where.adminApproved = true;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Filter by DELIVERY DATE (IST-aware)
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    let deliveryDateStart: Date;
    let deliveryDateEnd: Date;

    if (deliveryDateParam) {
      deliveryDateStart = new Date(`${deliveryDateParam}T00:00:00+05:30`);
      deliveryDateEnd   = new Date(`${deliveryDateParam}T23:59:59+05:30`);
    } else {
      // Default: today in IST
      const todayIST = new Date(Date.now() + IST_OFFSET_MS);
      const yyyy = todayIST.getUTCFullYear();
      const mm   = String(todayIST.getUTCMonth() + 1).padStart(2, '0');
      const dd   = String(todayIST.getUTCDate()).padStart(2, '0');
      deliveryDateStart = new Date(`${yyyy}-${mm}-${dd}T00:00:00+05:30`);
      deliveryDateEnd   = new Date(`${yyyy}-${mm}-${dd}T23:59:59+05:30`);
    }

    where.deliveryDate = { gte: deliveryDateStart, lte: deliveryDateEnd };

    const [orders, allRiders] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy: { deliveryTime: 'asc' },
        take: 500,
      }),
      prisma.rider.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          phone: true,
          vehicleType: true,
          assignedZone: { select: { pincode: true, neighborhood: true } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({ orders, allRiders });
  } catch (error) {
    console.error('Admin Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}


export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status, riderId, activateSubscription, doubleVerify, deliveryNote, approveOrder, rejectOrder, rejectReason } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const data: any = {};

    // ── Approve Payment & Schedule for Dispatch ──────────────────────────────
    if (approveOrder) {
      data.adminApproved = true;
      // Subscription activated separately below
    }

    // ── Reject Payment ───────────────────────────────────────────────────────
    if (rejectOrder) {
      const existingOrder = await prisma.order.findUnique({ where: { id: orderId }, select: { deliveryNote: true } });
      const existingNote = existingOrder?.deliveryNote ? `${existingOrder.deliveryNote} | ` : '';
      data.status = 'FAILED';
      data.deliveryNote = `${existingNote}⚠️ PAYMENT REJECTED: ${rejectReason || 'No reason provided'}`;
      data.adminApproved = false;
    }

    // ── General Status Changes ────────────────────────────────────────────────
    if (status) {
      data.status = status;
      if (status === 'DELIVERED') {
        data.deliveredAt = new Date();
        data.adminVerifiedAt = new Date();
      }
    }
    if (doubleVerify) {
      data.status = 'DELIVERED';
      data.adminVerifiedAt = new Date();
      data.deliveredAt = new Date();
    }
    if (riderId !== undefined) data.riderId = riderId || null;
    if (deliveryNote !== undefined) data.deliveryNote = deliveryNote;

    const order = await prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
        subscription: true,
      },
    });

    // Auto-promote subscription to ACTIVE upon payment approval, delivery verification, or explicit admin activation
    if (order.subscriptionId && (approveOrder || activateSubscription || status === 'DELIVERED' || doubleVerify)) {
      await prisma.subscription.update({
        where: { id: order.subscriptionId },
        data: { status: 'ACTIVE' },
      });
    }

    // Mark subscription as FAILED when payment rejected
    if (order.subscriptionId && rejectOrder) {
      await prisma.subscription.update({
        where: { id: order.subscriptionId },
        data: { status: 'FAILED' },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Admin Orders PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
