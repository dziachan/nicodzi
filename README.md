# Phorge — Mobile Design Editor → Prompt

Phorge ist ein **Browser-Tool für PC & Mac** (läuft im Browser, keine
Installation nötig) zum visuellen Gestalten von mobilen Apps. Du legst beliebig
viele leere Handy-Screens **nebeneinander** an — Hauptseite, Einstellungen,
Profil usw. — und gestaltest sie gleichzeitig per Klick zu deinem Wunsch-Layout
(Komponenten, Farben, Schrift, Stil). Phorge wandelt das Design dann in einen
**fertigen Prompt fürs Vibe-Coding** um. Diesen Prompt fügst du in Claude,
Cursor, v0 o. Ä. ein, damit deine App von Anfang an modern und aufgeräumt
aussieht.

## Was du machen kannst

- **Mehrere Screens nebeneinander:** Alle Handy-Screens liegen gleichzeitig auf
  der Fläche (wie Artboards). Das aktive Handy ist hervorgehoben; ein Klick auf
  ein Handy oder seinen Namen macht es aktiv. „Neuer Screen" legt ein weiteres an.
- **Leeres Handy gestalten:** Komponenten aus der linken Palette per Klick zum
  aktiven Handy hinzufügen (Überschrift, Text, Button, Bild, Eingabefeld, Karte,
  Liste, Badge, Profil, Trennlinie, Abstand).
- **Bilder per Drag & Drop:** PNG/JPEG direkt auf ein Handy ziehen, dann frei
  verschieben, an der Ecke skalieren und am Griff drehen.
- **Live bearbeiten:** Jedes Element auswählen und rechts seine Eigenschaften
  ändern (Text, Ausrichtung, Schriftgröße/-stärke, Radius, Variante …).
  Elemente per Pfeil-Buttons sortieren oder löschen.
- **Theme & Stil:** Farbpalette, Schriftart, Eckenradius, Dark/Light-Modus und
  Stil-Presets (Minimal, Glass, Neumorph, Bold, Playful) festlegen.
- **Mehrere Screens:** Beliebig viele Screens anlegen und benennen, plus
  globale Statusleiste und Tab-Bar.
- **Prompt generieren:** Ein Klick auf „✨ Prompt generieren" erzeugt einen
  strukturierten, KI-tauglichen Prompt, den du direkt kopieren kannst.
- **Export / Import:** Dein Projekt als JSON sichern und wieder laden.

## Starten

Voraussetzung: Node.js 18+.

```bash
npm install
npm run dev
```

Dann im Browser `http://localhost:5173` öffnen.

## Build

```bash
npm run build      # erzeugt dist/
npm run preview    # produktiven Build lokal ansehen
```

## Als Mac-App (optional)

Phorge ist eine Web-App und läuft im Browser. Für eine echte `.app` kann der
Build mit [Tauri](https://tauri.app) oder [Electron](https://www.electronjs.org)
verpackt werden — das `dist/`-Verzeichnis dient dabei als Frontend.

## Tech-Stack

React 18 · TypeScript · Vite · Zustand. Kein Backend, alles läuft lokal im
Browser.
