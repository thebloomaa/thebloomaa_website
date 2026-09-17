import { create } from 'zustand';
import {
  calculateBioProfile,
  type BioCalculatorInputs,
  type BioCalculatorResults,
} from '@/lib/bioCalculator';

export type CalculatorStep = 1 | 2 | 3 | 4 | 5;

interface BioCalcState {
  // Navigation & Step Control
  currentStep: CalculatorStep;

  // Form Inputs
  inputs: BioCalculatorInputs;

  // Output Results (Cached / Real-time)
  results: BioCalculatorResults | null;

  // Actions
  setInputs: (partial: Partial<BioCalculatorInputs>) => void;
  calculate: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: CalculatorStep) => void;
  reset: () => void;
}

const DEFAULT_INPUTS: BioCalculatorInputs = {
  age: 28,
  gender: 'male',
  healthGoal: 'WEIGHT_LOSS',
  cookedFoodPercentage: 75,
  fruitServings: 1,
  seedFrequency: 'rarely',
  veggieFrequency: 'rarely',
  weight: 70,
  height: 175,
  waistCircumference: undefined,
  activityLevel: 'moderate',
  // V2 Lifestyle defaults
  waterIntake: 'low',
  sleepQuality: 'average',
  stressLevel: 'moderate',
  oilUsage: 'moderate',
  sugarIntake: 'few_weekly',
  mealTiming: 'mostly_regular',
};

export const useBioCalcStore = create<BioCalcState>((set, get) => ({
  currentStep: 1,
  inputs: { ...DEFAULT_INPUTS },
  results: null,

  setInputs: (partial) => {
    const currentInputs = get().inputs;
    const updatedInputs = { ...currentInputs, ...partial };
    
    // Auto-recalculate results if results are already generated or on step 4+
    const currentResults = get().results;
    let newResults = currentResults;
    if (currentResults !== null || get().currentStep >= 4) {
      newResults = calculateBioProfile(updatedInputs);
    }

    set({
      inputs: updatedInputs,
      results: newResults,
    });
  },

  calculate: () => {
    const { inputs } = get();
    const calculatedResults = calculateBioProfile(inputs);
    set({
      results: calculatedResults,
    });
  },

  nextStep: () => {
    const { currentStep, inputs } = get();
    if (currentStep === 3) {
      // Transitioning to Step 4 (Vitality Dashboard): Ensure calculations are freshly computed
      const freshResults = calculateBioProfile(inputs);
      set({
        currentStep: 4,
        results: freshResults,
      });
    } else if (currentStep < 5) {
      set({ currentStep: (currentStep + 1) as CalculatorStep });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as CalculatorStep });
    }
  },

  goToStep: (step) => {
    const { inputs } = get();
    if (step >= 4 && !get().results) {
      set({
        currentStep: step,
        results: calculateBioProfile(inputs),
      });
    } else {
      set({ currentStep: step });
    }
  },

  reset: () => {
    set({
      currentStep: 1,
      inputs: { ...DEFAULT_INPUTS },
      results: null,
    });
  },
}));
