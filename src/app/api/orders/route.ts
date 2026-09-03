import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        subscription: {
          userId: session.user.id
        }
      },
      include: {
        subscription: {
          include: {
            product: true
          }
        },
        rider: true
      },
      orderBy: { deliveryDate: 'desc' }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
