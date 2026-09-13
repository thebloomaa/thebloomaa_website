/**
 * Thebloomaa Bio Calculator & Healthy Diet Comparison Engine
 * 
 * Implements:
 * 1. Mifflin-St Jeor Equation for BMR & TDEE with regional biometric fallbacks
 * 2. Living Food Vitality Score (0-100%) balancing thermal enzyme denaturation with raw plant density
 * 3. Biological Diet Age Delta adhering to CEO directive:
 *    - >80% cooked -> +3 to +5 years penalty
 *    - >60% living (<=40% cooked) -> -2 to -5 years protective deduction
 * 4. Conversion Engine: Suboptimal vitality scores (<70) or gut/longevity/vitality goals default
 *    to the new "Just Bloomed 7D Trial" (₹451 prepaid, 6+1 double drop logistics).
 * 5. Side-by-Side Current Diet vs Optimal Living Diet matrix.
 */

export type Gender = 'male' | 'female' | 'other';

export type HealthGoal = 
  | 'WEIGHT_LOSS'
  | 'LEAN_MUSCLE'
  | 'GUT_HEALTH'
  | 'LONGEVITY_DETOX'
  | 'ENERGY_VITALITY';

export type ActivityLevel = 
  | 'sedentary' 
  | 'light' 
  | 'moderate' 
  | 'active' 
  | 'very_active';

export type SeedFrequency = 'rarely' | 'weekly' | 'daily' | 'multiple_daily';
export type VeggieFrequency = 'rarely' | 'daily_salad' | 'multiple_daily' | 'heavy_raw_greens';

export interface BioCalculatorInputs {
  age: number;
  gender: Gender;
  healthGoal: HealthGoal;
  cookedFoodPercentage: number; // 0 to 100
  fruitServings: number; // 0 to 6+
  seedFrequency: SeedFrequency;
  veggieFrequency: VeggieFrequency;
  weight?: number; // in kg (optional)
  height?: number; // in cm (optional)
  activityLevel?: ActivityLevel;
}

export interface MacroBreakdown {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fats: number;    // in grams
  fiber: number;   // in grams
}

export interface VitalityTier {
  label: string;
  status: 'critical' | 'suboptimal' | 'moderate' | 'optimal' | 'elite';
  color: string;
  description: string;
}

export interface DietComparisonProfile {
  rawCookedRatio: string;
  activeDigestiveEnzymes: string;
  estimatedDailyFiber: number; // g
  antioxidantCapacity: string;
  digestionTransitTime: string;
  inflammatoryLoad: string;
  cellularHydration: string;
}

export interface TrialDayBox {
  day: number;
  goal: string;
  boxName: string;
  highlightIngredients: string;
}

export interface MatchedProduct {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dietaryPreference: string;
  imageUrl: string;
  reason: string;
  livingFoodSynergyTip: string;
  isTrialPlan?: boolean;
  logisticsNote?: string;
  trialBoxes?: TrialDayBox[];
}

export interface BioCalculatorResults {
  bmr: number;
  tdee: number;
  targetMacros: MacroBreakdown;
  livingFoodVitalityScore: number; // 0 - 100
  vitalityTier: VitalityTier;
  biologicalDietAgeDelta: number; // e.g. -4 or +5
  biologicalDietAge: number;
  chronologicalAge: number;
  dietComparison: {
    currentDiet: DietComparisonProfile;
    optimalDiet: DietComparisonProfile;
  };
  matchedProduct: MatchedProduct;
  actionableSwaps: string[];
}

// Regional biometric assumptions for Indian demographic when user omits height/weight
export const REGIONAL_DEFAULTS: Record<Gender, { weight: number; height: number }> = {
  male: { weight: 72, height: 175 },
  female: { weight: 60, height: 162 },
  other: { weight: 66, height: 168 },
};

