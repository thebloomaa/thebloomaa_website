/**
 * Thebloomaa Bio Calculator V2 — Enhanced Accuracy & Lifestyle-Aware Engine
 * 
 * Implements:
 * 1. Mifflin-St Jeor Equation for BMR & TDEE with regional biometric fallbacks
 * 2. BMI calculation with Indian-adjusted categories
 * 3. Waist-to-Height Ratio (WHtR) metabolic risk assessment
 * 4. Multi-Factor Living Food Vitality Score (0-100%) using 10 weighted factors:
 *    - Raw/Cooked ratio (25%), Fruits (12%), Seeds (10%), Veggies (10%)
 *    - Water intake (10%), Sleep quality (10%), Stress level (8%)
 *    - Oil usage (7%), Sugar/processed food (5%), Meal timing (3%)
 * 5. Enhanced Biological Diet Age Delta (±8 year range) with compound penalties/bonuses
 * 6. Lifestyle factor breakdown for transparency
 * 7. Conversion Engine: Maps to Just Bloomed 7D Trial
 * 8. Side-by-Side Current Diet vs Optimal Living Diet matrix (with lifestyle rows)
 * 9. 6 hyper-personalized actionable swaps grouped by category
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

// ===== NEW V2 Lifestyle Types =====
export type WaterIntake = 'very_low' | 'low' | 'adequate' | 'optimal';
export type SleepQuality = 'poor' | 'average' | 'good' | 'excellent';
export type StressLevel = 'high' | 'moderate' | 'low' | 'minimal';
export type OilUsage = 'heavy' | 'moderate' | 'minimal' | 'none';
export type SugarIntake = 'daily' | 'few_weekly' | 'rarely' | 'never';
export type MealTiming = 'irregular' | 'mostly_regular' | 'fixed_schedule' | 'intermittent_fasting';

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
  waistCircumference?: number; // in cm (optional)
  activityLevel?: ActivityLevel;
  // V2 Lifestyle Fields
  waterIntake?: WaterIntake;
  sleepQuality?: SleepQuality;
  stressLevel?: StressLevel;
  oilUsage?: OilUsage;
  sugarIntake?: SugarIntake;
  mealTiming?: MealTiming;
}

export interface BloomBreakdown {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface VitalityTier {
  label: string;
  status: 'critical' | 'suboptimal' | 'moderate' | 'optimal' | 'elite';
  color: string;
  description: string;
}

export interface LifestyleFactorScore {
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'poor' | 'fair' | 'good' | 'excellent';
  tip: string;
}

export interface BMIResult {
  value: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese Class I' | 'Obese Class II';
  color: string;
  risk: string;
}

export interface WHtRResult {
  value: number;
  category: 'Healthy' | 'Increased Risk' | 'High Risk';
  color: string;
  message: string;
}

export interface DietComparisonProfile {
  rawCookedRatio: string;
  activeDigestiveEnzymes: string;
  estimatedDailyFiber: number;
  antioxidantCapacity: string;
  digestionTransitTime: string;
  inflammatoryLoad: string;
  cellularHydration: string;
  sleepRecoveryPotential: string;
  inflammatoryOilLoad: string;
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
  targetBlooms: BloomBreakdown;
  livingFoodVitalityScore: number;
  vitalityTier: VitalityTier;
  biologicalDietAgeDelta: number;
  biologicalDietAge: number;
  chronologicalAge: number;
  bmiResult: BMIResult | null;
  whtrResult: WHtRResult | null;
  lifestyleBreakdown: LifestyleFactorScore[];
  dietComparison: {
    currentDiet: DietComparisonProfile;
    optimalDiet: DietComparisonProfile;
  };
  matchedProduct: MatchedProduct;
  actionableSwaps: { category: string; tip: string }[];
}

// Regional biometric assumptions for Indian demographic
export const REGIONAL_DEFAULTS: Record<Gender, { weight: number; height: number }> = {
  male: { weight: 72, height: 175 },
  female: { weight: 60, height: 162 },
  other: { weight: 66, height: 168 },
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const JUST_BLOOMED_BOXES: TrialDayBox[] = [
  { day: 1, goal: 'Steady Vitality', boxName: 'Vitality Green Sprout Bowl', highlightIngredients: 'Sprouted moong, soaked chia jelly, fresh kiwi & crisp tender greens' },
  { day: 2, goal: 'Skin Repair', boxName: 'Avocado Glow Polyphenol Box', highlightIngredients: 'Hass avocado, sunflower microgreens, ruby pomegranate & cold-pressed EVOO' },
  { day: 3, goal: 'Mental Focus', boxName: 'Omega Nootropic Crunch', highlightIngredients: 'Roasted walnuts, cold-milled flax, fresh blueberries & organic baby spinach' },
  { day: 4, goal: 'Cardio Support', boxName: 'Nitric Beet & Seed Armor', highlightIngredients: 'Raw spiralized beetroot, pumpkin pepitas, soaked almonds & citrus microgreens' },
  { day: 5, goal: 'Immune Boost', boxName: 'Phyto-Enzyme Immunity Pack', highlightIngredients: 'Papaya cubes, ginger-turmeric raw dressing, sprouted clover & amla bioflavonoids' },
  { day: 6, goal: 'Joint & Pain Care', boxName: 'Anti-Inflammatory Herb Feast', highlightIngredients: 'Fresh turmeric root, black sesame crunch, cucumber ribbon salad & hemp hearts' },
  { day: 7, goal: 'Gut Reset', boxName: 'Live Microbiome Bio-Restorer', highlightIngredients: 'Fermented live cabbage kraut, prebiotic sprouted lentils & green banana resistant starch' },
];

export const BLOOMAA_PRODUCTS = {
  SINGLE_DAY_TRIAL: {
    id: 'prod-single-day-diet-pack',
    name: 'Single Day Living Diet Pack',
    type: 'SINGLE_PACK',
    price: 70,
    description: '1 single fresh cold-prepared living enzyme box (sprouted seeds, microgreens & vitality nuts). Delivered morning 6:00 AM - 9:00 AM in Patna.',
    calories: 420, protein: 20, carbs: 45, fats: 15,
    dietaryPreference: 'LIVING_RAW',
    imageUrl: '/meals/vegan-keto.png',
    isSinglePack: true,
    logisticsNote: '1-DAY SINGLE DROP: Delivered next morning between 6:00 AM - 9:00 AM in Patna.',
  },
  JUST_BLOOMED_TRIAL: {
    id: 'prod-just-bloomed-7d-trial',
    name: 'Just Bloomed 7D Trial',
    type: 'TRIAL_PLAN',
    price: 451,
    description: '7 unique totally raw/living boxes mapped to 7 daily cellular goals. Delivered over 6 active days with Day 6 Double Drop (Box 6 + 7).',
    calories: 420, protein: 22, carbs: 48, fats: 16,
    dietaryPreference: 'LIVING_RAW',
    imageUrl: '/meals/vegan-keto.png',
    isTrialPlan: true,
    logisticsNote: '6+1 BUNDLE DROP: Delivered across 6 mornings. Box 6 & Box 7 delivered together on Day 6.',
    trialBoxes: JUST_BLOOMED_BOXES,
  },
  LEAN_MUSCLE: {
    id: 'prod-plant-protein-power-bowl',
    name: 'Sprouted High Protein Power Bowl',
    type: 'MEAL_PLAN',
    price: 350,
    description: 'Sprouted organic moong, edamame, roasted organic tofu cubes, fluffy tri-color quinoa, and steamed crunchy broccoli with almond crunch.',
    calories: 620, protein: 48, carbs: 48, fats: 16,
    dietaryPreference: 'HIGH_PROTEIN',
    imageUrl: '/meals/vegan-keto.png',
  },
  VEGAN_KETO: {
    id: 'prod-vegan-keto-bowl',
    name: 'Vegan Keto Power Bowl',
    type: 'MEAL_PLAN',
    price: 300,
    description: 'Organic firm tofu, Hass avocado, tender baby spinach, and roasted walnuts in cold-pressed extra virgin olive oil.',
    calories: 500, protein: 20, carbs: 12, fats: 40,
    dietaryPreference: 'VEGAN',
    imageUrl: '/meals/vegan-keto.png',
  },
  STANDARD_WEIGHT_LOSS: {
    id: 'prod-weight-loss-diet',
    name: 'Standard Weight Loss Diet',
    type: 'MEAL_PLAN',
    price: 250,
    description: 'Chef-balanced nutrient-dense diet with sprouted lentils, steamed brown rice, and a crisp live enzyme garden salad.',
    calories: 400, protein: 18, carbs: 55, fats: 8,
    dietaryPreference: 'VEG',
    imageUrl: '/meals/weight-loss.png',
  },
};

/**
 * BMR using Mifflin-St Jeor equation
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return Math.round(base + 5);
  if (gender === 'female') return Math.round(base - 161);
  return Math.round(base - 78);
}

/**
 * BMI with Indian-adjusted thresholds (WHO Asian cut-offs)
 */
