import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fitness meal prep database...');

  // 1. Seed Delivery Zones (Patna Pincodes)
  const zones = [
    { pincode: '800001', neighborhood: 'Boring Road', city: 'Patna', state: 'Bihar', isActive: true },
    { pincode: '800020', neighborhood: 'Kankarbagh', city: 'Patna', state: 'Bihar', isActive: true },
    { pincode: '800013', neighborhood: 'Patliputra', city: 'Patna', state: 'Bihar', isActive: true }
  ];
  
  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: { pincode: zone.pincode },
      update: {},
      create: zone,
    });
  }
  console.log('✅ Seeded Delivery Zones (Patna)');

  // 2. Seed Fitness Products
  const products = [
    { 
      id: 'prod-lean-muscle-chicken',
      name: 'Lean Muscle Chicken Prep', 
      type: 'MEAL_PLAN',
      price: 350, 
      description: 'Grilled chicken breast with quinoa and steamed broccoli. Optimized for muscle gain.',
      calories: 650,
      protein: 55,
      carbs: 45,
      fats: 15,
      dietaryPreference: 'HIGH_PROTEIN'
    },
    { 
      id: 'prod-vegan-keto-bowl',
      name: 'Vegan Keto Power Bowl', 
      type: 'MEAL_PLAN', 
      price: 300, 
      description: 'Tofu, avocado, spinach, and walnuts in an olive oil dressing. Low carb, high fat.',
      calories: 500,
      protein: 20,
      carbs: 12,
      fats: 40,
      dietaryPreference: 'VEGAN'
    },
    { 
      id: 'prod-weight-loss-diet',
      name: 'Standard Weight Loss Diet', 
      type: 'MEAL_PLAN', 
      price: 250, 
      description: 'Balanced low-calorie meal with mixed lentils, brown rice, and a side salad.',
      calories: 400,
      protein: 18,
      carbs: 55,
      fats: 8,
      dietaryPreference: 'VEG'
    },
    { 
      id: 'prod-just-bloomed-7d-trial',
      name: 'Just Bloomed 7D Trial', 
      type: 'TRIAL_PLAN', 
      price: 451, 
      description: '7 unique raw & living nutrient boxes over 6 delivery days (6+1 double drop on day 6). Designed for high enzymatic vitality and cellular gut reset.',
      calories: 420,
      protein: 22,
      carbs: 48,
      fats: 16,
      dietaryPreference: 'LIVING_RAW'
    },
    { 
      id: 'prod-single-day-diet-pack',
      name: 'Single Day Living Diet Pack', 
      type: 'SINGLE_PACK', 
      price: 70, 
      description: '1 single fresh cold-prepared living enzyme box (sprouted seeds, microgreens & vitality nuts). Delivered morning 6:00 AM – 9:00 AM across Patna.',
      calories: 420,
      protein: 20,
      carbs: 45,
      fats: 15,
      dietaryPreference: 'LIVING_RAW'
    }
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: prod,
      create: prod
    });
  }
  console.log('✅ Seeded Fitness Products');

  // 3. Seed Rider
  await prisma.rider.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      name: 'Raju Rider',
      phone: '+919876543210',
      active: true,
    },
  });
  console.log('✅ Seeded Rider');

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
