import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    if (!pincode) {
      return NextResponse.json({ error: 'Pincode is required' }, { status: 400 });
    }

    const zone = await prisma.deliveryZone.findUnique({
      where: { pincode },
    });

    if (zone && zone.isActive) {
      return NextResponse.json({
        serviceable: true,
        message: `Great news! We deliver diet preps to ${zone.neighborhood || zone.city}.`,
        zone,
      });
    }

    return NextResponse.json({
      serviceable: false,
      message: 'Sorry, we do not currently deliver to this pincode.',
    });
  } catch (error) {
    console.error('Serviceability API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
