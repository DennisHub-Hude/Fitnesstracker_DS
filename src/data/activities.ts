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
  { id: 'bodypump', name: 'Body Pump', met: 5.5, icon: 'barbell' },
  { id: 'hiit', name: 'HIIT', met: 8.0, icon: 'flash-outline' },
  { id: 'indoorcycling', name: 'Indoor Cycling', met: 8.5, icon: 'speedometer-outline' },
  { id: 'bike', name: 'Radfahren', met: 7.0, icon: 'bicycle-outline' },
  { id: 'run', name: 'Laufen', met: 9.8, icon: 'walk-outline' },
  { id: 'walk', name: 'Spazieren', met: 3.5, icon: 'footsteps-outline' },
  { id: 'hike', name: 'Wandern', met: 6.0, icon: 'trail-sign-outline' },
  { id: 'elliptical', name: 'Crosstrainer', met: 5.0, icon: 'fitness-outline' },
  { id: 'yoga', name: 'Yoga', met: 2.5, icon: 'body-outline' },
  { id: 'basketball', name: 'Basketball', met: 6.5, icon: 'basketball-outline' },
  { id: 'other', name: 'Sonstiges', met: 4.0, icon: 'ellipsis-horizontal-circle-outline' },
];

/** Kraftübungen, nach Muskelgruppe sortiert (Brust → Rücken → Schultern → Bizeps → Trizeps) */
export const EXERCISE_GROUPS: { group: string; exercises: string[] }[] = [
  {
    group: 'Brust',
    exercises: ['Bankdrücken Flachbank Langhantel', 'Schrägbankdrücken Kurzhantel', 'Chest Fly Maschine', 'Chest Fly Kabel'],
  },
  {
    group: 'Rücken',
    exercises: ['Lat Pulldown Maschine', 'Lat Pulldown Kabel', 'Seated Row Maschine', 'Seated Row Kabel', 'High Row'],
  },
  {
    group: 'Schultern',
    exercises: ['Overhead Press Kurzhantel', 'Reverse Fly Maschine'],
  },
  {
    group: 'Bizeps',
    exercises: ['Biceps Curl Langhantel', 'Biceps Curl Kurzhantel', 'Hammer Curl Kurzhantel', 'Preacher Curl Maschine'],
  },
  {
    group: 'Trizeps',
    exercises: ['Triceps Extension Langhantel', 'Triceps Extension Kabel'],
  },
];

export function activityById(id: string): Activity {
  return ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[ACTIVITIES.length - 1];
}
