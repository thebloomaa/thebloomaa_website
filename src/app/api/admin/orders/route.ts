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

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [orders, allRiders] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          address: true,
          subscription: {
            include: {
              product: { select: { name: true, calories: true, type: true } },
            },
          },
          rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
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
    const { orderId, status, riderId, activateSubscription } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === 'DELIVERED') {
        data.deliveredAt = new Date();
      }
    }
    if (riderId !== undefined) data.riderId = riderId || null;

    const order = await prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
        subscription: true,
      },
    });

    // Auto-promote subscription to ACTIVE upon delivery or explicit admin activation
    if (order.subscriptionId && (activateSubscription || status === 'DELIVERED')) {
      await prisma.subscription.update({
        where: { id: order.subscriptionId },
        data: { status: 'ACTIVE' },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Admin Orders PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
