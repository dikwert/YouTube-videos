#!/bin/bash
# Prints container facts for each rendered part and writes a 12-frame contact sheet next to it.
# usage: scripts/check-output.sh <contact-sheet-dir> [parts...]
set -e
DIR="$1"; shift
mkdir -p "$DIR"
PARTS=("$@"); [ ${#PARTS[@]} -eq 0 ] && PARTS=(1 2 3 4 5)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for n in "${PARTS[@]}"; do
  f="$ROOT/out/part$n.mp4"
  [ -f "$f" ] || { echo "part$n: missing"; continue; }
  echo "== part$n"
  ffprobe -v error -show_entries format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,duration -of compact "$f"
  ffmpeg -y -loglevel error -i "$f" -vf "fps=1/3.4,scale=270:480,tile=6x2" -frames:v 1 "$DIR/part${n}_sheet.png"
done
