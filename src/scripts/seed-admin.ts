import { prisma } from '../lib/prisma';

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_SECRET_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_SECRET_PASSWORD must be configured in your .env file.');
    process.exit(1);
  }

  console.log(`Syncing administrator account from environment configuration for: ${adminEmail}...`);

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
    console.log(`✓ Created new administrator account (ID: ${admin.id})`);
  } else {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        email: adminEmail,
        role: 'ADMIN',
        password: adminPassword,
      },
    });
    console.log(`✓ Synchronized administrator account (ID: ${updated.id}) to ${adminEmail}`);
  }

  console.log('✓ Administrator synchronization complete.');
}

seedAdmin()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
