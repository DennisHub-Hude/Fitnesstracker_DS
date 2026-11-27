import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { FOODS } from '@/data/foods';
import { todayKey } from '@/lib/date';
import type { AppData, Food, FoodEntry, Profile, WeightEntry, Workout } from './types';

const STORAGE_KEY = 'fittrack-data-v1';

export const DEFAULT_PROFILE: Profile = {
  name: '',
  sex: 'm',
  age: 30,
  heightCm: 178,
  weightKg: 78,
  activity: 'light',
  goal: 'maintain',
  waterGoalMl: 2500,
  configured: false,
};

const EMPTY: AppData = {
  version: 1,
  profile: DEFAULT_PROFILE,
  foods: [],
  customFoods: [],
  workouts: [],
  weights: [],
  water: {},
};

interface Store {
  data: AppData;
  ready: boolean;
  allFoods: Food[];
  updateProfile: (p: Partial<Profile>) => void;
  addFoodEntry: (e: FoodEntry) => void;
  removeFoodEntry: (id: string) => void;
  addCustomFood: (f: Food) => void;
  removeCustomFood: (id: string) => void;
  saveWorkout: (w: Workout) => void;
  removeWorkout: (id: string) => void;
  addWeight: (w: WeightEntry) => void;
  removeWeight: (date: string) => void;
  addWater: (date: string, ml: number) => void;
  resetAll: () => void;
}

const Ctx = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppData>;
          setData({ ...EMPTY, ...parsed, profile: { ...DEFAULT_PROFILE, ...parsed.profile } });
        }
      })
      .catch((e) => console.warn('Daten konnten nicht geladen werden', e))
      .finally(() => setReady(true));
  }, []);

  // Änderungen gebündelt speichern
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((e) => console.warn('Speichern fehlgeschlagen', e));
    }, 300);
  }, [data, ready]);

  const updateProfile = useCallback((p: Partial<Profile>) => {
    setData((d) => {
      const profile = { ...d.profile, ...p };
      let weights = d.weights;
      // Gewichtsänderung im Profil auch im Verlauf festhalten
      if (p.weightKg && p.weightKg !== d.profile.weightKg) {
        const today = todayKey();
        weights = [...d.weights.filter((w) => w.date !== today), { date: today, kg: p.weightKg }].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
      }
      return { ...d, profile, weights };
    });
  }, []);

  const store = useMemo<Store>(
    () => ({
      data,
      ready,
      allFoods: [...data.customFoods, ...FOODS],
      updateProfile,
      addFoodEntry: (e) => setData((d) => ({ ...d, foods: [...d.foods, e] })),
      removeFoodEntry: (id) => setData((d) => ({ ...d, foods: d.foods.filter((f) => f.id !== id) })),
      addCustomFood: (f) => setData((d) => ({ ...d, customFoods: [f, ...d.customFoods.filter((c) => c.id !== f.id)] })),
      removeCustomFood: (id) => setData((d) => ({ ...d, customFoods: d.customFoods.filter((c) => c.id !== id) })),
      saveWorkout: (w) => setData((d) => ({ ...d, workouts: [...d.workouts.filter((x) => x.id !== w.id), w] })),
      removeWorkout: (id) => setData((d) => ({ ...d, workouts: d.workouts.filter((w) => w.id !== id) })),
      addWeight: (w) =>
        setData((d) => {
          const weights = [...d.weights.filter((x) => x.date !== w.date), w].sort((a, b) => a.date.localeCompare(b.date));
          const latest = weights[weights.length - 1];
          return { ...d, weights, profile: { ...d.profile, weightKg: latest?.kg ?? d.profile.weightKg } };
        }),
      removeWeight: (date) => setData((d) => ({ ...d, weights: d.weights.filter((w) => w.date !== date) })),
      addWater: (date, ml) =>
        setData((d) => ({ ...d, water: { ...d.water, [date]: Math.max(0, (d.water[date] ?? 0) + ml) } })),
      resetAll: () => setData(EMPTY),
    }),
    [data, ready, updateProfile],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore muss innerhalb von AppStoreProvider verwendet werden');
  return s;
}

/** Abgeleitete Tageswerte */
export function useDay(date: string) {
  const { data } = useStore();
  return useMemo(() => {
    const foods = data.foods.filter((f) => f.date === date);
    const workouts = data.workouts.filter((w) => w.date === date);
    const burned = workouts.reduce((s, w) => s + w.kcal, 0);
    const minutes = workouts.reduce((s, w) => s + w.minutes, 0);
    return { foods, workouts, burned, minutes, water: data.water[date] ?? 0 };
  }, [data, date]);
}
