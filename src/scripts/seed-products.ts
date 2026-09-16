import { prisma } from '../lib/prisma';

const products = [
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
    dietaryPreference: 'LIVING_RAW',
    imageUrl: '/meals/vegan-keto.png'
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
    dietaryPreference: 'LIVING_RAW',
    imageUrl: '/meals/vegan-keto.png'
  },
  { 
    id: 'prod-plant-protein-power-bowl',
    name: 'Sprouted High Protein Power Bowl', 
    type: 'MEAL_PLAN',
    price: 350, 
    description: 'Sprouted organic moong, edamame, roasted organic tofu cubes, tri-color quinoa, and steamed broccoli with almond crunch. 100% pure veg, optimized for lean muscle gain.',
    calories: 620,
    protein: 48,
    carbs: 48,
    fats: 16,
    dietaryPreference: 'HIGH_PROTEIN',
    imageUrl: '/meals/vegan-keto.png'
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
    dietaryPreference: 'VEGAN',
    imageUrl: '/meals/vegan-keto.png'
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
    dietaryPreference: 'VEG',
    imageUrl: '/meals/weight-loss.png'
  }
];

async function main() {
  console.log('Upserting products into database...');
  // Purge/update any legacy prod-lean-muscle-chicken in DB to 100% pure veg
  try {
    await prisma.product.updateMany({
      where: { id: 'prod-lean-muscle-chicken' },
      data: {
        name: 'Sprouted High Protein Power Bowl',
        description: 'Sprouted organic moong, edamame, roasted organic tofu cubes, tri-color quinoa, and steamed broccoli with almond crunch. 100% pure veg, optimized for lean muscle gain.',
        imageUrl: '/meals/vegan-keto.png',
        dietaryPreference: 'HIGH_PROTEIN',
      },
    });
  } catch (e) {
    console.log('Legacy cleanup check:', e);
  }

  for (const prod of products) {
    const res = await prisma.product.upsert({
      where: { id: prod.id },
      update: prod,
      create: prod,
    });
    console.log(`✅ Upserted product: ${res.id} (${res.name})`);
  }
  console.log('All products successfully seeded.');
}

main()
  .catch((e) => {
    console.error('Failed to seed products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
