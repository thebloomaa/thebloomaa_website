import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newZones = [
    { pincode: '800014', neighborhood: 'Patna', city: 'Patna', state: 'Bihar' },
    { pincode: '800025', neighborhood: 'Patna', city: 'Patna', state: 'Bihar' },
    { pincode: '800022', neighborhood: 'Patna', city: 'Patna', state: 'Bihar' },
    { pincode: '800015', neighborhood: 'Patna', city: 'Patna', state: 'Bihar' },
  ];

  for (const zone of newZones) {
    await prisma.deliveryZone.upsert({
      where: { pincode: zone.pincode },
      update: {},
      create: {
        pincode: zone.pincode,
        neighborhood: zone.neighborhood,
        city: zone.city,
        state: zone.state,
        isActive: true,
      },
    });
    console.log(`Upserted zone ${zone.pincode}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
