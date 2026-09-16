import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user, latestSub] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          addresses: {
            orderBy: { isDefault: 'desc' },
          },
        },
      }),
      prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          status: { in: ['ACTIVE', 'PENDING'] },
        },
        orderBy: { createdAt: 'desc' },
        select: { deliveryTime: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clean up deliveryTime (e.g. '07:00 AM' -> '07:00')
    const rawDeliveryTime = latestSub?.deliveryTime || '07:00 AM';
    const cleanDeliveryTime = rawDeliveryTime.replace(/\s*(AM|PM)/i, '').trim();

    return NextResponse.json({
      user: {
        ...user,
        deliveryTime: cleanDeliveryTime || '07:00',
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Allow updating these fields
    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.phone) data.phone = body.phone;
    if (body.fitnessGoal) data.fitnessGoal = body.fitnessGoal;
    if (body.allergies !== undefined) data.allergies = body.allergies;
    if (body.gender) data.gender = body.gender;
    if (body.age) data.age = Number(body.age);
    if (body.weight) data.weight = Number(body.weight);
    if (body.height) data.height = Number(body.height);
    if (body.activityLevel) data.activityLevel = body.activityLevel;
    if (body.dietaryPreference) data.dietaryPreference = body.dietaryPreference;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    // Synchronize deliveryTime to active/pending subscriptions and queued orders
    if (body.deliveryTime) {
      const formattedTime =
        body.deliveryTime.includes('AM') || body.deliveryTime.includes('PM')
          ? body.deliveryTime
          : `${body.deliveryTime} AM`;

      await prisma.$transaction([
        prisma.subscription.updateMany({
          where: {
            userId: session.user.id,
            status: { in: ['ACTIVE', 'PENDING'] },
          },
          data: { deliveryTime: formattedTime },
        }),
        prisma.order.updateMany({
          where: {
            userId: session.user.id,
            status: 'QUEUED',
          },
          data: { deliveryTime: formattedTime },
        }),
      ]);
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
