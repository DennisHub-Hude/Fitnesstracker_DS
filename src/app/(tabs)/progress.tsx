import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { BarChart, LineChart } from '@/components/charts';
import { Screen } from '@/components/Screen';
import { Button, Card, Chips, Field, IconButton, Muted, Stat, Title } from '@/components/ui';
import { bmi, bmiLabel, calorieGoal } from '@/lib/calc';
import { confirm, fmt, parseNum } from '@/lib/confirm';
import { formatLong, formatShort, lastDays, todayKey, weekdayShort } from '@/lib/date';
import { useStore } from '@/store/AppStore';
import { useTheme } from '@/theme';

type Range = '7' | '30' | '90';

export default function Progress() {
  const t = useTheme();
  const { data, addWeight, removeWeight } = useStore();
  const [weight, setWeight] = useState('');
  const [range, setRange] = useState<Range>('30');
  const goal = calorieGoal(data.profile);

  const week = useMemo(
    () =>
      lastDays(7).map((d) => ({
        date: d,
        eaten: data.foods.filter((f) => f.date === d).reduce((s, f) => s + f.kcal, 0),
        burned: data.workouts.filter((w) => w.date === d).reduce((s, w) => s + w.kcal, 0),
      })),
    [data.foods, data.workouts],
  );

  const loggedDays = week.filter((d) => d.eaten > 0);
  const avgEaten = loggedDays.length ? loggedDays.reduce((s, d) => s + d.eaten, 0) / loggedDays.length : 0;
  const weekBurned = week.reduce((s, d) => s + d.burned, 0);
  // Bilanz nur über Tage mit Ernährungseinträgen
  const balance = loggedDays.reduce((s, d) => s + d.eaten - goal - d.burned, 0);

  const weights = useMemo(() => {
    const from = lastDays(Number(range))[0];
    return data.weights.filter((w) => w.date >= from);
  }, [data.weights, range]);

  const first = weights[0];
  const last = weights[weights.length - 1];
  const diff = first && last ? last.kg - first.kg : 0;
  const bmiValue = bmi(data.profile);

  const saveWeight = () => {
    const kg = parseNum(weight);
    if (kg < 20 || kg > 400) return;
    addWeight({ date: todayKey(), kg });
    setWeight('');
  };

  return (
    <Screen>
      <Card>
        <Title>Gewicht eintragen</Title>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
          <Field
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder={fmt(data.profile.weightKg, 1)}
            suffix="kg"
            onSubmitEditing={saveWeight}
          />
          <Button label="Speichern" onPress={saveWeight} disabled={parseNum(weight) < 20} />
        </View>
      </Card>

      <Card>
        <Title right={<Chips options={[{ key: '7', label: '7 T' }, { key: '30', label: '30 T' }, { key: '90', label: '90 T' }]} value={range} onChange={setRange} />}>
          Verlauf
        </Title>
        <LineChart points={weights.map((w) => ({ label: formatShort(w.date), value: w.kg }))} color={t.protein} />
        <View style={{ flexDirection: 'row' }}>
          <Stat label="Aktuell" value={`${fmt(data.profile.weightKg, 1)} kg`} icon="scale-outline" color={t.protein} />
          <Stat
            label="Veränderung"
            value={`${diff > 0 ? '+' : ''}${fmt(diff, 1)} kg`}
            icon={diff <= 0 ? 'trending-down-outline' : 'trending-up-outline'}
            color={t.accent}
          />
          <Stat label={bmiLabel(bmiValue)} value={`BMI ${fmt(bmiValue, 1)}`} icon="body-outline" color={t.primary} />
        </View>
      </Card>

      <Card>
        <Title right={<Muted>Ziel {fmt(goal)} kcal</Muted>}>Kalorien – letzte 7 Tage</Title>
        <BarChart
          data={week.map((d) => ({ label: weekdayShort(d.date), value: d.eaten, highlight: d.date === todayKey() }))}
          goal={goal}
          color={t.primary}
        />
        <View style={{ flexDirection: 'row' }}>
          <Stat label="Ø gegessen" value={fmt(avgEaten)} icon="restaurant-outline" color={t.primary} />
          <Stat label="verbrannt" value={fmt(weekBurned)} icon="flame-outline" color={t.accent} />
          <Stat
            label={balance <= 0 ? 'Defizit' : 'Überschuss'}
            value={fmt(Math.abs(balance))}
            icon="swap-vertical-outline"
            color={balance <= 0 ? t.primary : t.danger}
          />
        </View>
        {loggedDays.length > 0 && (
          <Muted>
            ≈ {fmt(Math.abs(balance) / 7700, 2)} kg Körperfett {balance <= 0 ? 'eingespart' : 'zugelegt'} (7.700 kcal ≈ 1 kg)
          </Muted>
        )}
      </Card>

      {data.weights.length > 0 && (
        <Card>
          <Title>Einträge</Title>
          {[...data.weights]
            .reverse()
            .slice(0, 15)
            .map((w) => (
              <View key={w.date} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ color: t.text, flex: 1 }}>{formatLong(w.date)}</Text>
                <Text style={{ color: t.text, fontWeight: '700' }}>{fmt(w.kg, 1)} kg</Text>
                <IconButton
                  icon="trash-outline"
                  size={18}
                  color={t.textMuted}
                  label="Eintrag löschen"
                  onPress={() => confirm('Eintrag löschen?', `${formatLong(w.date)}: ${fmt(w.kg, 1)} kg`, () => removeWeight(w.date))}
                />
              </View>
            ))}
        </Card>
      )}
    </Screen>
  );
}
