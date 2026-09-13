import { prisma } from '../lib/prisma';

async function seedRiders() {
  console.log('Seeding Patna Delivery Zones & Fleet Riders...');

  // 1. Ensure Patna Delivery Zones exist
  const zonesData = [
    { pincode: '800001', neighborhood: 'Boring Road', city: 'Patna', state: 'Bihar' },
    { pincode: '800013', neighborhood: 'Patliputra', city: 'Patna', state: 'Bihar' },
    { pincode: '800020', neighborhood: 'Kankarbagh', city: 'Patna', state: 'Bihar' },
  ];

  const createdZones: Record<string, any> = {};

  for (const z of zonesData) {
    let zone = await prisma.deliveryZone.findUnique({
      where: { pincode: z.pincode },
    });
    if (!zone) {
      zone = await prisma.deliveryZone.create({ data: z });
      console.log(`Created Zone: ${z.neighborhood} (${z.pincode})`);
    } else {
      createdZones[z.pincode] = zone;
    }
    createdZones[z.pincode] = zone;
  }

  // 2. Seed Riders mapped to specific zones
  const ridersData = [
    {
      name: 'Rajesh Kumar',
      phone: '9876500001',
      vehicleType: 'EV Scooter',
      vehicleNumber: 'BR 01 EA 1101',
      active: true,
      pincode: '800001', // Boring Road
    },
    {
      name: 'Amit Singh',
      phone: '9876500002',
      vehicleType: 'Motorcycle',
      vehicleNumber: 'BR 01 EB 2202',
      active: true,
      pincode: '800013', // Patliputra
    },
    {
      name: 'Vikas Yadav',
      phone: '9876500003',
      vehicleType: 'Bike',
      vehicleNumber: 'BR 01 EC 3303',
      active: true,
      pincode: '800020', // Kankarbagh
    },
  ];

  for (const r of ridersData) {
    const zone = createdZones[r.pincode];
    const existing = await prisma.rider.findUnique({
      where: { phone: r.phone },
    });

    if (!existing) {
      const rider = await prisma.rider.create({
        data: {
          name: r.name,
          phone: r.phone,
          vehicleType: r.vehicleType,
          vehicleNumber: r.vehicleNumber,
          active: r.active,
          assignedZoneId: zone?.id || null,
        },
      });
      console.log(`Created Rider: ${rider.name} (${rider.phone}) -> Assigned to ${zone?.neighborhood} (${zone?.pincode})`);
    } else {
      const updated = await prisma.rider.update({
        where: { id: existing.id },
        data: {
          name: r.name,
          vehicleType: r.vehicleType,
          vehicleNumber: r.vehicleNumber,
          active: r.active,
          assignedZoneId: zone?.id || null,
        },
      });
      console.log(`Updated Rider: ${updated.name} -> Assigned to ${zone?.neighborhood} (${zone?.pincode})`);
    }
  }

  // 3. Check for any unassigned orders and assign them to riders by zone
  const unassignedOrders = await prisma.order.findMany({
    where: { riderId: null },
    include: { address: true },
  });

  console.log(`Found ${unassignedOrders.length} unassigned orders. Checking zone routing...`);

  for (const order of unassignedOrders) {
    const orderPin = order.address.pincode;
    const matchingZone = createdZones[orderPin];
    if (matchingZone) {
      const riderForZone = await prisma.rider.findFirst({
        where: { assignedZoneId: matchingZone.id, active: true },
      });
      if (riderForZone) {
        await prisma.order.update({
          where: { id: order.id },
          data: { riderId: riderForZone.id },
        });
        console.log(`Auto-routed Order ${order.id.slice(-6)} (${orderPin}) to Rider ${riderForZone.name}`);
      }
    }
  }

  console.log('Rider and Zone seeding successfully finished!');
}

seedRiders()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
