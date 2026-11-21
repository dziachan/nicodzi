@echo off
cd /d "%~dp0"
py -m pip install -q -U -r requirements.txt
py ytdl.py
