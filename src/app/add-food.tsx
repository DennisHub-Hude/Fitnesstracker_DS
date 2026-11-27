import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';

import { Button, Card, Chips, Field, IconButton, Muted } from '@/components/ui';
import { nutrientsFor } from '@/lib/calc';
import { confirm, fmt, newId, parseNum } from '@/lib/confirm';
import { todayKey } from '@/lib/date';
import { useStore } from '@/store/AppStore';
import { MEAL_LABELS, MEALS, type Food, type Meal } from '@/store/types';
import { useTheme } from '@/theme';

function defaultMeal(): Meal {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

type Mode = 'search' | 'quick';

export default function AddFood() {
  const t = useTheme();
  const params = useLocalSearchParams<{ date?: string; meal?: Meal }>();
  const date = params.date ?? todayKey();
  const { data, allFoods, addFoodEntry, removeCustomFood } = useStore();

  const [meal, setMeal] = useState<Meal>(params.meal && MEALS.includes(params.meal) ? params.meal : defaultMeal());
  const [mode, setMode] = useState<Mode>('search');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Food | null>(null);
  const [amount, setAmount] = useState('');

  const [quickName, setQuickName] = useState('');
  const [quickKcal, setQuickKcal] = useState('');

  // Zuletzt verwendete Lebensmittel zuerst
  const recentIds = useMemo(() => {
    const seen = new Set<string>();
    for (let i = data.foods.length - 1; i >= 0 && seen.size < 8; i--) {
      const id = data.foods[i].foodId;
      if (id) seen.add(id);
    }
    return [...seen];
  }, [data.foods]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return allFoods.filter((f) => f.name.toLowerCase().includes(q));
    const recent = recentIds.map((id) => allFoods.find((f) => f.id === id)).filter((f): f is Food => !!f);
    return [...recent, ...allFoods.filter((f) => !recentIds.includes(f.id))];
  }, [allFoods, query, recentIds]);

  const select = (f: Food) => {
    setSelected(f);
    setAmount(String(f.portion));
  };

  const amountNum = parseNum(amount);
  const preview = selected ? nutrientsFor(selected, amountNum) : null;

  const save = () => {
    if (!selected || amountNum <= 0 || !preview) return;
    addFoodEntry({
      id: newId(),
      date,
      meal,
      foodId: selected.id,
      name: selected.name,
      amount: amountNum,
      unit: selected.unit,
      ...preview,
    });
    router.back();
  };

  const saveQuick = () => {
    const kcal = Math.round(parseNum(quickKcal));
    if (kcal <= 0) return;
    addFoodEntry({
      id: newId(),
      date,
      meal,
      name: quickName.trim() || 'Schnelleintrag',
      amount: kcal,
      unit: 'kcal',
      kcal,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
    router.back();
  };

  const header = (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Chips options={MEALS.map((m) => ({ key: m, label: MEAL_LABELS[m] }))} value={meal} onChange={setMeal} />
      <Chips
        options={[
          { key: 'search', label: '🔍 Datenbank' },
          { key: 'quick', label: '⚡ Nur Kalorien' },
        ]}
        value={mode}
        onChange={setMode}
      />

      {mode === 'quick' ? (
        <Card>
          <Field label="Bezeichnung (optional)" value={quickName} onChangeText={setQuickName} placeholder="z. B. Kuchen beim Kollegen" />
          <Field label="Kalorien" value={quickKcal} onChangeText={setQuickKcal} keyboardType="numeric" suffix="kcal" placeholder="0" />
          <Button label="Hinzufügen" icon="checkmark" onPress={saveQuick} disabled={parseNum(quickKcal) <= 0} />
        </Card>
      ) : selected && preview ? (
        <Card style={{ borderColor: t.primary, borderWidth: 1.5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 18, fontWeight: '700' }}>{selected.name}</Text>
              <Muted>
                pro 100 {selected.unit}: {selected.kcal} kcal
              </Muted>
            </View>
            <IconButton icon="close-circle" color={t.textMuted} label="Auswahl aufheben" onPress={() => setSelected(null)} />
          </View>
          <Field label="Menge" value={amount} onChangeText={setAmount} keyboardType="numeric" suffix={selected.unit} autoFocus />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              { label: selected.portionLabel ?? 'Portion', v: selected.portion },
              { label: `2× ${selected.portionLabel ?? 'Portion'}`, v: selected.portion * 2 },
              { label: `100 ${selected.unit}`, v: 100 },
            ].map((o) => (
              <Pressable
                key={o.label}
                onPress={() => setAmount(String(o.v))}
                style={{ backgroundColor: t.primarySoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 }}
              >
                <Text style={{ color: t.primary, fontWeight: '600', fontSize: 13 }}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Nutrient label="kcal" value={preview.kcal} color={t.primary} />
            <Nutrient label="Eiweiß" value={preview.protein} color={t.protein} unit="g" />
            <Nutrient label="Kohlenhydr." value={preview.carbs} color={t.carbs} unit="g" />
            <Nutrient label="Fett" value={preview.fat} color={t.fat} unit="g" />
          </View>
          <Button label={`Zu ${MEAL_LABELS[meal]} hinzufügen`} icon="checkmark" onPress={save} disabled={amountNum <= 0} />
        </Card>
      ) : (
        <>
          <Field value={query} onChangeText={setQuery} placeholder="Lebensmittel suchen …" autoCorrect={false} clearButtonMode="while-editing" />
          <Button
            label="Eigenes Lebensmittel anlegen"
            icon="create-outline"
            variant="ghost"
            onPress={() => router.push({ pathname: '/custom-food', params: { name: query } })}
          />
          {!query && recentIds.length > 0 && <Muted>Zuletzt verwendet zuerst</Muted>}
        </>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={mode === 'search' && !selected ? list : []}
        keyExtractor={(f) => f.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, width: '100%', maxWidth: 640, alignSelf: 'center' }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          mode === 'search' && !selected ? <Muted style={{ textAlign: 'center', marginTop: 20 }}>Nichts gefunden – lege es als eigenes Lebensmittel an.</Muted> : undefined
        }
        ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: t.border }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => select(item)}
            onLongPress={
              item.custom
                ? () => confirm('Eigenes Lebensmittel löschen?', item.name, () => removeCustomFood(item.id))
                : undefined
            }
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              gap: 10,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            {recentIds.includes(item.id) && !query ? (
              <Ionicons name="time-outline" size={18} color={t.textMuted} />
            ) : item.custom ? (
              <Ionicons name="person-outline" size={18} color={t.accent} />
            ) : (
              <Ionicons name="leaf-outline" size={18} color={t.primary} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }}>{item.name}</Text>
              <Muted>
                {item.portionLabel ? `${item.portionLabel} (${item.portion} ${item.unit})` : `${item.portion} ${item.unit}`} ·{' '}
                {fmt((item.kcal * item.portion) / 100)} kcal
              </Muted>
            </View>
            <Text style={{ color: t.textMuted, fontSize: 12 }}>
              {item.kcal} kcal/100{item.unit}
            </Text>
          </Pressable>
        )}
      />
    </KeyboardAvoidingView>
  );
}

function Nutrient({ label, value, color, unit = '' }: { label: string; value: number; color: string; unit?: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color, fontSize: 18, fontWeight: '800' }}>
        {fmt(value, unit ? 1 : 0)}
        {unit}
      </Text>
      <Text style={{ color: t.textMuted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}