export function calculateBMIResult(weightKg: number, heightCm: number): BMIResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  if (rounded < 18.5) return { value: rounded, category: 'Underweight', color: '#60A5FA', risk: 'May indicate nutritional deficiency. Focus on calorie-dense living foods.' };
  if (rounded < 23) return { value: rounded, category: 'Normal', color: '#34D399', risk: 'Healthy metabolic range. Maintain with balanced living nutrition.' };
  if (rounded < 25) return { value: rounded, category: 'Overweight', color: '#FBBF24', risk: 'Slight metabolic risk. A caloric deficit with high-fiber living foods can help.' };
  if (rounded < 30) return { value: rounded, category: 'Obese Class I', color: '#F97316', risk: 'Elevated metabolic risk. Prioritize gut health, reduce refined oils & sugar.' };
  return { value: rounded, category: 'Obese Class II', color: '#EF4444', risk: 'High metabolic risk. A structured living food reset can significantly improve markers.' };
}

/**
 * Waist-to-Height Ratio — golden rule: waist < 0.5 x height
 */
export function calculateWHtR(waistCm: number, heightCm: number): WHtRResult {
  const ratio = Math.round((waistCm / heightCm) * 100) / 100;
  if (ratio < 0.5) return { value: ratio, category: 'Healthy', color: '#34D399', message: 'Excellent! Low visceral fat and healthy metabolic function.' };
  if (ratio < 0.6) return { value: ratio, category: 'Increased Risk', color: '#FBBF24', message: 'Moderate visceral fat. Anti-inflammatory living foods can help reduce abdominal fat.' };
  return { value: ratio, category: 'High Risk', color: '#EF4444', message: 'High visceral fat increases cardiovascular and metabolic disease risk.' };
}

