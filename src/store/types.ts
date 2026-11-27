export type Sex = 'm' | 'f';
export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very';
export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  waterGoalMl: number;
  /** Optional: eigenes Kalorienziel statt berechnetem Wert */
  calorieOverride?: number;
  configured: boolean;
}

/** Nährwerte pro 100 g bzw. 100 ml */
export interface Food {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: 'g' | 'ml';
  /** Typische Portion in g/ml */
  portion: number;
  portionLabel?: string;
  custom?: boolean;
}

export interface FoodEntry {
  id: string;
  date: string;
  meal: Meal;
  foodId?: string;
  name: string;
  amount: number;
  unit: 'g' | 'ml' | 'kcal';
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface StrengthSet {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weightKg: number;
}

export interface Workout {
  id: string;
  date: string;
  activityId: string;
  name: string;
  minutes: number;
  kcal: number;
  intensity: 'low' | 'mid' | 'high';
  notes?: string;
  exercises?: StrengthSet[];
}

export interface WeightEntry {
  date: string;
  kg: number;
}

export interface AppData {
  version: 1;
  profile: Profile;
  foods: FoodEntry[];
  customFoods: Food[];
  workouts: Workout[];
  weights: WeightEntry[];
  water: Record<string, number>;
}

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snacks',
};

export const MEAL_ICONS: Record<Meal, string> = {
  breakfast: 'cafe-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'ice-cream-outline',
};

export const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];
