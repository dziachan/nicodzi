#!/usr/bin/env python3
"""
YT-Downloader – lädt mehrere YouTube-Videos (oder Playlists) parallel herunter.

Start ohne Argumente  -> grafische Oberfläche
Start mit URLs        -> Kommandozeile, z.B.:
    python3 ytdl.py URL1 URL2 -o ~/Downloads -q 1080 -j 3
    python3 ytdl.py -f links.txt --audio
"""
from __future__ import annotations

import argparse
import os
import queue
import shutil
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

try:
    import yt_dlp
except ImportError:
    sys.exit("yt-dlp fehlt. Installieren mit:  pip3 install -U yt-dlp")

QUALITIES = {
    "Beste": None,
    "2160p": 2160,
    "1440p": 1440,
    "1080p": 1080,
    "720p": 720,
    "480p": 480,
}
DEFAULT_DIR = str(Path.home() / "Downloads" / "YouTube")
HAS_FFMPEG = shutil.which("ffmpeg") is not None
ERRORS: dict[str, str] = {}  # url -> vollständige Fehlermeldung


class _QuietLogger:
    """Unterdrückt yt-dlps eigene Konsolenausgabe – Fehler melden wir selbst."""
    def debug(self, msg): pass
    def info(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg): pass


def build_opts(out_dir: str, quality: int | None, audio: bool, hook, playlist: bool) -> dict:
    opts: dict = {
        "outtmpl": os.path.join(out_dir, "%(title)s [%(id)s].%(ext)s"),
        "progress_hooks": [hook],
        "noplaylist": not playlist,
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "ignoreerrors": False,
        "logger": _QuietLogger(),
        "restrictfilenames": False,
        "windowsfilenames": True,
    }
    h = f"[height<={quality}]" if quality else ""
    if not HAS_FFMPEG:
        # Ohne ffmpeg: nur Dateien laden, die Bild+Ton schon zusammen enthalten (meist max. 720p)
        opts["format"] = "bestaudio[ext=m4a]/bestaudio" if audio else f"best{h}[ext=mp4]/best{h}/best"
        return opts
    if audio:
        opts["format"] = "bestaudio/best"
        opts["postprocessors"] = [
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}
        ]
    else:
        # MP4 bevorzugen (läuft überall, auch auf iPhone/Mac), sonst bestes Format
        opts["format"] = (
            f"bestvideo{h}[ext=mp4]+bestaudio[ext=m4a]/"
            f"bestvideo{h}+bestaudio/best{h}/best"
        )
        opts["merge_output_format"] = "mp4"
    return opts


def download_one(url: str, out_dir: str, quality, audio: bool, playlist: bool, report) -> bool:
    """Lädt eine URL. report(url, status, prozent, titel) wird laufend aufgerufen."""
    state = {"title": url}

    def hook(d):
        info = d.get("info_dict") or {}
        state["title"] = info.get("title") or state["title"]
        if d["status"] == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
            pct = (d.get("downloaded_bytes", 0) / total * 100) if total else 0
            speed = d.get("speed") or 0
            report(url, f"lädt… {speed / 1e6:.1f} MB/s", pct, state["title"])
        elif d["status"] == "finished":
            report(url, "verarbeitet…", 100, state["title"])

    try:
        os.makedirs(out_dir, exist_ok=True)
        report(url, "startet…", 0, state["title"])
        with yt_dlp.YoutubeDL(build_opts(out_dir, quality, audio, hook, playlist)) as ydl:
            code = ydl.download([url])
        if code:
            report(url, "Fehler", 0, state["title"])
            return False
        report(url, "fertig ✓", 100, state["title"])
        return True
    except Exception as e:  # noqa: BLE001
        ERRORS[url] = str(e)
        msg = str(e).replace("ERROR: ", "").splitlines()[0]
        if "Unable to connect to proxy" in msg or "Failed to resolve" in msg or "getaddrinfo" in msg:
            msg = "Keine Verbindung zu YouTube"
        elif "not a bot" in msg:
            msg = "YouTube blockt (Bot-Schutz) – später erneut versuchen"
        elif "Private video" in msg or "Sign in" in msg:
            msg = "Video privat / Anmeldung nötig"
        elif "unavailable" in msg.lower():
            msg = "Video nicht verfügbar"
        msg = msg[:90]
        report(url, f"Fehler: {msg}", 0, state["title"])
        return False


