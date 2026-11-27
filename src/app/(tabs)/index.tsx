import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Ring } from '@/components/Ring';
import { Screen } from '@/components/Screen';
import { Button, Card, MacroBar, Muted, ProgressBar, Stat, Title, type IconName } from '@/components/ui';
import { activityById } from '@/data/activities';
import { calorieGoal, macroGoals, sumEntries } from '@/lib/calc';
import { fmt } from '@/lib/confirm';
import { formatLong, todayKey } from '@/lib/date';
import { useDay, useStore } from '@/store/AppStore';
import { useTheme } from '@/theme';

const GLASS_ML = 250;

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Hallo';
  return 'Guten Abend';
}

export default function Dashboard() {
  const t = useTheme();
  const { data, addWater } = useStore();
  const today = todayKey();
  const day = useDay(today);
  const p = data.profile;

  const goal = calorieGoal(p);
  const macros = macroGoals(p, goal);
  const eaten = sumEntries(day.foods);
  const budget = goal + day.burned;
  const remaining = budget - eaten.kcal;
  const glasses = Math.round(day.water / GLASS_ML);
  const glassGoal = Math.ceil(p.waterGoalMl / GLASS_ML);

  return (
    <Screen>
      <View>
        <Text style={{ color: t.text, fontSize: 26, fontWeight: '800' }}>
          {greeting()}
          {p.name ? `, ${p.name}` : ''} 👋
        </Text>
        <Muted>{formatLong(today)} – bleib dran!</Muted>
      </View>

      {!p.configured && (
        <Pressable onPress={() => router.push('/profile')}>
          <Card style={{ backgroundColor: t.accentSoft, borderColor: t.accent, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="sparkles-outline" size={24} color={t.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontWeight: '700' }}>Profil einrichten</Text>
              <Muted>Für ein persönliches Kalorienziel brauchen wir Größe, Gewicht & Ziel.</Muted>
            </View>
            <Ionicons name="chevron-forward" size={20} color={t.accent} />
          </Card>
        </Pressable>
      )}

      <Card>
        <Title>Kalorien</Title>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ring progress={budget > 0 ? eaten.kcal / budget : 0} color={remaining < 0 ? t.danger : t.primary} size={150} stroke={14}>
            <Text style={{ color: t.text, fontSize: 30, fontWeight: '800' }}>{fmt(Math.abs(remaining))}</Text>
            <Muted>{remaining >= 0 ? 'übrig' : 'zu viel'}</Muted>
          </Ring>
          <View style={{ flex: 1, gap: 12 }}>
            <KcalRow icon="flag-outline" label="Ziel" value={goal} color={t.textMuted} />
            <KcalRow icon="restaurant-outline" label="Gegessen" value={eaten.kcal} color={t.primary} />
            <KcalRow icon="flame-outline" label="Verbrannt" value={day.burned} color={t.accent} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <MacroBar label="Eiweiß" value={eaten.protein} goal={macros.protein} color={t.protein} />
          <MacroBar label="Kohlenhydr." value={eaten.carbs} goal={macros.carbs} color={t.carbs} />
          <MacroBar label="Fett" value={eaten.fat} goal={macros.fat} color={t.fat} />
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button
          label="Mahlzeit"
          icon="add-circle-outline"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/add-food', params: { date: today } })}
        />
        <Button
          label="Training"
          icon="add-circle-outline"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/workout', params: { date: today } })}
        />
      </View>

      <Card>
        <Title right={<Muted>{fmt(day.water / 1000, 2)} / {fmt(p.waterGoalMl / 1000, 1)} l</Muted>}>Wasser</Title>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {Array.from({ length: Math.max(glassGoal, glasses) }, (_, i) => (
            <Ionicons key={i} name={i < glasses ? 'water' : 'water-outline'} size={26} color={t.water} />
          ))}
        </View>
        <ProgressBar value={day.water} max={p.waterGoalMl} color={t.water} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="– Glas" variant="ghost" style={{ flex: 1 }} onPress={() => addWater(today, -GLASS_ML)} disabled={day.water <= 0} />
          <Button label="+ Glas (250 ml)" variant="secondary" style={{ flex: 2 }} onPress={() => addWater(today, GLASS_ML)} />
        </View>
      </Card>

      <Card>
        <Title>Aktivität heute</Title>
        <View style={{ flexDirection: 'row' }}>
          <Stat label="Einheiten" value={String(day.workouts.length)} icon="barbell-outline" color={t.primary} />
          <Stat label="Minuten" value={fmt(day.minutes)} icon="time-outline" color={t.water} />
          <Stat label="kcal" value={fmt(day.burned)} icon="flame-outline" color={t.accent} />
        </View>
        {day.workouts.map((w) => (
          <View key={w.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={activityById(w.activityId).icon as IconName} size={20} color={t.primary} />
            <Text style={{ color: t.text, flex: 1 }}>{w.name}</Text>
            <Muted>
              {w.minutes} min · {w.kcal} kcal
            </Muted>
          </View>
        ))}
      </Card>

      <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="scale-outline" size={26} color={t.protein} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>{fmt(p.weightKg, 1)} kg</Text>
          <Muted>Aktuelles Gewicht</Muted>
        </View>
        <Button label="Eintragen" variant="ghost" onPress={() => router.push('/progress')} />
      </Card>
    </Screen>
  );
}

function KcalRow({ icon, label, value, color }: { icon: IconName; label: string; value: number; color: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons name={icon} size={20} color={color} />
      <View>
        <Muted>{label}</Muted>
        <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>{fmt(value)} kcal</Text>
      </View>
    </View>
  );
}
