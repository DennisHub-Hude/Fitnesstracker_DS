import { Pressable, Text, View } from 'react-native';

import { addDays, formatLong, todayKey } from '@/lib/date';
import { useTheme } from '@/theme';
import { IconButton } from './ui';

export function DateSwitcher({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const t = useTheme();
  const isToday = date === todayKey();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: t.card,
        borderRadius: 14,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderWidth: 0.5,
        borderColor: t.border,
      }}
    >
      <IconButton icon="chevron-back" label="Vorheriger Tag" onPress={() => onChange(addDays(date, -1))} />
      <Pressable onPress={() => onChange(todayKey())} accessibilityRole="button" accessibilityLabel="Zu heute springen">
        <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>{formatLong(date)}</Text>
      </Pressable>
      <IconButton
        icon="chevron-forward"
        label="Nächster Tag"
        onPress={() => !isToday && onChange(addDays(date, 1))}
        color={isToday ? t.border : undefined}
      />
    </View>
  );
}
