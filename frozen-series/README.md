# «−20. ЗАПЕРТ В ФУРЕ» — сборка серии (5 частей по 64 с)

Вертикальные серии 1080×1920, 30 fps, Remotion. Все пять частей собираются одним и тем же пайплайном.

## Порядок сборки

Запускать из корня проекта. Ключ ElevenLabs подставляет сетевой прокси, в файлы он не пишется.

1. Озвучка (строка за строкой, eleven_v3): `python3 frozen-series/voice.py 1 2 3 4 5`. Уже готовые строки (takes/) пропускаются.
2. Таймлайн: `python3 frozen-series/build_timeline.py 1 2 3 4 5`. Речь ускоряется на 1.12 (тон сохраняется), паузы подгоняются под 64 с, хвост каждой реплики обрезается после последней буквы.
3. Кадры (PNG 1080×1920): `python3 frozen-series/art/plates1.py` … `plates5.py`, затем `cp frozen-series/plates/p*_*.png public/frozen/`.
4. Сцены, субтитры и HUD: `python3 frozen-series/make_data.py 1 2 3 4 5` (правится таблица `SCENES`, `KEYS`, `HUD`).
5. Звук: `python3 frozen-series/mix.py 1 2 3 4 5` (голос + гул, ветер и удары по сценам, нормализация −16 LUFS, пик −1.5 dBTP).
6. Обложки: `python3 frozen-series/art/cover.py` (функция `cover(part, path)`).
7. Контрольный лист до финального рендера:
   `node scripts/render-frozen-stills.mjs FrozenPart<n> frozen-series/stills<n> 2`, затем
   `python3 frozen-series/contact_sheet.py frozen-series/stills<n> out/part<n>_sheet.jpg`.
8. Финальный рендер: `node scripts/render-frozen.mjs FrozenPart<n> "$(pwd)/out/part<n>.mp4"`.

Композиции `FrozenPart1` … `FrozenPart5` зарегистрированы в `src/Root.tsx`. Данные берутся из `src/frozen/data/part<n>_full.json`.

## Ограничения (как есть)

- Олег (`MWyJiWDobXN8FX3CJTdE`) — библиотечный голос: на бесплатном тарифе API отдаёт HTTP 402. Пока вместо него стоит George (`config.json`, поле `narrator`). Когда будет платный тариф, поменять `voice_id` на `target_voice_id` и перегенерировать строки рассказчика.
- Голоса водителя (Charlie) и Кости (Will) выбраны по умолчанию, их можно поменять в `config.json`.
- Кадры рисуются кодом (numpy + Pillow), это плоская процедурная графика, а не полуреалистичная иллюстрация. Персонажи — силуэты: лица в кадрах не рисуются.
- Звук синтезируется (гул компрессора, ветер, глухие удары), библиотек звуков в проекте нет.

## Замена кадров своими

Кадры — обычные PNG 1080×1920 в `public/frozen/` с именами из `make_data.py`. Если нарисовать кадры в другом инструменте, достаточно положить файлы с теми же именами и пересобрать рендер: остальной пайплайн не меняется.

## Файлы

- `parts.py` — тексты пяти частей (строка — отдельная фраза; `RECAP:` — текст на экране, не озвучивается; `[ВОДИТЕЛЬ]` и `[КОСТЯ]` — второстепенные голоса).
- `voice.py`, `config.json` — озвучка и голоса.
- `build_timeline.py` — таймлайн, речь, данные строк с таймкодами слов.
- `make_data.py` — сцены, карточки субтитров (красные ключевые слова), HUD.
- `mix.py` — звук части.
- `contact_sheet.py` — контрольный лист кадров.
- `art/` — рисование кадров (`paint.py`, `objects.py`, `objects2.py`, `plates1.py`…`plates5.py`, `cover.py`).
