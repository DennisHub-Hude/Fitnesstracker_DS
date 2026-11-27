import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button, Card, Chips, Field, IconButton, Muted, Title, type IconName } from '@/components/ui';
import { ACTIVITIES, activityById, EXERCISE_GROUPS } from '@/data/activities';
import { workoutKcal } from '@/lib/calc';
import { confirm, fmt, newId, parseNum } from '@/lib/confirm';
import { todayKey } from '@/lib/date';
import { useStore } from '@/store/AppStore';
import type { StrengthSet, Workout } from '@/store/types';
import { useTheme } from '@/theme';

type Intensity = Workout['intensity'];

export default function WorkoutScreen() {
  const t = useTheme();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const { data, saveWorkout, removeWorkout } = useStore();
  const existing = params.id ? data.workouts.find((w) => w.id === params.id) : undefined;

  const [activityId, setActivityId] = useState(existing?.activityId ?? 'strength');
  const [minutes, setMinutes] = useState(String(existing?.minutes ?? 45));
  const [intensity, setIntensity] = useState<Intensity>(existing?.intensity ?? 'mid');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  // Manuell eingetragene Kalorien eines bestehenden Trainings beibehalten
  const [kcalOverride, setKcalOverride] = useState<string>(() => {
    if (!existing) return '';
    const auto = workoutKcal(activityById(existing.activityId).met, data.profile.weightKg, existing.minutes, existing.intensity);
    return existing.kcal !== auto ? String(existing.kcal) : '';
  });
  const [exercises, setExercises] = useState<StrengthSet[]>(existing?.exercises ?? []);

  useEffect(() => {
    navigation.setOptions({ title: existing ? 'Training bearbeiten' : 'Neues Training' });
  }, [navigation, existing]);

  const activity = activityById(activityId);
  const mins = parseNum(minutes);
  const calculated = workoutKcal(activity.met, data.profile.weightKg, mins, intensity);
  const kcal = kcalOverride.trim() ? Math.round(parseNum(kcalOverride)) : calculated;

  const exerciseSuggestions = useMemo(
    () =>
      EXERCISE_GROUPS.map((g) => ({
        group: g.group,
        exercises: g.exercises.filter((e) => !exercises.some((x) => x.exercise === e)),
      })).filter((g) => g.exercises.length > 0),
    [exercises],
  );

  const updateExercise = (id: string, patch: Partial<StrengthSet>) =>
    setExercises((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const addExercise = (name: string) => {
    const last = [...(data.workouts ?? [])]
      .reverse()
      .flatMap((w) => w.exercises ?? [])
      .find((e) => e.exercise === name);
    setExercises((xs) => [
      ...xs,
      { id: newId(), exercise: name, sets: last?.sets ?? 3, reps: last?.reps ?? 10, weightKg: last?.weightKg ?? 0 },
    ]);
  };

  const save = () => {
    if (mins <= 0) return;
    saveWorkout({
      id: existing?.id ?? newId(),
      date: existing?.date ?? params.date ?? todayKey(),
      activityId,
      name: activity.name,
      minutes: mins,
      intensity,
      kcal,
      notes: notes.trim() || undefined,
      exercises: activity.strength && exercises.length ? exercises : undefined,
    });
    router.back();
  };

  return (
    <Screen>
      <Card>
        <Title>Aktivität</Title>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ACTIVITIES.map((a) => {
            const active = a.id === activityId;
            return (
              <Pressable
                key={a.id}
                onPress={() => setActivityId(a.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  width: '31%',
                  flexGrow: 1,
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: 10,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: active ? t.primary : t.border,
                  backgroundColor: active ? t.primarySoft : t.inputBg,
                }}
              >
                <Ionicons name={a.icon as IconName} size={22} color={active ? t.primary : t.textMuted} />
                <Text style={{ color: t.text, fontSize: 12, fontWeight: active ? '700' : '500' }} numberOfLines={1}>
                  {a.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="Dauer" value={minutes} onChangeText={setMinutes} keyboardType="numeric" suffix="min" />
          <Field
            label="Kalorien (optional)"
            value={kcalOverride}
            onChangeText={setKcalOverride}
            keyboardType="numeric"
            placeholder={String(calculated)}
            suffix="kcal"
          />
        </View>
        <Muted>Intensität</Muted>
        <Chips
          options={[
            { key: 'low', label: 'Locker' },
            { key: 'mid', label: 'Mittel' },
            { key: 'high', label: 'Intensiv' },
          ]}
          value={intensity}
          onChange={setIntensity}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.accentSoft, padding: 12, borderRadius: 12 }}>
          <Ionicons name="flame" size={22} color={t.accent} />
          <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>≈ {fmt(kcal)} kcal</Text>
          <Muted style={{ flex: 1, textAlign: 'right' }}>
            MET {fmt(activity.met, 1)} · {fmt(data.profile.weightKg, 1)} kg
          </Muted>
        </View>
      </Card>

      {activity.strength && (
        <Card>
          <Title>Übungen</Title>
          {exercises.map((x) => (
            <View key={x.id} style={{ gap: 8, borderTopWidth: 0.5, borderTopColor: t.border, paddingTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: t.text, fontWeight: '700', flex: 1 }}>{x.exercise}</Text>
                <Muted>{fmt(x.sets * x.reps * x.weightKg)} kg</Muted>
                <IconButton
                  icon="remove-circle-outline"
                  color={t.danger}
                  size={20}
                  label="Übung entfernen"
                  onPress={() => setExercises((xs) => xs.filter((e) => e.id !== x.id))}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Field label="Sätze" defaultValue={String(x.sets)} keyboardType="numeric" onChangeText={(v) => updateExercise(x.id, { sets: parseNum(v) })} />
                <Field label="Wdh." defaultValue={String(x.reps)} keyboardType="numeric" onChangeText={(v) => updateExercise(x.id, { reps: parseNum(v) })} />
                <Field
                  label="Gewicht"
                  defaultValue={String(x.weightKg)}
                  keyboardType="decimal-pad"
                  suffix="kg"
                  onChangeText={(v) => updateExercise(x.id, { weightKg: parseNum(v) })}
                />
              </View>
            </View>
          ))}
          <Muted>Übung hinzufügen:</Muted>
          {exerciseSuggestions.map((g) => (
            <View key={g.group} style={{ gap: 6 }}>
              <Text style={{ color: t.text, fontWeight: '700', fontSize: 13 }}>{g.group}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {g.exercises.map((e) => (
                  <Pressable
                    key={e}
                    onPress={() => addExercise(e)}
                    accessibilityRole="button"
                    style={{ backgroundColor: t.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 }}
                  >
                    <Text style={{ color: t.primary, fontWeight: '600', fontSize: 13 }}>+ {e}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </Card>
      )}

      <Card>
        <Field label="Notizen" value={notes} onChangeText={setNotes} placeholder="Wie lief's?" multiline />
      </Card>

      <Button label={existing ? 'Änderungen speichern' : 'Training speichern'} icon="checkmark" onPress={save} disabled={mins <= 0} />
      {existing && (
        <Button
          label="Training löschen"
          icon="trash-outline"
          variant="ghost"
          onPress={() =>
            confirm('Training löschen?', `${existing.name} (${existing.minutes} min)`, () => {
              removeWorkout(existing.id);
              router.back();
            })
          }
        />
      )}
    </Screen>
  );
}
