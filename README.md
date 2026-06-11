# Phorge — Mobile Design Editor → Prompt

Phorge ist ein **Browser-Tool für PC & Mac** (läuft im Browser, keine
Installation nötig) zum visuellen Gestalten von mobilen Apps. Du baust mehrere
Handy-Screens (Login, Home, Profil …), platzierst Komponenten frei per Drag &
Drop, definierst zentrale Design-Tokens — und exportierst daraus eine
**vollständige Build-Anleitung für Claude Code**, mit der eine komplett
funktionierende App entsteht (nicht nur das Design).

## Was du machen kannst

- **Multi-Screen:** Beliebig viele Screens anlegen, benennen, duplizieren und
  löschen. Alle Screens liegen als Thumbnails nebeneinander; Klick öffnet einen
  Screen im Editor. Navigation definierbar (z. B. Button „Anmelden" → Screen
  „Home").
- **Komponenten-Bibliothek:** Button, Textfeld, Überschrift, Bild-Platzhalter,
  Card, Liste, Bottom-Navigation, Top-Bar, Icon, Toggle/Switch, Suchleiste —
  per Klick oder Drag platzierbar, frei verschieb-, skalier- und löschbar.
- **Eigenschaften-Panel:** Text, Farben, Schriftgröße, Eckenradius, Ausrichtung,
  Position/Größe und Navigationsziel je Komponente.
- **Globale Design-Tokens:** Primär-/Sekundär-/Hintergrund-/Textfarbe, Schriftart,
  Basis-Schriftgröße, globaler Eckenradius und Abstands-Raster (4/8px) — wirken
  sofort auf alle Screens. Plus Presets: Minimal Light, Dark Mode, Playful,
  Corporate.
- **Bilder per Drag & Drop:** PNG/JPEG direkt auf einen Screen ziehen.
- **Prompt-Export:** Erzeugt eine vollständige Markdown-Bauanleitung inkl.
  Design-Tokens, Screen-Layouts, Navigation und automatisch abgeleiteten
  Funktionalitäts-Anweisungen (Login, Listen-CRUD, Live-Suche, Toggle-Persistenz
  …) plus optionalem Freitext „Was soll die App können?". Copy-Button + .md-Download.
- **Quality of Life:** Undo/Redo (40 Schritte, Ctrl+Z / Ctrl+Y), Auto-Speicherung
  im localStorage, Zoom (50/75/100 %), iPhone-/Android-Rahmen.

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
