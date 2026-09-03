import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
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
      data
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
