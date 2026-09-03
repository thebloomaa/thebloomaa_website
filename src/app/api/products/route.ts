import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