/**
 * V2: Multi-factor Living Food Vitality Score (0-100) with 10 weighted factors
 */
export function calculateLivingVitalityScore(
  cookedPercentage: number, fruitServings: number, seedFrequency: SeedFrequency, veggieFrequency: VeggieFrequency,
  waterIntake: WaterIntake, sleepQuality: SleepQuality, stressLevel: StressLevel,
  oilUsage: OilUsage, sugarIntake: SugarIntake, mealTiming: MealTiming
): { totalScore: number; breakdown: LifestyleFactorScore[] } {
  const breakdown: LifestyleFactorScore[] = [];

  // 1. Raw/Cooked (max 25)
  const rawPct = 100 - Math.min(100, Math.max(0, cookedPercentage));
  const rawScore = Math.round(rawPct * 0.25);
  breakdown.push({ label: 'Raw/Cooked Balance', score: rawScore, maxScore: 25, percentage: Math.round((rawScore / 25) * 100), status: rawScore >= 20 ? 'excellent' : rawScore >= 14 ? 'good' : rawScore >= 8 ? 'fair' : 'poor', tip: cookedPercentage > 70 ? 'Start every meal with a small raw salad to boost enzyme intake before cooked food.' : 'Good balance! Try increasing raw portions at breakfast for maximum morning enzyme activity.' });

  // 2. Fruit (max 12)
  const fruitScore = Math.min(12, Math.round(fruitServings * 3.5));
  breakdown.push({ label: 'Fresh Fruit Intake', score: fruitScore, maxScore: 12, percentage: Math.round((fruitScore / 12) * 100), status: fruitScore >= 10 ? 'excellent' : fruitScore >= 7 ? 'good' : fruitScore >= 4 ? 'fair' : 'poor', tip: fruitServings < 2 ? 'Add 1 seasonal fruit (papaya, guava, or berries) on an empty stomach each morning.' : 'Great fruit intake! Variety across colors ensures broad antioxidant coverage.' });

  // 3. Seeds (max 10)
  const seedScores: Record<SeedFrequency, number> = { rarely: 1, weekly: 4, daily: 8, multiple_daily: 10 };
  const seedScore = seedScores[seedFrequency];
  breakdown.push({ label: 'Seeds & Sprouts', score: seedScore, maxScore: 10, percentage: Math.round((seedScore / 10) * 100), status: seedScore >= 8 ? 'excellent' : seedScore >= 5 ? 'good' : seedScore >= 3 ? 'fair' : 'poor', tip: seedScore < 5 ? 'Add 1 tbsp of soaked chia, flax, or sprouted moong to your breakfast daily.' : 'Strong sprouted intake! Rotating seed types maximizes micronutrient diversity.' });

  // 4. Veggies (max 10)
  const veggieScores: Record<VeggieFrequency, number> = { rarely: 1, daily_salad: 5, multiple_daily: 8, heavy_raw_greens: 10 };
  const veggieScore = veggieScores[veggieFrequency];
  breakdown.push({ label: 'Raw Veggies & Greens', score: veggieScore, maxScore: 10, percentage: Math.round((veggieScore / 10) * 100), status: veggieScore >= 8 ? 'excellent' : veggieScore >= 5 ? 'good' : veggieScore >= 3 ? 'fair' : 'poor', tip: veggieScore < 5 ? 'Add a cucumber-tomato-carrot salad with lemon before lunch.' : 'Excellent greens intake! Cruciferous veggies are especially powerful.' });

  // 5. Water (max 10)
  const waterScores: Record<WaterIntake, number> = { very_low: 1, low: 4, adequate: 7, optimal: 10 };
  const waterScore = waterScores[waterIntake];
  breakdown.push({ label: 'Daily Hydration', score: waterScore, maxScore: 10, percentage: Math.round((waterScore / 10) * 100), status: waterScore >= 8 ? 'excellent' : waterScore >= 5 ? 'good' : waterScore >= 3 ? 'fair' : 'poor', tip: waterScore < 5 ? 'Keep a 1L bottle at your desk. Aim for 2.5L/day — enzymes need water to function.' : 'Well hydrated! Add lemon or cucumber for extra electrolyte absorption.' });

  // 6. Sleep (max 10)
  const sleepScores: Record<SleepQuality, number> = { poor: 1, average: 4, good: 8, excellent: 10 };
  const sleepScore = sleepScores[sleepQuality];
  breakdown.push({ label: 'Sleep Quality', score: sleepScore, maxScore: 10, percentage: Math.round((sleepScore / 10) * 100), status: sleepScore >= 8 ? 'excellent' : sleepScore >= 5 ? 'good' : sleepScore >= 3 ? 'fair' : 'poor', tip: sleepScore < 5 ? 'Poor sleep accelerates aging by 2-3 years. Avoid screens 1hr before bed.' : 'Good sleep supports cellular repair and enzyme production.' });

  // 7. Stress (max 8)
  const stressScores: Record<StressLevel, number> = { high: 1, moderate: 3, low: 6, minimal: 8 };
  const stressScore = stressScores[stressLevel];
  breakdown.push({ label: 'Stress Management', score: stressScore, maxScore: 8, percentage: Math.round((stressScore / 8) * 100), status: stressScore >= 6 ? 'excellent' : stressScore >= 4 ? 'good' : stressScore >= 2 ? 'fair' : 'poor', tip: stressScore < 4 ? 'High cortisol inflames the gut and accelerates aging. Try 10 min daily pranayama.' : 'Good stress balance! Regular mindfulness compounds the protective effect.' });

  // 8. Oil (max 7)
  const oilScores: Record<OilUsage, number> = { heavy: 0, moderate: 3, minimal: 5, none: 7 };
  const oilScore = oilScores[oilUsage];
  breakdown.push({ label: 'Oil & Cooking Method', score: oilScore, maxScore: 7, percentage: Math.round((oilScore / 7) * 100), status: oilScore >= 5 ? 'excellent' : oilScore >= 3 ? 'good' : oilScore >= 1 ? 'fair' : 'poor', tip: oilScore < 3 ? 'Deep-fried foods produce acrolein & trans-fats. Switch to steaming or air-frying.' : 'Good! Cold-pressed coconut or olive oil (unheated) preserves healthy fatty acids.' });

  // 9. Sugar (max 5)
  const sugarScores: Record<SugarIntake, number> = { daily: 0, few_weekly: 2, rarely: 4, never: 5 };
  const sugarScore = sugarScores[sugarIntake];
  breakdown.push({ label: 'Sugar & Processed Food', score: sugarScore, maxScore: 5, percentage: Math.round((sugarScore / 5) * 100), status: sugarScore >= 4 ? 'excellent' : sugarScore >= 2 ? 'good' : sugarScore >= 1 ? 'fair' : 'poor', tip: sugarScore < 2 ? 'Daily sugar causes glycation — a primary driver of wrinkles & organ aging.' : 'Low sugar protects collagen, kidneys, and cardiovascular system from glycation.' });

  // 10. Meal Timing (max 3)
  const mealScores: Record<MealTiming, number> = { irregular: 0, mostly_regular: 1, fixed_schedule: 2, intermittent_fasting: 3 };
  const mealScore = mealScores[mealTiming];
  breakdown.push({ label: 'Meal Timing', score: mealScore, maxScore: 3, percentage: Math.round((mealScore / 3) * 100), status: mealScore >= 2 ? 'excellent' : mealScore >= 1 ? 'good' : 'poor', tip: mealScore < 1 ? 'Irregular meals confuse your circadian clock, reducing insulin sensitivity.' : 'Regular timing optimizes enzyme secretion & nutrient absorption.' });

  const totalScore = Math.min(100, Math.max(5,
    rawScore + fruitScore + seedScore + veggieScore + waterScore + sleepScore + stressScore + oilScore + sugarScore + mealScore
  ));

  return { totalScore, breakdown };
}