// Activity multipliers based on Mifflin-St Jeor / Katch-McArdle standard
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// 7-day raw living boxes for the Just Bloomed 7D Trial
export const JUST_BLOOMED_BOXES: TrialDayBox[] = [
  { day: 1, goal: 'Steady Vitality', boxName: 'Vitality Green Sprout Bowl', highlightIngredients: 'Sprouted moong, soaked chia jelly, fresh kiwi & crisp tender greens' },
  { day: 2, goal: 'Skin Repair', boxName: 'Avocado Glow Polyphenol Box', highlightIngredients: 'Hass avocado, sunflower microgreens, ruby pomegranate & cold-pressed EVOO' },
  { day: 3, goal: 'Mental Focus', boxName: 'Omega Nootropic Crunch', highlightIngredients: 'Roasted walnuts, cold-milled flax, fresh blueberries & organic baby spinach' },
  { day: 4, goal: 'Cardio Support', boxName: 'Nitric Beet & Seed Armor', highlightIngredients: 'Raw spiralized beetroot, pumpkin pepitas, soaked almonds & citrus microgreens' },
  { day: 5, goal: 'Immune Boost', boxName: 'Phyto-Enzyme Immunity Pack', highlightIngredients: 'Papaya cubes, ginger-turmeric raw dressing, sprouted clover & amla bioflavonoids' },
  { day: 6, goal: 'Joint & Pain Care', boxName: 'Anti-Inflammatory Herb Feast', highlightIngredients: 'Fresh turmeric root, black sesame crunch, cucumber ribbon salad & hemp hearts' },
  { day: 7, goal: 'Gut Reset', boxName: 'Live Microbiome Bio-Restorer', highlightIngredients: 'Fermented live cabbage kraut, prebiotic sprouted lentils & green banana resistant starch' },
];

// Product definitions
export const BLOOMAA_PRODUCTS = {
  JUST_BLOOMED_TRIAL: {
    id: 'prod-just-bloomed-7d-trial',
    name: 'Just Bloomed 7D Trial',
    type: 'TRIAL_PLAN',
    price: 451,
    description: '7 unique totally raw/living boxes mapped to 7 daily cellular goals. Delivered over 6 active days with Day 6 Double Drop (Box 6 + 7).',
    calories: 420,
    protein: 22,
    carbs: 48,
    fats: 16,
    dietaryPreference: 'LIVING_RAW',
    imageUrl: '/meals/vegan-keto.png',
    isTrialPlan: true,
    logisticsNote: '6+1 BUNDLE DROP: Delivered across 6 mornings. Box 6 & Box 7 delivered together on Day 6.',
    trialBoxes: JUST_BLOOMED_BOXES,
  },
  LEAN_MUSCLE: {
    id: 'prod-lean-muscle-chicken',
    name: 'Lean Muscle Chicken Prep',
    type: 'MEAL_PLAN',
    price: 350,
    description: 'Grilled tender chicken breast with fluffy tri-color quinoa and steamed crunchy broccoli.',
    calories: 650,
    protein: 55,
    carbs: 45,
    fats: 15,
    dietaryPreference: 'HIGH_PROTEIN',
    imageUrl: '/meals/chicken-prep.png',
  },
  VEGAN_KETO: {
    id: 'prod-vegan-keto-bowl',
    name: 'Vegan Keto Power Bowl',
    type: 'MEAL_PLAN',
    price: 300,
    description: 'Organic firm tofu, Hass avocado, tender baby spinach, and roasted walnuts in cold-pressed extra virgin olive oil.',
    calories: 500,
    protein: 20,
    carbs: 12,
    fats: 40,
    dietaryPreference: 'VEGAN',
    imageUrl: '/meals/vegan-keto.png',
  },
  STANDARD_WEIGHT_LOSS: {
    id: 'prod-weight-loss-diet',
    name: 'Standard Weight Loss Diet',
    type: 'MEAL_PLAN',
    price: 250,
    description: 'Chef-balanced nutrient-dense meal with sprouted lentils, steamed brown rice, and a crisp live enzyme garden salad.',
    calories: 400,
    protein: 18,
    carbs: 55,
    fats: 8,
    dietaryPreference: 'VEG',
    imageUrl: '/meals/weight-loss.png',
  },
};

