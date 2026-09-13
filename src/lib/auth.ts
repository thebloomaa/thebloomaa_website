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
        if (!credentials?.email) return null;

        const identifier = credentials.email.trim().toLowerCase();

        // -------------------------------------------------------------
        // A. ADMIN PASSWORD AUTHENTICATION
        // -------------------------------------------------------------
        if (credentials.password) {
          const submittedPass = credentials.password.trim();
          const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'thebloomaa@gmail.com').trim().toLowerCase();
          const configuredAdminPass = process.env.ADMIN_SECRET_PASSWORD || 'TheBlooMaa@2026!';

          const isEnvMatch =
            identifier === configuredAdminEmail &&
            submittedPass === configuredAdminPass;

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

          if (!adminUser) {
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
          } else if (adminUser.password !== submittedPass) {
            adminUser = await prisma.user.update({
              where: { id: adminUser.id },
              data: { password: submittedPass },
            });
          }

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name || 'Thebloomaa Admin',
            role: 'ADMIN',
          };
        }

        // -------------------------------------------------------------
        // B. CUSTOMER OTP AUTHENTICATION
        // -------------------------------------------------------------
        if (!credentials.otp) return null;

        const otpCode = credentials.otp.trim();

        // 1. Verify OTP
        const validOtp = await prisma.otp.findFirst({
          where: {
            email: identifier,
            code: otpCode,
            expiresAt: { gt: new Date() },
          },
        });

        // Master bypass for local testing
        if (!validOtp && otpCode !== '123456') {
          if (process.env.NODE_ENV === 'production') return null;
          if (otpCode !== '123456') return null;
        }

        // Delete used OTP
        if (validOtp) {
          await prisma.otp.delete({ where: { id: validOtp.id } });
        }

        // 2. Find or Create User
        // Check by email or by phone
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              ...(credentials.phone ? [{ phone: credentials.phone }] : []),
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
          const effectiveEmail = identifier.includes('@')
            ? identifier
            : `${credentials.phone || identifier.replace(/\D/g, '')}@thebloomaa.customer`;

          user = await prisma.user.create({
            data: {
              email: effectiveEmail,
              phone: credentials.phone || (!identifier.includes('@') ? identifier : null),
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
