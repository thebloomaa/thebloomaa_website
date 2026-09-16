import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // MEAL_PLAN, A_LA_CARTE, BEVERAGE
    const diet = searchParams.get('diet'); // VEG, VEGAN, KETO, HIGH_PROTEIN

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (diet) where.dietaryPreference = diet;

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description || '',
        price: Number(body.price),
        imageUrl: body.imageUrl || '/meals/vegan-keto.png',
        type: body.type,
        calories: Number(body.calories),
        protein: Number(body.protein),
        carbs: Number(body.carbs),
        fats: Number(body.fats),
        dietaryPreference: body.diet,
      }
    });
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