/**
 * Calculates BMR using the Mifflin-St Jeor equation:
 * Men: BMR = 10W + 6.25H - 5A + 5
 * Women: BMR = 10W + 6.25H - 5A - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  } else {
    return Math.round(base - 78);
  }
}

/**
 * Calculates Living Food Vitality Score (0 - 100%)
 */
export function calculateLivingVitalityScore(
  cookedPercentage: number,
  fruitServings: number,
  seedFrequency: SeedFrequency,
  veggieFrequency: VeggieFrequency
): number {
  const rawBaseScore = (100 - Math.min(100, Math.max(0, cookedPercentage))) * 0.45;
  const fruitScore = Math.min(20, fruitServings * 5.5);

  const seedScores: Record<SeedFrequency, number> = {
    rarely: 2,
    weekly: 7,
    daily: 14,
    multiple_daily: 18,
  };
  const seedScore = seedScores[seedFrequency] || 2;

  const veggieScores: Record<VeggieFrequency, number> = {
    rarely: 2,
    daily_salad: 9,
    multiple_daily: 14,
    heavy_raw_greens: 17,
  };
  const veggieScore = veggieScores[veggieFrequency] || 2;

  const totalScore = Math.round(rawBaseScore + fruitScore + seedScore + veggieScore);
  return Math.min(100, Math.max(5, totalScore));
}

export function getVitalityTier(score: number): VitalityTier {
  if (score >= 85) {
    return {
      label: 'Optimal Cellular Vitality',
      status: 'elite',
      color: '#10B981',
      description: 'Superb living enzyme abundance. Peak mitochondrial cellular hydration, pristine microbiome diversity, and rapid recovery.',
    };
  }
  if (score >= 70) {
    return {
      label: 'Balanced Living Nutrition',
      status: 'optimal',
      color: '#34D399',
      description: 'Strong foundation with good living enzyme presence. Steady post-meal energy and protective antioxidant shield.',
    };
  }
  if (score >= 50) {
    return {
      label: 'Moderate Biological Vitality',
      status: 'moderate',
      color: '#F59E0B',
      description: 'Adequate intake, but cooked food load causes intermittent digestive sluggishness and moderate enzyme depletion.',
    };
  }
  if (score >= 30) {
    return {
      label: 'Sub-Optimal Enzyme State',
      status: 'suboptimal',
      color: '#F97316',
      description: 'High heat-processed food ratio. Heat-sensitive micronutrients and active digestive enzymes are significantly compromised.',
    };
  }
  return {
    label: 'Critical Enzyme Depletion',
    status: 'critical',
    color: '#EF4444',
    description: 'Diet dominated by high-temperature cooked foods. Elevates post-meal fatigue, metabolic stress, and cellular inflammatory AGE markers.',
  };
}

/**
 * Calculates Biological Diet Age Delta
 * CEO & Product Architect Directive:
 * - >80% cooked: +3 to +5 years penalty
 * - >60% living (<=40% cooked): -2 to -5 years protective deduction
 * - Mid-range (41-79% cooked): scales smoothly between -1 and +2 years
 */
export function calculateDietAgeDelta(vitalityScore: number, cookedPercentage: number): number {
  if (cookedPercentage >= 80) {
    if (vitalityScore < 30) return +5;
    if (vitalityScore < 50) return +4;
    return +3;
  }

  if (cookedPercentage <= 40) {
    if (vitalityScore >= 85) return -5;
    if (vitalityScore >= 75) return -4;
    if (vitalityScore >= 65) return -3;
    return -2;
  }

  // Intermediate transition (41% - 79% cooked)
  if (vitalityScore >= 65) return -1;
  if (vitalityScore >= 50) return 0;
  if (vitalityScore >= 35) return +1;
  return +2;
}

/**
 * Main Pure Calculation Engine
 */