export function getVitalityTier(score: number): VitalityTier {
  if (score >= 85) return { label: 'Optimal Cellular Vitality', status: 'elite', color: '#10B981', description: 'Superb living enzyme abundance. Peak mitochondrial hydration, pristine microbiome diversity, and rapid recovery.' };
  if (score >= 70) return { label: 'Balanced Living Nutrition', status: 'optimal', color: '#34D399', description: 'Strong foundation with good enzyme presence. Steady post-diet energy and protective antioxidant shield.' };
  if (score >= 50) return { label: 'Moderate Biological Vitality', status: 'moderate', color: '#F59E0B', description: 'Adequate intake, but lifestyle factors and cooked food load cause intermittent digestive sluggishness.' };
  if (score >= 30) return { label: 'Sub-Optimal Enzyme State', status: 'suboptimal', color: '#F97316', description: 'High heat-processed food ratio combined with lifestyle stressors significantly compromise active enzymes.' };
  return { label: 'Critical Enzyme Depletion', status: 'critical', color: '#EF4444', description: 'Diet and lifestyle are severely depleting natural enzymes, elevating fatigue, metabolic stress, and cellular AGE markers.' };
}

/**
 * V2: Enhanced Biological Diet Age Delta (±8 year range)
 */
export function calculateDietAgeDelta(
  vitalityScore: number, cookedPercentage: number,
  sleepQuality: SleepQuality, stressLevel: StressLevel, oilUsage: OilUsage, sugarIntake: SugarIntake
): number {
  let baseDelta = 0;
  if (cookedPercentage >= 80) { baseDelta = vitalityScore < 25 ? +5 : vitalityScore < 40 ? +4 : +3; }
  else if (cookedPercentage <= 40) { baseDelta = vitalityScore >= 85 ? -5 : vitalityScore >= 70 ? -4 : vitalityScore >= 55 ? -3 : -2; }
  else { baseDelta = vitalityScore >= 65 ? -1 : vitalityScore >= 45 ? 0 : vitalityScore >= 30 ? +1 : +2; }

  let lifestyleModifier = 0;
  if (sleepQuality === 'poor') lifestyleModifier += 1; else if (sleepQuality === 'excellent') lifestyleModifier -= 0.5;
  if (stressLevel === 'high') lifestyleModifier += 1; else if (stressLevel === 'minimal') lifestyleModifier -= 0.5;
  if (oilUsage === 'heavy') lifestyleModifier += 0.5; else if (oilUsage === 'none') lifestyleModifier -= 0.5;
  if (sugarIntake === 'daily') lifestyleModifier += 0.5; else if (sugarIntake === 'never') lifestyleModifier -= 0.5;

  return Math.max(-8, Math.min(+8, Math.round(baseDelta + lifestyleModifier)));
}

