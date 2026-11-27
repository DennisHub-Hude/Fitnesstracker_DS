import { useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { fmt } from '@/lib/confirm';
import { useTheme } from '@/theme';

function useWidth(initial = 300) {
  const [w, setW] = useState(initial);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  return [w, onLayout] as const;
}

/** Säulendiagramm mit optionaler Ziellinie */
export function BarChart({
  data,
  goal,
  color,
  height = 160,
}: {
  data: { label: string; value: number; highlight?: boolean }[];
  goal?: number;
  color: string;
  height?: number;
}) {
  const t = useTheme();
  const [width, onLayout] = useWidth();
  const top = 18;
  const bottom = 22;
  const chartH = height - top - bottom;
  const max = Math.max(1, goal ?? 0, ...data.map((d) => d.value)) * 1.1;
  const slot = width / Math.max(1, data.length);
  const barW = Math.min(28, slot * 0.6);
  const y = (v: number) => top + chartH - (v / max) * chartH;

  return (
    <View onLayout={onLayout} style={{ width: '100%' }}>
      <Svg width={width} height={height}>
        {data.map((d, i) => {
          const x = i * slot + (slot - barW) / 2;
          const h = Math.max(d.value > 0 ? 3 : 0, (d.value / max) * chartH);
          const over = goal !== undefined && d.value > goal * 1.05;
          return (
            <Rect
              key={i}
              x={x}
              y={top + chartH - h}
              width={barW}
              height={h}
              rx={6}
              fill={over ? t.accent : color}
              opacity={d.highlight ? 1 : 0.55}
            />
          );
        })}
        {data.map((d, i) =>
          d.value > 0 ? (
            <SvgText
              key={`v${i}`}
              x={i * slot + slot / 2}
              y={y(d.value) - 4}
              fontSize={10}
              fill={t.textMuted}
              textAnchor="middle"
            >
              {fmt(d.value)}
            </SvgText>
          ) : null,
        )}
        {goal !== undefined && goal > 0 && (
          <Line x1={0} x2={width} y1={y(goal)} y2={y(goal)} stroke={t.textMuted} strokeDasharray="4 4" strokeWidth={1} />
        )}
        {data.map((d, i) => (
          <SvgText
            key={`l${i}`}
            x={i * slot + slot / 2}
            y={height - 6}
            fontSize={11}
            fontWeight={d.highlight ? '700' : '400'}
            fill={d.highlight ? t.text : t.textMuted}
            textAnchor="middle"
          >
            {d.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

/** Liniendiagramm für Gewichtsverlauf */
export function LineChart({
  points,
  color,
  height = 180,
  unit = 'kg',
}: {
  points: { label: string; value: number }[];
  color: string;
  height?: number;
  unit?: string;
}) {
  const t = useTheme();
  const [width, onLayout] = useWidth();

  if (points.length < 2) {
    return (
      <View style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: t.textMuted, fontSize: 13 }}>Mindestens zwei Einträge nötig für den Verlauf.</Text>
      </View>
    );
  }

  const padL = 40;
  const padR = 12;
  const top = 12;
  const bottom = 24;
  const values = points.map((p) => p.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (max - min < 2) {
    min -= 1;
    max += 1;
  }
  const chartW = width - padL - padR;
  const chartH = height - top - bottom;
  const x = (i: number) => padL + (i / (points.length - 1)) * chartW;
  const y = (v: number) => top + chartH - ((v - min) / (max - min)) * chartH;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${path} L${x(points.length - 1)},${top + chartH} L${x(0)},${top + chartH} Z`;
  const ticks = [min, (min + max) / 2, max];
  const labelEvery = Math.ceil(points.length / 5);

  return (
    <View onLayout={onLayout} style={{ width: '100%' }}>
      <Svg width={width} height={height}>
        {ticks.map((v, i) => (
          <Line key={i} x1={padL} x2={width - padR} y1={y(v)} y2={y(v)} stroke={t.border} strokeWidth={1} />
        ))}
        {ticks.map((v, i) => (
          <SvgText key={`t${i}`} x={padL - 6} y={y(v) + 4} fontSize={10} fill={t.textMuted} textAnchor="end">
            {fmt(v, 1)}
          </SvgText>
        ))}
        <Path d={area} fill={color} opacity={0.12} />
        <Path d={path} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle key={`c${i}`} cx={x(i)} cy={y(p.value)} r={3.5} fill={t.card} stroke={color} strokeWidth={2} />
        ))}
        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <SvgText key={`x${i}`} x={x(i)} y={height - 6} fontSize={10} fill={t.textMuted} textAnchor="middle">
              {p.label}
            </SvgText>
          ) : null,
        )}
      </Svg>
      <Text style={{ position: 'absolute', top: -2, left: 0, color: t.textMuted, fontSize: 10 }}>{unit}</Text>
    </View>
  );
}
