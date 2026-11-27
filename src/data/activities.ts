export interface Activity {
  id: string;
  name: string;
  /** Metabolisches Äquivalent (Compendium of Physical Activities, Richtwerte) */
  met: number;
  icon: string;
  strength?: boolean;
}

export const ACTIVITIES: Activity[] = [
  { id: 'strength', name: 'Krafttraining', met: 5.0, icon: 'barbell-outline', strength: true },
  { id: 'run', name: 'Laufen', met: 9.8, icon: 'walk-outline' },
  { id: 'walk', name: 'Spazieren', met: 3.5, icon: 'footsteps-outline' },
  { id: 'bike', name: 'Radfahren', met: 7.0, icon: 'bicycle-outline' },
  { id: 'swim', name: 'Schwimmen', met: 6.0, icon: 'water-outline' },
  { id: 'hiit', name: 'HIIT', met: 8.0, icon: 'flash-outline' },
  { id: 'yoga', name: 'Yoga', met: 2.5, icon: 'body-outline' },
  { id: 'hike', name: 'Wandern', met: 6.0, icon: 'trail-sign-outline' },
  { id: 'football', name: 'Fußball', met: 7.0, icon: 'football-outline' },
  { id: 'tennis', name: 'Tennis', met: 7.3, icon: 'tennisball-outline' },
  { id: 'basketball', name: 'Basketball', met: 6.5, icon: 'basketball-outline' },
  { id: 'row', name: 'Rudern', met: 7.0, icon: 'boat-outline' },
  { id: 'elliptical', name: 'Crosstrainer', met: 5.0, icon: 'fitness-outline' },
  { id: 'dance', name: 'Tanzen', met: 5.0, icon: 'musical-notes-outline' },
  { id: 'rope', name: 'Seilspringen', met: 11.0, icon: 'infinite-outline' },
  { id: 'other', name: 'Sonstiges', met: 4.0, icon: 'ellipsis-horizontal-circle-outline' },
];

export const EXERCISES = [
  'Bankdrücken',
  'Kniebeuge',
  'Kreuzheben',
  'Schulterdrücken',
  'Klimmzüge',
  'Rudern (Langhantel)',
  'Latziehen',
  'Beinpresse',
  'Ausfallschritte',
  'Bizepscurls',
  'Trizepsdrücken',
  'Liegestütze',
  'Dips',
  'Plank',
  'Crunches',
];

export function activityById(id: string): Activity {
  return ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[ACTIVITIES.length - 1];
}
