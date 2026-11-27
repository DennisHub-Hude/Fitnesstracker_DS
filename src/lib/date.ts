const pad = (n: number) => String(n).padStart(2, '0');

/** Lokaler Datums-Schlüssel im Format YYYY-MM-DD */
export function toKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

export function todayKey(): string {
  return toKey(new Date());
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WEEKDAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

export function weekdayShort(key: string): string {
  return WEEKDAYS[fromKey(key).getDay()];
}

export function formatShort(key: string): string {
  const d = fromKey(key);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

export function formatLong(key: string): string {
  const today = todayKey();
  if (key === today) return 'Heute';
  if (key === addDays(today, -1)) return 'Gestern';
  if (key === addDays(today, 1)) return 'Morgen';
  const d = fromKey(key);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

/** Die letzten n Tage (inkl. heute), ältester zuerst */
export function lastDays(n: number, end: string = todayKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}
