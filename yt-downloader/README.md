# YT-Downloader

Lädt mehrere YouTube-Videos oder ganze Playlists **gleichzeitig** herunter, als MP4 oder nur als MP3-Audio.
Basiert auf [yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Einmalig einrichten

1. **Python 3** installieren: https://www.python.org/downloads/ (die Version von python.org bringt die Oberfläche gleich mit)
2. **ffmpeg** installieren (nötig für hohe Auflösungen und MP3):
   - Mac: `brew install ffmpeg`
   - Windows: `winget install ffmpeg`

## Starten

- **Mac:** Doppelklick auf `Start-Mac.command` (beim ersten Mal: Rechtsklick → Öffnen)
- **Windows:** Doppelklick auf `Start-Windows.bat`

Links einfügen (einer pro Zeile), Qualität wählen, auf **Herunterladen** klicken.
Standard-Zielordner: `Downloads/YouTube`.

## Kommandozeile (optional)

```bash
python3 ytdl.py URL1 URL2 URL3 -q 1080 -j 4        # 4 parallel, max. 1080p
python3 ytdl.py -f links.txt --audio                 # alle Links aus Datei als MP3
python3 ytdl.py --help
```

## Wenn es mal nicht mehr geht

YouTube ändert öfter etwas. Dann hilft fast immer ein Update:

```bash
python3 -m pip install -U yt-dlp
```

(Die Startdateien machen das automatisch bei jedem Start.)

## Hinweis

Lade nur Videos herunter, die du nutzen darfst (eigene Videos, freie Lizenzen, private Kopie im Rahmen des Erlaubten).
Laut YouTube-Nutzungsbedingungen sind Downloads außerhalb der offiziellen Funktionen nicht vorgesehen.
