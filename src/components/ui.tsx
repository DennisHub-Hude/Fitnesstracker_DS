import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, style]}>{children}</View>;
}

export function Title({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.titleRow}>
      <Text style={[styles.title, { color: t.text }]}>{children}</Text>
      {right}
    </View>
  );
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<any> }) {
  const t = useTheme();
  return <Text style={[{ color: t.textMuted, fontSize: 13 }, style]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = { primary: t.primary, secondary: t.primarySoft, danger: t.danger, ghost: 'transparent' }[variant];
  const fg = { primary: '#fff', secondary: t.primary, danger: '#fff', ghost: t.primary }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={fg} />}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  color,
  size = 22,
  label,
}: {
  icon: IconName;
  onPress: () => void;
  color?: string;
  size?: number;
  label: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
    >
      <Ionicons name={icon} size={size} color={color ?? t.primary} />
    </Pressable>
  );
}

export function Field({ label, suffix, ...props }: TextInputProps & { label?: string; suffix?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 6, flex: 1 }}>
      {label && <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: '600' }}>{label}</Text>}
      <View style={[styles.inputWrap, { backgroundColor: t.inputBg }]}>
        <TextInput
          placeholderTextColor={t.textMuted}
          {...props}
          style={[styles.input, { color: t.text }, props.style]}
        />
        {suffix && <Text style={{ color: t.textMuted, fontSize: 15 }}>{suffix}</Text>}
      </View>
    </View>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.chip,
              { backgroundColor: active ? t.primary : t.inputBg, borderColor: active ? t.primary : t.border },
            ]}
          >
            <Text style={{ color: active ? '#fff' : t.text, fontWeight: '600', fontSize: 14 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressBar({ value, max, color, height = 8 }: { value: number; max: number; color: string; height?: number }) {
  const t = useTheme();
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const over = max > 0 && value > max;
  return (
    <View style={{ height, borderRadius: height, backgroundColor: t.inputBg, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: over ? t.danger : color, borderRadius: height }} />
    </View>
  );
}

export function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={{ color: t.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
      <ProgressBar value={value} max={goal} color={color} />
      <Text style={{ color: t.textMuted, fontSize: 12 }}>
        {Math.round(value)} / {goal} g
      </Text>
    </View>
  );
}

export function Stat({ label, value, icon, color }: { label: string; value: string; icon: IconName; color: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: t.textMuted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function Empty({ icon, text }: { icon: IconName; text: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 18, gap: 6 }}>
      <Ionicons name={icon} size={30} color={t.textMuted} />
      <Muted style={{ textAlign: 'center' }}>{text}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '700' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, gap: 6 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, minWidth: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
});
