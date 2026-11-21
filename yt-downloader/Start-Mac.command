#!/bin/bash
# Startet den YT-Downloader. Richtet beim ersten Mal alles in einem eigenen
# Unterordner (.venv) ein, damit nichts am restlichen System verändert wird.
cd "$(dirname "$0")" || exit 1

fehler() {
  echo
  echo "❌ $1"
  echo
  echo "Mach bitte einen Screenshot von diesem Fenster und schick ihn an Claude."
  read -r -p "Enter drücken zum Schließen…"
  exit 1
}

# Python suchen (python.org-Version bevorzugt, dann Homebrew, dann System)
PY=""
for p in /Library/Frameworks/Python.framework/Versions/Current/bin/python3 \
         /opt/homebrew/bin/python3 /usr/local/bin/python3 python3; do
  if command -v "$p" >/dev/null 2>&1 && "$p" -c 'import sys; sys.exit(sys.version_info < (3, 10))' 2>/dev/null; then
    PY="$p"; break
  fi
done
[ -z "$PY" ] && fehler "Kein passendes Python (3.10 oder neuer) gefunden. Bitte installieren: https://www.python.org/downloads/"
echo "Python: $("$PY" --version)  ($PY)"

if [ ! -x .venv/bin/python ]; then
  echo "Erster Start – richte alles ein (dauert ca. 1 Minute)…"
  "$PY" -m venv .venv || fehler "Konnte die Umgebung (.venv) nicht anlegen."
fi

echo "Prüfe Updates für yt-dlp…"
.venv/bin/python -m pip install -q --disable-pip-version-check -U -r requirements.txt \
  || fehler "Konnte yt-dlp nicht installieren (Internetverbindung?)."

.venv/bin/python -c 'import tkinter' 2>/dev/null \
  || fehler "Diesem Python fehlt die Fensteroberfläche (Tkinter). Lösung: Python von https://www.python.org/downloads/ installieren und erneut starten."

command -v ffmpeg >/dev/null 2>&1 || echo "Hinweis: ffmpeg fehlt – ohne geht nur bis ca. 720p und kein MP3. (Installieren: brew install ffmpeg)"

echo "Starte YT-Downloader…"
.venv/bin/python ytdl.py || fehler "Das Programm ist mit einem Fehler beendet worden."