export function calculateBioProfile(inputs: BioCalculatorInputs): BioCalculatorResults {
  const age = Math.max(16, Math.min(100, Number(inputs.age) || 28));
  const gender = inputs.gender || 'male';
  const healthGoal = inputs.healthGoal || 'WEIGHT_LOSS';
  const cookedPercentage = Math.max(0, Math.min(100, Number(inputs.cookedFoodPercentage) ?? 75));
  const fruitServings = Math.max(0, Number(inputs.fruitServings) || 0);
  const seedFrequency = inputs.seedFrequency || 'rarely';
  const veggieFrequency = inputs.veggieFrequency || 'rarely';
  const activityLevel = inputs.activityLevel || 'moderate';

  // Apply regional defaults if height/weight are omitted
  const defaultBiometrics = REGIONAL_DEFAULTS[gender];
  const weight = inputs.weight && inputs.weight > 30 ? inputs.weight : defaultBiometrics.weight;
  const height = inputs.height && inputs.height > 100 ? inputs.height : defaultBiometrics.height;

  // 1. Calculate BMR and TDEE
  const bmr = calculateBMR(weight, height, age, gender);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  const tdee = Math.round(bmr * activityMultiplier);

  // 2. Goal-adjusted Calorie & Macro distribution
  let targetCalories = tdee;
  let proteinRatio = 0.25;
  let carbRatio = 0.50;
  let fatRatio = 0.25;
  let targetFiber = 35; // g

  switch (healthGoal) {
    case 'WEIGHT_LOSS':
      targetCalories = Math.round(tdee * 0.80); // 20% deficit
      proteinRatio = 0.30;
      carbRatio = 0.40;
      fatRatio = 0.30;
      targetFiber = 38;
      break;
    case 'LEAN_MUSCLE':
      targetCalories = Math.round(tdee * 1.10); // 10% surplus
      proteinRatio = 0.32;
      carbRatio = 0.45;
      fatRatio = 0.23;
      targetFiber = 35;
      break;
    case 'GUT_HEALTH':
      targetCalories = tdee;
      proteinRatio = 0.22;
      carbRatio = 0.48;
      fatRatio = 0.30;
      targetFiber = 42;
      break;
    case 'LONGEVITY_DETOX':
      targetCalories = Math.round(tdee * 0.92);
      proteinRatio = 0.20;
      carbRatio = 0.50;
      fatRatio = 0.30;
      targetFiber = 45;
      break;
    case 'ENERGY_VITALITY':
    default:
      targetCalories = tdee;
      proteinRatio = 0.25;
      carbRatio = 0.50;
      fatRatio = 0.25;
      targetFiber = 35;
      break;
  }

  const targetProteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const targetCarbsGrams = Math.round((targetCalories * carbRatio) / 4);
  const targetFatsGrams = Math.round((targetCalories * fatRatio) / 9);

  // 3. Living Vitality Score and Biological Diet Age
  const vitalityScore = calculateLivingVitalityScore(
    cookedPercentage,
    fruitServings,
    seedFrequency,
    veggieFrequency
  );
  const vitalityTier = getVitalityTier(vitalityScore);
  const dietAgeDelta = calculateDietAgeDelta(vitalityScore, cookedPercentage);
  const biologicalDietAge = Math.max(16, age + dietAgeDelta);

  // 4. Estimate current dietary fiber intake
  const estimatedCurrentFiber = Math.min(
    45,
    Math.round(
      (100 - cookedPercentage) * 0.08 +
      fruitServings * 3.2 +
      (seedFrequency === 'daily' || seedFrequency === 'multiple_daily' ? 6 : 2) +
      (veggieFrequency === 'daily_salad' ? 6 : veggieFrequency === 'heavy_raw_greens' ? 12 : 2)
    )
  );

  // 5. Generate Side-by-Side Diet Comparison Matrix
  const currentDiet: DietComparisonProfile = {
    rawCookedRatio: `${cookedPercentage}% Cooked / ${100 - cookedPercentage}% Raw`,
    activeDigestiveEnzymes: vitalityScore < 45 ? '< 20% (Severely Heat Denatured)' : vitalityScore < 70 ? '40-55% (Partially Preserved)' : '75%+ (Active)',
    estimatedDailyFiber: estimatedCurrentFiber,
    antioxidantCapacity: vitalityScore < 40 ? 'Low (Heat Oxidized)' : vitalityScore < 70 ? 'Moderate' : 'High ORAC Shield',
    digestionTransitTime: cookedPercentage > 75 ? '3.5 – 5 hrs (Post-Meal Fatigue)' : '2.5 – 3.5 hrs (Normal)',
    inflammatoryLoad: cookedPercentage > 80 ? 'Elevated (High AGEs & Thermal Byproducts)' : 'Moderate',
    cellularHydration: fruitServings < 2 ? 'Sub-Optimal (Low Electrolyte H2O)' : 'Good Hydration',
  };

  const optimalDiet: DietComparisonProfile = {
    rawCookedRatio: '60-70% Living Raw / 30-40% Clean Cooked',
    activeDigestiveEnzymes: '85-95% (Bio-Active & Intact)',
    estimatedDailyFiber: targetFiber,
    antioxidantCapacity: 'Maximum ORAC Living Spectrum',
    digestionTransitTime: '1.5 – 2.5 hrs (Clean Cellular Energy)',
    inflammatoryLoad: 'Minimal / Anti-Inflammatory State',
    cellularHydration: 'Optimal Micro-Clustered Plant Water',
  };

  // 6. Conversion Strategy: Recommend "Just Bloomed 7D Trial" if vitality is suboptimal (< 70)
  // 6. Matched Solution: The Just Bloomed 7D Living Foods Trial
  const matchedProduct: MatchedProduct = {
    ...BLOOMAA_PRODUCTS.JUST_BLOOMED_TRIAL,
    reason:
      healthGoal === 'LEAN_MUSCLE'
        ? `Delivers bioavailable sprouted plant proteins, live amino acids, and antioxidant microgreens to maximize nutrient absorption and cellular recovery without inflammatory cooked oils.`
        : healthGoal === 'WEIGHT_LOSS'
        ? `Engineered at 420 living kcal with high-fiber raw sprouts, low-glycemic berries, and enzyme-rich hydration to accelerate fat oxidation and keep insulin completely stable.`
        : `Your Living Food Vitality Score (${vitalityScore}%) indicates depleted enzyme levels. The Just Bloomed 7D Trial delivers 7 unique totally raw/living boxes over 6 mornings to restore active enzymes, reset gut flora, and reduce biological diet age by ${Math.abs(dietAgeDelta || 3)} years.`,
    livingFoodSynergyTip:
      healthGoal === 'LEAN_MUSCLE'
        ? 'Consume the sprouted moong and soaked pumpkin seed portions within 45 minutes of your morning workout for optimal enzymatic protein assimilation.'
        : 'Eat Box 1 through 5 as your primary morning meal; on Day 6, enjoy Box 6 in the morning and Box 7 for a soothing evening gut reset.',
  };

  // 7. Actionable Swaps
  const actionableSwaps: string[] = [];
  if (cookedPercentage > 65) {
    actionableSwaps.push('Begin every lunch or dinner with a 1-cup bowl of crisp raw greens & microgreens before eating your cooked meal.');
  }
  if (fruitServings < 2) {
    actionableSwaps.push('Start your morning with 1 serving of enzyme-packed fresh fruit (papaya, berries, or citrus) on an empty stomach.');
  }
  if (seedFrequency === 'rarely' || seedFrequency === 'weekly') {
    actionableSwaps.push('Add 1 tablespoon of sprouted chia, flax, or pumpkin seeds to your breakfast or pre-workout snack for living omegas.');
  }
  if (actionableSwaps.length < 3) {
    actionableSwaps.push('Replace deep-fried or oily snacks with raw soaked almonds, walnuts, and sprouted moong crunch.');
  }

  return {
    bmr,
    tdee,
    targetMacros: {
      calories: targetCalories,
      protein: targetProteinGrams,
      carbs: targetCarbsGrams,
      fats: targetFatsGrams,
      fiber: targetFiber,
    },
    livingFoodVitalityScore: vitalityScore,
    vitalityTier,
    biologicalDietAgeDelta: dietAgeDelta,
    biologicalDietAge,
    chronologicalAge: age,
    dietComparison: {
      currentDiet,
      optimalDiet,
    },
    matchedProduct,
    actionableSwaps: actionableSwaps.slice(0, 3),
  };
}
