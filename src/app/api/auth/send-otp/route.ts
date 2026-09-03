import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save to database
    await prisma.otp.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send email using Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"TheBlooMaa" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Login OTP for TheBlooMaa',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center; background: #0A0A0A; color: #fff; border-radius: 10px;">
          <h1 style="color: #6EE7B7;">TheBlooMaa</h1>
          <p style="font-size: 16px; color: #D1D5DB;">Your one-time password to sign in is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background: #1F2937; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #9CA3AF;">This code will expire in 10 minutes.</p>
        </div>
      `,
    };

    // Only attempt to send if SMTP env vars are somewhat present (otherwise silently pass for local dev if they want to check terminal)
    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
    } else {
      console.warn(`[DEV MODE] OTP for ${email} is ${code}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