def parse_urls(text: str) -> list[str]:
    seen, urls = set(), []
    for line in text.replace(",", "\n").split():
        line = line.strip()
        if line.startswith("http") and line not in seen:
            seen.add(line)
            urls.append(line)
    return urls


# --------------------------------------------------------------------------- CLI
def run_cli(argv: list[str]) -> int:
    p = argparse.ArgumentParser(description="Mehrere YouTube-Videos parallel herunterladen.")
    p.add_argument("urls", nargs="*", help="Video- oder Playlist-URLs")
    p.add_argument("-f", "--file", help="Textdatei mit einer URL pro Zeile")
    p.add_argument("-o", "--out", default=DEFAULT_DIR, help=f"Zielordner (Standard: {DEFAULT_DIR})")
    p.add_argument("-q", "--quality", default="Beste",
                   help="Maximale Auflösung: Beste, 2160, 1440, 1080, 720, 480")
    p.add_argument("-a", "--audio", action="store_true", help="Nur Audio als MP3")
    p.add_argument("-j", "--jobs", type=int, default=3, help="Parallele Downloads (Standard: 3)")
    p.add_argument("--no-playlist", action="store_true", help="Bei Playlist-Links nur das einzelne Video laden")
    a = p.parse_args(argv)

    text = " ".join(a.urls)
    if a.file:
        text += "\n" + Path(a.file).read_text(encoding="utf-8")
    urls = parse_urls(text)
    if not urls:
        p.error("Keine URLs angegeben.")

    q = a.quality if a.quality in QUALITIES else f"{a.quality.rstrip('p')}p"
    if q not in QUALITIES:
        p.error(f"Unbekannte Qualität: {a.quality}")
    quality = QUALITIES[q]
    lock = threading.Lock()
    last: dict[str, str] = {}

    def report(url, status, pct, title):
        if status.startswith("lädt"):
            return  # in der Konsole nur Statuswechsel zeigen
        with lock:
            if last.get(url) != status:
                last[url] = status
                print(f"[{status:>12}] {title}")

    print(f"{len(urls)} Link(s) -> {a.out}  ({'MP3' if a.audio else q}, {a.jobs} parallel)\n")
    with ThreadPoolExecutor(max_workers=max(1, a.jobs)) as ex:
        results = list(ex.map(lambda u: download_one(u, a.out, quality, a.audio, not a.no_playlist, report), urls))
    ok = sum(results)
    print(f"\nFertig: {ok}/{len(urls)} erfolgreich.")
    return 0 if ok == len(urls) else 1


