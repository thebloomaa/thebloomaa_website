import { PrismaClient, ProductType, DietaryPreference } from '@prisma/client';

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
      name: 'Lean Muscle Chicken Prep', 
      type: ProductType.MEAL_PLAN,
      price: 350, 
      description: 'Grilled chicken breast with quinoa and steamed broccoli. Optimized for muscle gain.',
      calories: 650,
      protein: 55,
      carbs: 45,
      fats: 15,
      dietaryPreference: DietaryPreference.HIGH_PROTEIN
    },
    { 
      name: 'Vegan Keto Power Bowl', 
      type: ProductType.MEAL_PLAN, 
      price: 300, 
      description: 'Tofu, avocado, spinach, and walnuts in an olive oil dressing. Low carb, high fat.',
      calories: 500,
      protein: 20,
      carbs: 12,
      fats: 40,
      dietaryPreference: DietaryPreference.VEGAN
    },
    { 
      name: 'Standard Weight Loss Diet', 
      type: ProductType.MEAL_PLAN, 
      price: 250, 
      description: 'Balanced low-calorie meal with mixed lentils, brown rice, and a side salad.',
      calories: 400,
      protein: 18,
      carbs: 55,
      fats: 8,
      dietaryPreference: DietaryPreference.VEG
    }
  ];

  for (const prod of products) {
    await prisma.product.create({
      data: prod
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
