import { prisma } from '../lib/prisma';

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@thebloomaa.com';
  const adminPassword = process.env.ADMIN_SECRET_PASSWORD || 'BloomaaAdmin@2026!';

  console.log(`Checking admin user: ${adminEmail}...`);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { role: 'ADMIN' },
      ],
    },
  });

  if (!existing) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Thebloomaa Master Admin',
        role: 'ADMIN',
        password: adminPassword,
      },
    });
    console.log(`Created new admin user with ID: ${admin.id}`);
  } else {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        email: adminEmail,
        role: 'ADMIN',
        password: adminPassword,
      },
    });
    console.log(`Updated admin user ID: ${updated.id} to role ADMIN and latest password.`);
  }

  console.log('Admin seed complete.');
}

seedAdmin()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
