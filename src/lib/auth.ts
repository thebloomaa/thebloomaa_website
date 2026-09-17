import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'thebloomaa OTP Auth',
      credentials: {
        email: { label: 'Email or Mobile', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
        firebaseToken: { label: 'Firebase Token', type: 'text' },
        name: { label: 'Full Name', type: 'text' },
        phone: { label: 'Phone', type: 'text' },
        fitnessGoal: { label: 'Fitness Goal', type: 'text' },
        dietaryPreference: { label: 'Dietary Preference', type: 'text' },
        allergies: { label: 'Allergies', type: 'text' },
        gender: { label: 'Gender', type: 'text' },
        age: { label: 'Age', type: 'text' },
        deliveryTime: { label: 'Delivery Time', type: 'text' },
        street: { label: 'Street Address', type: 'text' },
        pincode: { label: 'Pincode', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const identifier = credentials.email ? credentials.email.trim().toLowerCase() : '';

        // -------------------------------------------------------------
        // A. ADMIN PASSWORD AUTHENTICATION
        // -------------------------------------------------------------
        if (credentials.password) {
          const submittedPass = credentials.password.trim();
          const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
          const configuredAdminPass = process.env.ADMIN_SECRET_PASSWORD;

          const isEnvMatch = Boolean(
            configuredAdminEmail &&
            configuredAdminPass &&
            identifier === configuredAdminEmail &&
            submittedPass === configuredAdminPass
          );

          let adminUser = await prisma.user.findFirst({
            where: {
              email: identifier,
              role: 'ADMIN',
            },
          });

          const isDbMatch = Boolean(adminUser?.password && adminUser.password === submittedPass);

          if (!isEnvMatch && !isDbMatch) {
            return null;
          }

          if (!adminUser && configuredAdminEmail && configuredAdminPass) {
            const anyAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
            if (anyAdmin) {
              adminUser = await prisma.user.update({
                where: { id: anyAdmin.id },
                data: {
                  email: configuredAdminEmail,
                  password: configuredAdminPass,
                  role: 'ADMIN',
                },
              });
            } else {
              adminUser = await prisma.user.create({
                data: {
                  email: configuredAdminEmail,
                  name: 'Thebloomaa Master Admin',
                  role: 'ADMIN',
                  password: configuredAdminPass,
                },
              });
            }
          } else if (adminUser && configuredAdminPass && adminUser.password !== submittedPass && isEnvMatch) {
            adminUser = await prisma.user.update({
              where: { id: adminUser.id },
              data: { password: submittedPass },
            });
          }

          if (!adminUser) return null;

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name || 'Thebloomaa Admin',
            role: 'ADMIN',
          };
        }

        // -------------------------------------------------------------
        // B. CUSTOMER OTP & FIREBASE AUTHENTICATION
        // -------------------------------------------------------------
        let verifiedPhone = '';
        let validOtp = false;

        // B1. Firebase Phone Token Auth
        if (credentials.firebaseToken) {
          const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
          if (apiKey) {
            try {
              const cleanKey = apiKey.replace(/['"]/g, '').trim();
              const verifyRes = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${cleanKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken: credentials.firebaseToken }),
                }
              );
              if (verifyRes.ok) {
                const verifyData = await verifyRes.json();
                const googleUser = verifyData?.users?.[0];
                if (googleUser?.phoneNumber) {
                  verifiedPhone = googleUser.phoneNumber; // e.g. "+918319080781"
                }
              }
            } catch (tokenErr) {
              console.error('Firebase token verification error:', tokenErr);
            }
          }
          
          // Graceful fallback for local development or if Google verification is bypassed (for dev only)
          if (!verifiedPhone && process.env.NODE_ENV !== 'production' && credentials.firebaseToken === 'dev-bypass') {
             verifiedPhone = credentials.phone || '';
          }
          
          if (!verifiedPhone) {
            return null; // Invalid token
          }
        } 
        // B2. Email/Simulated OTP Auth
        else if (credentials.otp) {
          const otpCode = credentials.otp.trim();
          const otpRecord = await prisma.otp.findFirst({
            where: {
              email: identifier,
              code: otpCode,
              expiresAt: { gt: new Date() },
            },
          });

          // Master bypass for local testing only (strictly disabled in production)
          if (!otpRecord) {
            if (process.env.NODE_ENV === 'production' || otpCode !== '123456') {
              return null;
            } else {
              validOtp = true;
            }
          } else {
            validOtp = true;
            await prisma.otp.delete({ where: { id: otpRecord.id } });
          }
        } else {
          return null; // Neither OTP nor Firebase Token provided
        }

        // 2. Find or Create User
        // Check by verified phone (Firebase), explicit phone, or email
        const searchPhone = verifiedPhone || credentials.phone;
        const cleanDigits = searchPhone ? searchPhone.replace(/\D/g, '').slice(-10) : '';

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              ...(identifier ? [{ email: identifier }] : []),
              ...(cleanDigits
                ? [
                    { phone: cleanDigits },
                    { phone: `+91${cleanDigits}` },
                    { phone: `+91 ${cleanDigits}` },
                    { email: `${cleanDigits}@thebloomaa.customer` },
                  ]
                : []),
            ],
          },
        });

        const profileData: any = {};
        if (credentials.name) profileData.name = credentials.name.trim();
        if (credentials.phone) profileData.phone = credentials.phone.trim();
        if (credentials.fitnessGoal) profileData.fitnessGoal = credentials.fitnessGoal;
        if (credentials.dietaryPreference) profileData.dietaryPreference = credentials.dietaryPreference;
        if (credentials.allergies) profileData.allergies = credentials.allergies;
        if (credentials.gender) profileData.gender = credentials.gender;
        if (credentials.age) {
          const parsedAge = parseInt(credentials.age, 10);
          if (!isNaN(parsedAge)) profileData.age = parsedAge;
        }

        if (!user) {
          // New subscriber creation
          const effectiveEmail = identifier && identifier.includes('@')
            ? identifier
            : `${cleanDigits || 'unknown'}@thebloomaa.customer`;

          user = await prisma.user.create({
            data: {
              email: effectiveEmail,
              phone: cleanDigits ? `+91${cleanDigits}` : null,
              role: 'CUSTOMER',
              ...profileData,
            },
          });
        } else if (Object.keys(profileData).length > 0) {
          // Update existing user with fresh profile metrics if provided
          user = await prisma.user.update({
            where: { id: user.id },
            data: profileData,
          });
        }

        // 3. Save or update default address if provided during registration
        if (credentials.street && credentials.pincode && user) {
          try {
            const existingAddress = await prisma.address.findFirst({
              where: { userId: user.id },
            });

            if (!existingAddress) {
              await prisma.address.create({
                data: {
                  userId: user.id,
                  street: credentials.street.trim(),
                  city: 'Patna',
                  state: 'Bihar',
                  pincode: credentials.pincode.trim(),
                  isDefault: true,
                },
              });
            } else {
              await prisma.address.update({
                where: { id: existingAddress.id },
                data: {
                  street: credentials.street.trim(),
                  pincode: credentials.pincode.trim(),
                },
              });
            }
          } catch (addrErr) {
            console.error('Failed to auto-save customer address during registration:', addrErr);
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'development_secret_do_not_use_in_prod',
};
