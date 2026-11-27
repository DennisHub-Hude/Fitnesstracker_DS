import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button, Card, Chips, Field, Muted } from '@/components/ui';
import { newId, parseNum } from '@/lib/confirm';
import { useStore } from '@/store/AppStore';

export default function CustomFood() {
  const params = useLocalSearchParams<{ name?: string }>();
  const { addCustomFood } = useStore();
  const [name, setName] = useState(params.name ?? '');
  const [unit, setUnit] = useState<'g' | 'ml'>('g');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [portion, setPortion] = useState('100');
  const [portionLabel, setPortionLabel] = useState('');

  const valid = name.trim().length > 0 && parseNum(kcal) >= 0 && kcal.trim() !== '' && parseNum(portion) > 0;

  const save = () => {
    if (!valid) return;
    addCustomFood({
      id: `custom-${newId()}`,
      name: name.trim(),
      unit,
      kcal: parseNum(kcal),
      protein: parseNum(protein),
      carbs: parseNum(carbs),
      fat: parseNum(fat),
      portion: parseNum(portion),
      portionLabel: portionLabel.trim() || undefined,
      custom: true,
    });
    router.back();
  };

  return (
    <Screen>
      <Card>
        <Field label="Name" value={name} onChangeText={setName} placeholder="z. B. Omas Apfelkuchen" />
        <Chips
          options={[
            { key: 'g', label: 'Feste Nahrung (g)' },
            { key: 'ml', label: 'Getränk (ml)' },
          ]}
          value={unit}
          onChange={setUnit}
        />
      </Card>
      <Card>
        <Muted>Nährwerte pro 100 {unit} – stehen auf der Verpackung.</Muted>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="Kalorien" value={kcal} onChangeText={setKcal} keyboardType="numeric" suffix="kcal" />
          <Field label="Eiweiß" value={protein} onChangeText={setProtein} keyboardType="numeric" suffix="g" />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="Kohlenhydrate" value={carbs} onChangeText={setCarbs} keyboardType="numeric" suffix="g" />
          <Field label="Fett" value={fat} onChangeText={setFat} keyboardType="numeric" suffix="g" />
        </View>
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="Standardportion" value={portion} onChangeText={setPortion} keyboardType="numeric" suffix={unit} />
          <Field label="Bezeichnung" value={portionLabel} onChangeText={setPortionLabel} placeholder="1 Stück" />
        </View>
      </Card>
      <Button label="Speichern" icon="checkmark" onPress={save} disabled={!valid} />
    </Screen>
  );
}
