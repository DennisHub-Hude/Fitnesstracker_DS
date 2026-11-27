import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BarChart } from '@/components/charts';
import { DateSwitcher } from '@/components/DateSwitcher';
import { Screen } from '@/components/Screen';
import { Button, Card, Empty, Muted, Stat, Title, type IconName } from '@/components/ui';
import { activityById } from '@/data/activities';
import { fmt } from '@/lib/confirm';
import { lastDays, todayKey, weekdayShort } from '@/lib/date';
import { useDay, useStore } from '@/store/AppStore';
import { useTheme } from '@/theme';

const INTENSITY_LABEL = { low: 'locker', mid: 'mittel', high: 'intensiv' } as const;

export default function Training() {
  const t = useTheme();
  const { data } = useStore();
  const [date, setDate] = useState(todayKey());
  const day = useDay(date);

  const week = useMemo(() => {
    const days = lastDays(7, date);
    return days.map((d) => {
      const ws = data.workouts.filter((w) => w.date === d);
      return { date: d, minutes: ws.reduce((s, w) => s + w.minutes, 0), kcal: ws.reduce((s, w) => s + w.kcal, 0), count: ws.length };
    });
  }, [data.workouts, date]);

  const weekMinutes = week.reduce((s, d) => s + d.minutes, 0);
  const weekKcal = week.reduce((s, d) => s + d.kcal, 0);
  const activeDays = week.filter((d) => d.count > 0).length;

  return (
    <Screen>
      <DateSwitcher date={date} onChange={setDate} />

      <Card>
        <Title>Tagesbilanz</Title>
        <View style={{ flexDirection: 'row' }}>
          <Stat label="Einheiten" value={String(day.workouts.length)} icon="barbell-outline" color={t.primary} />
          <Stat label="Minuten" value={fmt(day.minutes)} icon="time-outline" color={t.water} />
          <Stat label="kcal" value={fmt(day.burned)} icon="flame-outline" color={t.accent} />
        </View>
      </Card>

      <Button
        label="Training hinzufügen"
        icon="add-circle-outline"
        onPress={() => router.push({ pathname: '/workout', params: { date } })}
      />

      <Card>
        <Title>Einheiten</Title>
        {day.workouts.length === 0 ? (
          <Empty icon="bicycle-outline" text="Kein Training an diesem Tag. Auch Ruhetage gehören dazu! 💤" />
        ) : (
          day.workouts.map((w) => {
            const a = activityById(w.activityId);
            const volume = (w.exercises ?? []).reduce((s, e) => s + e.sets * e.reps * e.weightKg, 0);
            return (
              <Pressable
                key={w.id}
                onPress={() => router.push({ pathname: '/workout', params: { id: w.id } })}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  opacity: pressed ? 0.6 : 1,
                  borderTopWidth: 0.5,
                  borderTopColor: t.border,
                  paddingTop: 10,
                })}
              >
                <View style={{ backgroundColor: t.primarySoft, borderRadius: 12, padding: 8 }}>
                  <Ionicons name={a.icon as IconName} size={22} color={t.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>{w.name}</Text>
                  <Muted>
                    {w.minutes} min · {INTENSITY_LABEL[w.intensity]}
                    {w.exercises?.length ? ` · ${w.exercises.length} Übungen · ${fmt(volume)} kg Volumen` : ''}
                  </Muted>
                  {w.notes ? <Muted style={{ fontStyle: 'italic' }}>{w.notes}</Muted> : null}
                </View>
                <Text style={{ color: t.accent, fontWeight: '800' }}>{w.kcal} kcal</Text>
                <Ionicons name="chevron-forward" size={18} color={t.textMuted} />
              </Pressable>
            );
          })
        )}
      </Card>

      <Card>
        <Title right={<Muted>{activeDays}/7 aktive Tage</Muted>}>Letzte 7 Tage</Title>
        <BarChart
          data={week.map((d) => ({ label: weekdayShort(d.date), value: d.minutes, highlight: d.date === date }))}
          color={t.primary}
        />
        <Muted>
          {fmt(weekMinutes)} Minuten · {fmt(weekKcal)} kcal verbrannt
          {weekMinutes >= 150 ? ' · WHO-Empfehlung (150 min) erreicht 🎉' : ` · noch ${150 - weekMinutes} min bis zur WHO-Empfehlung`}
        </Muted>
      </Card>
    </Screen>
  );
}
