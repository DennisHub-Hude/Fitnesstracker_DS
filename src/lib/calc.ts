import type { ActivityLevel, Food, FoodEntry, Goal, Profile } from '@/store/types';

export const ACTIVITY_LEVELS: { key: ActivityLevel; label: string; hint: string; factor: number }[] = [
  { key: 'sedentary', label: 'Sitzend', hint: 'Bürojob, kaum Bewegung', factor: 1.2 },
  { key: 'light', label: 'Leicht aktiv', hint: '1–3× Sport pro Woche', factor: 1.375 },
  { key: 'moderate', label: 'Aktiv', hint: '3–5× Sport pro Woche', factor: 1.55 },
  { key: 'active', label: 'Sehr aktiv', hint: '6–7× Sport pro Woche', factor: 1.725 },
  { key: 'very', label: 'Extrem aktiv', hint: 'Körperliche Arbeit + Sport', factor: 1.9 },
];

export const GOALS: { key: Goal; label: string; delta: number }[] = [
  { key: 'lose', label: 'Abnehmen', delta: -500 },
  { key: 'maintain', label: 'Gewicht halten', delta: 0 },
  { key: 'gain', label: 'Muskelaufbau', delta: 300 },
];

/** Grundumsatz nach Mifflin-St Jeor */
export function bmr(p: Pick<Profile, 'sex' | 'weightKg' | 'heightCm' | 'age'>): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === 'm' ? base + 5 : base - 161);
}

/** Gesamtumsatz (ohne erfasstes Training – das wird separat gutgeschrieben) */
export function tdee(p: Profile): number {
  const f = ACTIVITY_LEVELS.find((a) => a.key === p.activity)?.factor ?? 1.2;
  return Math.round(bmr(p) * f);
}

export function calorieGoal(p: Profile): number {
  if (p.calorieOverride && p.calorieOverride > 0) return Math.round(p.calorieOverride);
  const delta = GOALS.find((g) => g.key === p.goal)?.delta ?? 0;
  const minimum = p.sex === 'm' ? 1500 : 1200;
  return Math.max(minimum, tdee(p) + delta);
}

/** Makroziele in Gramm: Protein nach Körpergewicht, Fett 27 %, Rest Kohlenhydrate */
export function macroGoals(p: Profile, kcal: number) {
  const proteinPerKg = p.goal === 'maintain' ? 1.6 : 2.0;
  const protein = Math.round(p.weightKg * proteinPerKg);
  const fat = Math.round((kcal * 0.27) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { protein, carbs, fat };
}

export function bmi(p: Pick<Profile, 'weightKg' | 'heightCm'>): number {
  const m = p.heightCm / 100;
  return m > 0 ? p.weightKg / (m * m) : 0;
}

export function bmiLabel(v: number): string {
  if (v < 18.5) return 'Untergewicht';
  if (v < 25) return 'Normalgewicht';
  if (v < 30) return 'Übergewicht';
  return 'Adipositas';
}

export function nutrientsFor(food: Food, amount: number) {
  const f = amount / 100;
  return {
    kcal: Math.round(food.kcal * f),
    protein: Math.round(food.protein * f * 10) / 10,
    carbs: Math.round(food.carbs * f * 10) / 10,
    fat: Math.round(food.fat * f * 10) / 10,
  };
}

export function sumEntries(entries: FoodEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

const INTENSITY_FACTOR = { low: 0.8, mid: 1, high: 1.2 } as const;

/** Kalorienverbrauch = MET × kg × Stunden */
export function workoutKcal(met: number, weightKg: number, minutes: number, intensity: keyof typeof INTENSITY_FACTOR) {
  return Math.round(met * INTENSITY_FACTOR[intensity] * weightKg * (minutes / 60));
}
