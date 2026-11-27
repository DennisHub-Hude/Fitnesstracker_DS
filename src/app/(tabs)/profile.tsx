import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button, Card, Chips, Field, Muted, Title } from '@/components/ui';
import { ACTIVITY_LEVELS, bmr, calorieGoal, GOALS, macroGoals, tdee } from '@/lib/calc';
import { confirm, fmt, parseNum } from '@/lib/confirm';
import { useStore } from '@/store/AppStore';
import type { ActivityLevel, Goal, Profile, Sex } from '@/store/types';
import { useTheme } from '@/theme';

export default function ProfileScreen() {
  const t = useTheme();
  const { data, updateProfile, resetAll } = useStore();
  const p = data.profile;

  const [name, setName] = useState(p.name);
  const [sex, setSex] = useState<Sex>(p.sex);
  const [age, setAge] = useState(String(p.age));
  const [height, setHeight] = useState(String(p.heightCm));
  const [weight, setWeight] = useState(String(p.weightKg).replace('.', ','));
  const [activity, setActivity] = useState<ActivityLevel>(p.activity);
  const [goal, setGoal] = useState<Goal>(p.goal);
  const [water, setWater] = useState(String(p.waterGoalMl));
  const [override, setOverride] = useState(p.calorieOverride ? String(p.calorieOverride) : '');
  const [saved, setSaved] = useState(false);

  // Gewicht kann auch im Fortschritt-Tab geändert werden
  const [syncedWeight, setSyncedWeight] = useState(p.weightKg);
  if (syncedWeight !== p.weightKg) {
    setSyncedWeight(p.weightKg);
    setWeight(String(p.weightKg).replace('.', ','));
  }

  const draft: Profile = {
    ...p,
    name: name.trim(),
    sex,
    age: parseNum(age) || p.age,
    heightCm: parseNum(height) || p.heightCm,
    weightKg: parseNum(weight) || p.weightKg,
    activity,
    goal,
    waterGoalMl: parseNum(water) || 2500,
    calorieOverride: parseNum(override) > 0 ? parseNum(override) : undefined,
    configured: true,
  };
  const kcal = calorieGoal(draft);
  const macros = macroGoals(draft, kcal);

  const save = () => {
    updateProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Screen>
      <Card>
        <Title>Über dich</Title>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Wie dürfen wir dich nennen?" />
        <Chips
          options={[
            { key: 'm', label: 'Männlich' },
            { key: 'f', label: 'Weiblich' },
          ]}
          value={sex}
          onChange={setSex}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="Alter" value={age} onChangeText={setAge} keyboardType="numeric" suffix="J." />
          <Field label="Größe" value={height} onChangeText={setHeight} keyboardType="numeric" suffix="cm" />
          <Field label="Gewicht" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" suffix="kg" />
        </View>
      </Card>

      <Card>
        <Title>Alltagsaktivität</Title>
        {ACTIVITY_LEVELS.map((a) => {
          const active = a.key === activity;
          return (
            <Pressable
              key={a.key}
              onPress={() => setActivity(a.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: active ? t.primary : t.border,
                backgroundColor: active ? t.primarySoft : 'transparent',
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: active ? t.primary : t.textMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {active && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.primary }} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: '600' }}>{a.label}</Text>
                <Muted>{a.hint}</Muted>
              </View>
              <Muted>×{a.factor}</Muted>
            </Pressable>
          );
        })}
        <Muted>Trainings, die du einträgst, werden zusätzlich gutgeschrieben – wähle hier deinen Alltag ohne Sport, wenn du jedes Training loggst.</Muted>
      </Card>

      <Card>
        <Title>Ziel</Title>
        <Chips options={GOALS.map((g) => ({ key: g.key, label: g.label }))} value={goal} onChange={setGoal} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="Wasserziel" value={water} onChangeText={setWater} keyboardType="numeric" suffix="ml" />
          <Field label="Eigenes kcal-Ziel" value={override} onChangeText={setOverride} keyboardType="numeric" placeholder="automatisch" suffix="kcal" />
        </View>
      </Card>

      <Card style={{ backgroundColor: t.primarySoft, borderColor: t.primary }}>
        <Title>Dein Tagesbedarf</Title>
        <Row label="Grundumsatz (Mifflin-St Jeor)" value={`${fmt(bmr(draft))} kcal`} />
        <Row label="Gesamtumsatz" value={`${fmt(tdee(draft))} kcal`} />
        <Row label="Kalorienziel" value={`${fmt(kcal)} kcal`} bold />
        <Row label="Eiweiß / Kohlenhydrate / Fett" value={`${macros.protein} / ${macros.carbs} / ${macros.fat} g`} />
      </Card>

      <Button label={saved ? 'Gespeichert ✓' : 'Profil speichern'} icon="save-outline" onPress={save} />

      <Button
        label="Alle Daten löschen"
        icon="trash-outline"
        variant="ghost"
        onPress={() => confirm('Alle Daten löschen?', 'Profil, Mahlzeiten, Trainings und Gewichte werden unwiderruflich gelöscht.', resetAll)}
      />
      <Muted style={{ textAlign: 'center' }}>
        Alle Daten bleiben lokal auf deinem Gerät. Die Werte sind Schätzungen und ersetzen keine ärztliche Beratung.
      </Muted>
    </Screen>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
      <Text style={{ color: t.text, flex: 1 }}>{label}</Text>
      <Text style={{ color: t.text, fontWeight: bold ? '800' : '600', fontSize: bold ? 17 : 15 }}>{value}</Text>
    </View>
  );
}
