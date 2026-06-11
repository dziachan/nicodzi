# Phorge — Mobile Design Editor → Prompt

Phorge ist ein visueller Design-Editor für mobile Apps. Du gestaltest ein leeres
Handy per Klick zu deinem Wunsch-Layout — Komponenten, Farben, Schrift, Stil —
und Phorge wandelt das Design in einen **fertigen Prompt fürs Vibe-Coding** um.
Diesen Prompt fügst du in Claude, Cursor, v0 o. Ä. ein, damit deine App von
Anfang an modern und aufgeräumt aussieht.

## Was du machen kannst

- **Leeres Handy gestalten:** Komponenten aus der linken Palette per Klick
  hinzufügen (Überschrift, Text, Button, Bild, Eingabefeld, Karte, Liste,
  Badge, Profil, Trennlinie, Abstand).
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
