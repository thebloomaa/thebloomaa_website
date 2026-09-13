import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, action = 'signin' } = body;

    const identifier = (email || phone || '').trim().toLowerCase();

    if (!identifier) {
      return NextResponse.json({ error: 'Please enter an email or mobile phone number' }, { status: 400 });
    }

    // 1. Database Existence Check
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          ...(phone ? [{ phone: phone.trim() }] : []),
        ],
      },
    });

    // If customer is trying to Log In but has no profile in the database:
    if (action === 'signin' && !existingUser) {
      return NextResponse.json(
        {
          error: 'No account found with this email or mobile number. Please create your Member Profile (Sign Up) first.',
          notRegistered: true,
        },
        { status: 404 }
      );
    }

    // If customer is trying to Sign Up but already has an account:
    if (action === 'register' && existingUser) {
      return NextResponse.json(
        {
          error: 'An account with this email or mobile number already exists. Please switch to Log In.',
          alreadyRegistered: true,
        },
        { status: 409 }
      );
    }

    // Generate a 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in database
    await prisma.otp.create({
      data: {
        email: identifier,
        code,
        expiresAt,
      },
    });

    const isEmail = identifier.includes('@');

    // If identifier is an email and SMTP credentials exist, send real email
    if (isEmail && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"thebloomaa" <${process.env.SMTP_USER}>`,
        to: identifier,
        subject: 'Your Login OTP for thebloomaa — Bloom your day with BlooMaa',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; text-align: center; background: #090D16; color: #F1F5F9; border-radius: 20px; border: 1px solid #1E293B;">
            <div style="margin-bottom: 16px;">
              <span style="font-size: 24px; font-weight: 900; color: #10B981; letter-spacing: -0.5px;">thebloo<span style="color: #34D399;">maa</span></span>
              <p style="font-size: 11px; color: #FBBF24; font-style: italic; margin: 4px 0 0 0;">Bloom your day with BlooMaa</p>
            </div>
            <p style="font-size: 14px; color: #94A3B8; margin-bottom: 20px;">Your secure one-time verification code to access fresh morning preps &amp; subscriptions:</p>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 6px; padding: 18px 24px; background: #0F172A; border: 1px solid #10B981; border-radius: 16px; color: #34D399; margin: 20px 0; font-family: monospace;">
              ${code}
            </div>
            <p style="font-size: 11px; color: #64748B;">Valid for 10 minutes. Delivered daily across Patna from 6:00 AM – 9:00 AM.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } else {
      // In development or when SMS gateway is simulated
      console.warn(`[thebloomaa AUTH] OTP for ${identifier} is: ${code} (Master dev bypass: 123456)`);
    }

    // Return masked identifier for display
    const masked = isEmail
      ? identifier.replace(/^(.)(.*)(@.*)$/, (_match: string, a: string, b: string, c: string) => `${a}${'*'.repeat(Math.max(b.length, 2))}${c}`)
      : `+91 ${identifier.replace(/(\d{2})\d+(\d{2})/, '$1****$2')}`;

    return NextResponse.json({ success: true, masked, code: process.env.NODE_ENV !== 'production' ? code : undefined });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to dispatch verification code' }, { status: 500 });
  }
}
