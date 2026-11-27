# FitTrack – Fitnesstracker mit Kalorienzähler

Expo-App (SDK 58, Expo Router, TypeScript) für **iPhone und Android**. Alle Daten bleiben lokal auf dem Gerät (AsyncStorage).

## Funktionen

- **Heute** – Kalorienring (Ziel − gegessen + verbrannt), Makros, Wasserzähler, Tagesaktivität
- **Ernährung** – Tagebuch nach Mahlzeiten, Datum wechselbar, ~90 Lebensmittel mit Nährwerten,
  Suche, „zuletzt verwendet“, Portionsvorschläge, eigene Lebensmittel, Schnelleintrag nur mit kcal
- **Training** – 16 Sportarten, Kalorienverbrauch über MET × Gewicht × Dauer × Intensität,
  Krafttraining mit Übungen/Sätzen/Wdh./Gewicht (übernimmt die letzten Werte), Wochenübersicht
- **Fortschritt** – Gewichtsverlauf (7/30/90 Tage), BMI, Kalorien der letzten 7 Tage, Defizit/Überschuss
- **Profil** – Grundumsatz nach Mifflin-St Jeor, Aktivitätslevel, Ziel (abnehmen/halten/aufbauen),
  automatische Makroziele, optional eigenes kcal-Ziel, Hell-/Dunkelmodus automatisch

## Starten

```bash
npm install
npx expo start
```

QR-Code mit der **Expo Go**-App scannen (iOS: Kamera-App, Android: Expo Go). Alle verwendeten
Module sind in Expo Go enthalten – kein eigener Build nötig.

## Builds für den Store

```bash
npx eas-cli@latest build --platform all
```

Bundle-ID / Package: `com.fittrack.app` (in `app.json` anpassen).

## Struktur

```
src/app/            Screens (Expo Router) – (tabs)/ sowie Modals add-food, custom-food, workout
src/components/     UI-Bausteine, Fortschrittsring, SVG-Diagramme
src/data/           Lebensmittel- und Aktivitätsdatenbank
src/lib/            Berechnungen (BMR, TDEE, Makros, MET), Datumshilfen
src/store/          Datentypen und App-Store mit lokaler Speicherung
```

> Die Werte sind Schätzungen und ersetzen keine ärztliche oder ernährungswissenschaftliche Beratung.