/**
 * Main Calculation Engine V2
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

  const waterIntake = inputs.waterIntake || 'low';
  const sleepQuality = inputs.sleepQuality || 'average';
  const stressLevel = inputs.stressLevel || 'moderate';
  const oilUsage = inputs.oilUsage || 'moderate';
  const sugarIntake = inputs.sugarIntake || 'few_weekly';
  const mealTiming = inputs.mealTiming || 'mostly_regular';

  const defaultBiometrics = REGIONAL_DEFAULTS[gender];
  const weight = inputs.weight && inputs.weight > 30 ? inputs.weight : defaultBiometrics.weight;
  const height = inputs.height && inputs.height > 100 ? inputs.height : defaultBiometrics.height;

  // 1. BMR and TDEE
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));

  // 2. BMI & WHtR
  const hasBiometrics = inputs.weight && inputs.weight > 30 && inputs.height && inputs.height > 100;
  const bmiResult = hasBiometrics ? calculateBMIResult(weight, height) : null;
  const whtrResult = (inputs.waistCircumference && inputs.waistCircumference > 40 && inputs.height && inputs.height > 100)
    ? calculateWHtR(inputs.waistCircumference, height) : null;

  // 3. Goal-adjusted Bloom distribution
  let targetCalories = tdee, proteinRatio = 0.25, carbRatio = 0.50, fatRatio = 0.25, targetFiber = 35;
  switch (healthGoal) {
    case 'WEIGHT_LOSS': targetCalories = Math.round(tdee * 0.80); proteinRatio = 0.30; carbRatio = 0.40; fatRatio = 0.30; targetFiber = 38; break;
    case 'LEAN_MUSCLE': targetCalories = Math.round(tdee * 1.10); proteinRatio = 0.32; carbRatio = 0.45; fatRatio = 0.23; targetFiber = 35; break;
    case 'GUT_HEALTH': proteinRatio = 0.22; carbRatio = 0.48; fatRatio = 0.30; targetFiber = 42; break;
    case 'LONGEVITY_DETOX': targetCalories = Math.round(tdee * 0.92); proteinRatio = 0.20; carbRatio = 0.50; fatRatio = 0.30; targetFiber = 45; break;
    default: break;
  }

  const targetProteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const targetCarbsGrams = Math.round((targetCalories * carbRatio) / 4);
  const targetFatsGrams = Math.round((targetCalories * fatRatio) / 9);

  // 4. Multi-factor Vitality Score
  const { totalScore: vitalityScore, breakdown: lifestyleBreakdown } = calculateLivingVitalityScore(
    cookedPercentage, fruitServings, seedFrequency, veggieFrequency,
    waterIntake, sleepQuality, stressLevel, oilUsage, sugarIntake, mealTiming
  );
  const vitalityTier = getVitalityTier(vitalityScore);
  const dietAgeDelta = calculateDietAgeDelta(vitalityScore, cookedPercentage, sleepQuality, stressLevel, oilUsage, sugarIntake);
  const biologicalDietAge = Math.max(16, age + dietAgeDelta);

  // 5. Current fiber estimate
  const estimatedCurrentFiber = Math.min(45, Math.round(
    (100 - cookedPercentage) * 0.08 + fruitServings * 3.2 +
    (seedFrequency === 'daily' || seedFrequency === 'multiple_daily' ? 6 : 2) +
    (veggieFrequency === 'daily_salad' ? 6 : veggieFrequency === 'heavy_raw_greens' ? 12 : 2)
  ));

  // 6. Diet Comparison Matrix
  const currentDiet: DietComparisonProfile = {
    rawCookedRatio: `${cookedPercentage}% Cooked / ${100 - cookedPercentage}% Raw`,
    activeDigestiveEnzymes: vitalityScore < 35 ? '< 20% (Severely Denatured)' : vitalityScore < 55 ? '35-50% (Partially Preserved)' : vitalityScore < 75 ? '55-70% (Moderately Active)' : '75%+ (Active)',
    estimatedDailyFiber: estimatedCurrentFiber,
    antioxidantCapacity: vitalityScore < 35 ? 'Low (Heat Oxidized)' : vitalityScore < 60 ? 'Moderate' : 'High ORAC Shield',
    digestionTransitTime: cookedPercentage > 75 ? '3.5-5 hrs (Post-Diet Fatigue)' : cookedPercentage > 50 ? '3-4 hrs (Average)' : '2.5-3.5 hrs (Normal)',
    inflammatoryLoad: cookedPercentage > 80 ? 'Elevated (High AGEs)' : cookedPercentage > 50 ? 'Moderate' : 'Low',
    cellularHydration: waterIntake === 'very_low' || waterIntake === 'low' ? 'Sub-Optimal (Low Electrolyte H2O)' : 'Good Hydration',
    sleepRecoveryPotential: sleepQuality === 'poor' ? 'Compromised (< 5h disrupts HGH)' : sleepQuality === 'average' ? 'Partial Recovery (5-7h)' : 'Good Recovery (7-8h+)',
    inflammatoryOilLoad: oilUsage === 'heavy' ? 'High (Daily deep-frying)' : oilUsage === 'moderate' ? 'Moderate (Heated refined oils)' : 'Low / Anti-Inflammatory',
  };

  const optimalDiet: DietComparisonProfile = {
    rawCookedRatio: '60-70% Living Raw / 30-40% Clean Cooked',
    activeDigestiveEnzymes: '85-95% (Bio-Active & Intact)',
    estimatedDailyFiber: targetFiber,
    antioxidantCapacity: 'Maximum ORAC Living Spectrum',
    digestionTransitTime: '1.5-2.5 hrs (Clean Cellular Energy)',
    inflammatoryLoad: 'Minimal / Anti-Inflammatory State',
    cellularHydration: 'Optimal Micro-Clustered Plant Water',
    sleepRecoveryPotential: 'Full Overnight Cellular Repair (7-9h)',
    inflammatoryOilLoad: 'Zero — Cold-Pressed Only (Unheated)',
  };

  // 7. Matched Product
  const matchedProduct: MatchedProduct = {
    ...BLOOMAA_PRODUCTS.JUST_BLOOMED_TRIAL,
    reason: healthGoal === 'LEAN_MUSCLE'
      ? 'Delivers bioavailable sprouted plant proteins and antioxidant microgreens to maximize nutrient absorption and recovery without inflammatory cooked oils.'
      : healthGoal === 'WEIGHT_LOSS'
      ? 'Engineered at 420 living kcal with high-fiber raw sprouts and enzyme-rich hydration to accelerate fat oxidation and keep insulin stable.'
      : `Your Living Food Vitality Score (${vitalityScore}%) indicates depleted enzyme levels. The Just Bloomed 7D Trial delivers 7 unique raw/living boxes over 6 mornings to restore active enzymes and reduce biological diet age by ${Math.abs(dietAgeDelta || 3)} years.`,
    livingFoodSynergyTip: healthGoal === 'LEAN_MUSCLE'
      ? 'Consume the sprouted moong and soaked pumpkin seed portions within 45 minutes of your morning workout.'
      : 'Eat Box 1-5 as your primary morning diet; on Day 6, enjoy Box 6 in the morning and Box 7 for evening gut reset.',
  };

  // 8. Lifestyle-Aware Actionable Swaps (6 tips, grouped)
  const actionableSwaps: { category: string; tip: string }[] = [];
  if (cookedPercentage > 65) actionableSwaps.push({ category: '🥗 Diet', tip: 'Begin every meal with a 1-cup bowl of raw greens & microgreens before cooked food.' });
  if (fruitServings < 2) actionableSwaps.push({ category: '🍎 Diet', tip: 'Start your morning with 1 serving of fresh fruit (papaya, berries, or citrus) on an empty stomach.' });
  if (seedFrequency === 'rarely' || seedFrequency === 'weekly') actionableSwaps.push({ category: '🌱 Diet', tip: 'Add 1 tbsp of sprouted chia, flax, or pumpkin seeds to your breakfast for living omegas.' });
  if (sleepQuality === 'poor' || sleepQuality === 'average') actionableSwaps.push({ category: '😴 Lifestyle', tip: 'Avoid screens 1hr before bed. Try chamomile tea or warm turmeric milk to deepen sleep.' });
  if (stressLevel === 'high' || stressLevel === 'moderate') actionableSwaps.push({ category: '🧘 Lifestyle', tip: 'Practice 10 min daily pranayama — clinically proven to reduce cortisol by up to 25%.' });
  if (waterIntake === 'very_low' || waterIntake === 'low') actionableSwaps.push({ category: '💧 Lifestyle', tip: 'Keep a 1L bottle at your desk. Add lemon or cucumber. Aim for 2.5-3L daily.' });
  if (oilUsage === 'heavy' || oilUsage === 'moderate') actionableSwaps.push({ category: '🍳 Habits', tip: 'Replace deep-frying with steaming or air-frying. Use cold-pressed oils for dressing only.' });
  if (sugarIntake === 'daily' || sugarIntake === 'few_weekly') actionableSwaps.push({ category: '🍬 Habits', tip: 'Replace evening chai + biscuits with herbal tulsi tea and soaked almonds.' });
  if (mealTiming === 'irregular') actionableSwaps.push({ category: '⏰ Habits', tip: 'Set a consistent eating window (e.g., 8 AM-8 PM) to sync your circadian rhythm.' });
  if (actionableSwaps.length < 4) actionableSwaps.push({ category: '🥜 Diet', tip: 'Replace deep-fried snacks with raw soaked almonds, walnuts, and sprouted moong crunch.' });

  return {
    bmr, tdee,
    targetBlooms: { calories: targetCalories, protein: targetProteinGrams, carbs: targetCarbsGrams, fats: targetFatsGrams, fiber: targetFiber },
    livingFoodVitalityScore: vitalityScore, vitalityTier,
    biologicalDietAgeDelta: dietAgeDelta, biologicalDietAge, chronologicalAge: age,
    bmiResult, whtrResult, lifestyleBreakdown,
    dietComparison: { currentDiet, optimalDiet },
    matchedProduct,
    actionableSwaps: actionableSwaps.slice(0, 6),
  };
}
