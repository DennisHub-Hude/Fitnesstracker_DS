import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { DateSwitcher } from '@/components/DateSwitcher';
import { Screen } from '@/components/Screen';
import { Card, IconButton, MacroBar, Muted, ProgressBar, Title, type IconName } from '@/components/ui';
import { calorieGoal, macroGoals, sumEntries } from '@/lib/calc';
import { confirm, fmt } from '@/lib/confirm';
import { todayKey } from '@/lib/date';
import { useDay, useStore } from '@/store/AppStore';
import { MEAL_ICONS, MEAL_LABELS, MEALS, type FoodEntry } from '@/store/types';
import { useTheme } from '@/theme';

export default function Nutrition() {
  const t = useTheme();
  const { data, removeFoodEntry } = useStore();
  const [date, setDate] = useState(todayKey());
  const day = useDay(date);

  const goal = calorieGoal(data.profile) + day.burned;
  const macros = macroGoals(data.profile, calorieGoal(data.profile));
  const total = sumEntries(day.foods);

  const remove = (e: FoodEntry) =>
    confirm('Eintrag löschen?', `${e.name} (${e.kcal} kcal) wird entfernt.`, () => removeFoodEntry(e.id));

  return (
    <Screen>
      <DateSwitcher date={date} onChange={setDate} />

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={{ color: t.text, fontSize: 24, fontWeight: '800' }}>
            {fmt(total.kcal)} <Text style={{ fontSize: 15, color: t.textMuted, fontWeight: '500' }}>/ {fmt(goal)} kcal</Text>
          </Text>
          <Muted>{goal - total.kcal >= 0 ? `${fmt(goal - total.kcal)} übrig` : `${fmt(total.kcal - goal)} drüber`}</Muted>
        </View>
        <ProgressBar value={total.kcal} max={goal} color={t.primary} height={10} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <MacroBar label="Eiweiß" value={total.protein} goal={macros.protein} color={t.protein} />
          <MacroBar label="Kohlenhydr." value={total.carbs} goal={macros.carbs} color={t.carbs} />
          <MacroBar label="Fett" value={total.fat} goal={macros.fat} color={t.fat} />
        </View>
      </Card>

      {MEALS.map((meal) => {
        const entries = day.foods.filter((f) => f.meal === meal);
        const kcal = entries.reduce((s, e) => s + e.kcal, 0);
        return (
          <Card key={meal}>
            <Title
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Muted>{fmt(kcal)} kcal</Muted>
                  <IconButton
                    icon="add-circle"
                    size={28}
                    label={`${MEAL_LABELS[meal]} hinzufügen`}
                    onPress={() => router.push({ pathname: '/add-food', params: { date, meal } })}
                  />
                </View>
              }
            >
              <Ionicons name={MEAL_ICONS[meal] as IconName} size={18} color={t.primary} /> {MEAL_LABELS[meal]}
            </Title>
            {entries.length === 0 ? (
              <Muted>Noch nichts eingetragen.</Muted>
            ) : (
              entries.map((e) => (
                <View
                  key={e.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    borderTopWidth: 0.5,
                    borderTopColor: t.border,
                    paddingTop: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontWeight: '600' }}>{e.name}</Text>
                    <Muted>
                      {e.unit === 'kcal' ? 'Schnelleintrag' : `${fmt(e.amount)} ${e.unit}`} · E {fmt(e.protein)} g · K{' '}
                      {fmt(e.carbs)} g · F {fmt(e.fat)} g
                    </Muted>
                  </View>
                  <Text style={{ color: t.text, fontWeight: '700' }}>{e.kcal}</Text>
                  <IconButton icon="trash-outline" color={t.textMuted} size={18} label="Löschen" onPress={() => remove(e)} />
                </View>
              ))
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
