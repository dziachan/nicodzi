#!/bin/bash
cd "$(dirname "$0")"
python3 -m pip install -q -U -r requirements.txt
python3 ytdl.py
