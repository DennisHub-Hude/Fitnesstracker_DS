import { useColorScheme } from 'react-native';

const light = {
  bg: '#F4F6FA',
  card: '#FFFFFF',
  text: '#121826',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  primary: '#16A34A',
  primarySoft: '#DCFCE7',
  accent: '#F97316',
  accentSoft: '#FFEDD5',
  danger: '#DC2626',
  water: '#0EA5E9',
  waterSoft: '#E0F2FE',
  protein: '#8B5CF6',
  carbs: '#F59E0B',
  fat: '#EC4899',
  inputBg: '#F3F4F6',
};

const dark: typeof light = {
  bg: '#0B0F17',
  card: '#151B26',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  border: '#263040',
  primary: '#22C55E',
  primarySoft: '#14532D',
  accent: '#FB923C',
  accentSoft: '#431407',
  danger: '#F87171',
  water: '#38BDF8',
  waterSoft: '#0C4A6E',
  protein: '#A78BFA',
  carbs: '#FBBF24',
  fat: '#F472B6',
  inputBg: '#1F2734',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