# --------------------------------------------------------------------------- GUI
def run_gui() -> None:
    try:
        import tkinter as tk
        from tkinter import filedialog, messagebox, ttk
    except ImportError:
        sys.exit("Tkinter fehlt. Nutze die Kommandozeile (python3 ytdl.py --help) "
                 "oder installiere Tk (macOS/Homebrew: brew install python-tk).")

    root = tk.Tk()
    root.title("YT-Downloader")
    root.geometry("820x560")
    root.minsize(640, 420)
    events: queue.Queue = queue.Queue()
    rows: dict[str, str] = {}

    frm = ttk.Frame(root, padding=12)
    frm.pack(fill="both", expand=True)

    ttk.Label(frm, text="YouTube-Links (einer pro Zeile, Playlists gehen auch):").pack(anchor="w")
    txt = tk.Text(frm, height=7, wrap="none")
    txt.pack(fill="x", pady=(4, 10))

    opt = ttk.Frame(frm)
    opt.pack(fill="x")
    out_var = tk.StringVar(value=DEFAULT_DIR)
    ttk.Label(opt, text="Ordner:").grid(row=0, column=0, sticky="w")
    ttk.Entry(opt, textvariable=out_var).grid(row=0, column=1, sticky="ew", padx=6)
    ttk.Button(opt, text="Wählen…",
               command=lambda: out_var.set(filedialog.askdirectory(initialdir=out_var.get()) or out_var.get())
               ).grid(row=0, column=2)
    opt.columnconfigure(1, weight=1)

    opt2 = ttk.Frame(frm)
    opt2.pack(fill="x", pady=8)
    q_var = tk.StringVar(value="1080p")
    audio_var = tk.BooleanVar(value=False)
    pl_var = tk.BooleanVar(value=True)
    jobs_var = tk.IntVar(value=3)
    ttk.Label(opt2, text="Qualität:").pack(side="left")
    q_box = ttk.Combobox(opt2, textvariable=q_var, values=list(QUALITIES), width=8, state="readonly")
    q_box.pack(side="left", padx=(4, 14))
    ttk.Checkbutton(opt2, text="Nur Audio (MP3)", variable=audio_var,
                    command=lambda: q_box.config(state="disabled" if audio_var.get() else "readonly")
                    ).pack(side="left", padx=(0, 14))
    ttk.Checkbutton(opt2, text="Ganze Playlists", variable=pl_var).pack(side="left", padx=(0, 14))
    ttk.Label(opt2, text="Parallel:").pack(side="left")
    ttk.Spinbox(opt2, from_=1, to=8, textvariable=jobs_var, width=3).pack(side="left", padx=4)
    start_btn = ttk.Button(opt2, text="⬇  Herunterladen")
    start_btn.pack(side="right")

    tree = ttk.Treeview(frm, columns=("title", "pct", "status"), show="headings")
    for col, label, w in (("title", "Titel", 420), ("pct", "%", 60), ("status", "Status", 220)):
        tree.heading(col, text=label)
        tree.column(col, width=w, anchor="w" if col != "pct" else "e", stretch=(col == "title"))
    tree.pack(fill="both", expand=True)
    url_of: dict[str, str] = {}

    def show_error(_e=None):
        sel = tree.selection()
        if sel and url_of.get(sel[0]) in ERRORS:
            win = tk.Toplevel(root)
            win.title("Fehlerdetails")
            t = tk.Text(win, width=90, height=14, wrap="word")
            t.insert("1.0", ERRORS[url_of[sel[0]]])
            t.pack(fill="both", expand=True, padx=8, pady=8)
            ttk.Button(win, text="Kopieren", command=lambda: (root.clipboard_clear(),
                       root.clipboard_append(ERRORS[url_of[sel[0]]]))).pack(pady=(0, 8))

    tree.bind("<Double-1>", show_error)
    status_lbl = ttk.Label(frm, text="Bereit." + ("" if HAS_FFMPEG else
                           "  (ffmpeg fehlt → max. ca. 720p, Audio als M4A statt MP3)"))
    status_lbl.pack(anchor="w", pady=(6, 0))

    def report(url, status, pct, title):
        events.put((url, status, pct, title))

    def poll():
        try:
            while True:
                url, status, pct, title = events.get_nowait()
                if url == "__done__":
                    start_btn.config(state="normal")
                    status_lbl.config(text=status)
                    continue
                if url in rows:
                    tree.item(rows[url], values=(title, f"{pct:.0f}", status))
        except queue.Empty:
            pass
        root.after(150, poll)

    def start():
        urls = parse_urls(txt.get("1.0", "end"))
        if not urls:
            messagebox.showinfo("YT-Downloader", "Bitte mindestens einen Link einfügen.")
            return
        tree.delete(*tree.get_children())
        rows.clear()
        for u in urls:
            rows[u] = tree.insert("", "end", values=(u, "0", "wartet…"))
            url_of[rows[u]] = u
        start_btn.config(state="disabled")
        status_lbl.config(text=f"Lade {len(urls)} Link(s)…")
        out, quality = out_var.get(), QUALITIES.get(q_var.get())
        audio, playlist, jobs = audio_var.get(), pl_var.get(), max(1, int(jobs_var.get()))

        def worker():
            with ThreadPoolExecutor(max_workers=jobs) as ex:
                res = list(ex.map(lambda u: download_one(u, out, quality, audio, playlist, report), urls))
            hint = "  (Doppelklick auf eine Zeile zeigt den Fehler)" if sum(res) < len(urls) else ""
            events.put(("__done__", f"Fertig: {sum(res)}/{len(urls)} erfolgreich – gespeichert in {out}{hint}", 0, ""))

        threading.Thread(target=worker, daemon=True).start()

    start_btn.config(command=start)
    root.after(150, poll)
    root.mainloop()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        sys.exit(run_cli(sys.argv[1:]))
    run_gui()
