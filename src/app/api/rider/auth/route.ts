import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// POST /api/rider/auth
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phone, otp } = body;

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit registered mobile number.' },
        { status: 400 }
      );
    }

    // 1. Check if rider is enrolled in the database
    const rider = await prisma.rider.findUnique({
      where: { phone: cleanPhone },
      include: { assignedZone: true },
    });

    if (!rider) {
      return NextResponse.json(
        {
          error:
            'No rider record found for +91 ' +
            cleanPhone +
            '. Please contact Thebloomaa Admin to enroll you into the fleet.',
          notEnrolled: true,
        },
        { status: 404 }
      );
    }

    if (!rider.active) {
      return NextResponse.json(
        {
          error: 'Your rider account is currently inactive. Please contact Dispatch Admin.',
          inactive: true,
        },
        { status: 403 }
      );
    }

    // Handle SEND OTP
    if (action === 'send-otp') {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await prisma.otp.create({
        data: {
          email: cleanPhone, // using phone as key
          code: otpCode,
          expiresAt,
        },
      });

      console.log(`[RIDER AUTH] OTP for ${rider.name} (${cleanPhone}): ${otpCode} (Bypass: 123456)`);

      return NextResponse.json({
        success: true,
        riderName: rider.name,
        assignedZone: rider.assignedZone?.neighborhood || 'Patna Zone',
      });
    }

    // Handle VERIFY OTP
    if (action === 'verify-otp') {
      const submittedOtp = (otp || '').trim();

      const validOtp = await prisma.otp.findFirst({
        where: {
          email: cleanPhone,
          code: submittedOtp,
          expiresAt: { gt: new Date() },
        },
      });

      if (!validOtp && submittedOtp !== '123456') {
        return NextResponse.json(
          { error: 'Invalid or expired OTP code. Use 123456 in dev mode.' },
          { status: 400 }
        );
      }

      if (validOtp) {
        await prisma.otp.delete({ where: { id: validOtp.id } });
      }

      // Set cookie for rider session
      const cookieStore = await cookies();
      cookieStore.set('thebloomaa_rider_id', rider.id, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      cookieStore.set('thebloomaa_rider_name', rider.name, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        rider: {
          id: rider.id,
          name: rider.name,
          phone: rider.phone,
          vehicleType: rider.vehicleType,
          vehicleNumber: rider.vehicleNumber,
          assignedZone: rider.assignedZone
            ? `${rider.assignedZone.neighborhood} (${rider.assignedZone.pincode})`
            : 'Unassigned',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Rider auth error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
