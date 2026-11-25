#!/usr/bin/env bash
# Голосовые тесты для серии «−20. ЗАПЕРТ В ФУРЕ». Ключ подставляет сетевой прокси, в файл он не пишется.
set -euo pipefail
cd "$(dirname "$0")"
TMP=$(mktemp -d)
speak() { # name voice_id model text
  local name=$1 voice=$2 model=$3 text=$4
  printf '{"text":"%s","model_id":"%s","voice_settings":{"stability":0.35,"similarity_boost":0.8,"style":0.3}}' "$text" "$model" > "$TMP/body.json"
  local code
  code=$(curl -sS -o "$name.mp3" -w '%{http_code}' -X POST "https://api.elevenlabs.io/v1/text-to-speech/$voice?output_format=mp3_44100_128" -H 'Content-Type: application/json' --data-binary "@$TMP/body.json")
  if [ "$code" != "200" ]; then rm -f "$name.mp3"; echo "$name: HTTP $code"; else echo "$name: ok"; fi
}
M=eleven_v3
# Рассказчик: Олег (MWyJiWDobXN8FX3CJTdE) — библиотечный голос, нужен платный тариф; вместо него два запасных
speak narrator_george_1 JBFqnCBsd6RMkjVDRZzb $M "Минус девятнадцать. Я не чувствую пальцев. И меня везут неизвестно куда."
speak narrator_brian_1 nPczCjzI2devNBz1zQrb $M "Минус девятнадцать. Я не чувствую пальцев. И меня везут неизвестно куда."
# Водитель: две реплики из Части 2
speak driver_roger_1 CwhRBWXzGAHq8TQ4Fs17 $M "Да, пустой."
speak driver_roger_2 CwhRBWXzGAHq8TQ4Fs17 $M "Как в прошлый раз."
speak driver_callum_1 N2lVS1w4EtoT3dr4eOWO $M "Да, пустой."
speak driver_callum_2 N2lVS1w4EtoT3dr4eOWO $M "Как в прошлый раз."
speak driver_charlie_1 IKne3meq5aSn9XLyUdCD $M "Да, пустой."
speak driver_charlie_2 IKne3meq5aSn9XLyUdCD $M "Как в прошлый раз."
# Костя: Часть 5
speak kostya_liam_1 TX3LPaxmHKxFdv7VOQHJ $M "Костя... Вчерашняя смена."
speak kostya_will_1 bIHbv24MWmeRgasZH58o $M "Костя... Вчерашняя смена."
speak kostya_harry_1 SOYHLrjzK2X1ezoPC6cr $M "Костя... Вчерашняя смена."
rm -rf "$TMP"
