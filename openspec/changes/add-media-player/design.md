## Context

AudioPie's renderer runs in Electron's Chromium engine, which has native support for MP3 and M4B/AAC playback via the HTML5 `<audio>` element — no FFmpeg or native module is needed for playback itself (FFmpeg remains encode-only, used by `electron/main/ffmpeg.ts`). Track and build-output paths are already absolute local file system paths available in the renderer (`TrackInfo.path`, and the build output path known from `build:start`'s options / completion event).

**RU:** Рендерер AudioPie работает на движке Chromium в Electron, который нативно поддерживает воспроизведение MP3 и M4B/AAC через HTML5-элемент `<audio>` — для самого воспроизведения не нужен ни FFmpeg, ни нативный модуль (FFmpeg остаётся только для кодирования, используется в `electron/main/ffmpeg.ts`). Пути треков и результата сборки уже являются абсолютными локальными путями, доступными в рендерере (`TrackInfo.path`, а путь результата сборки известен из опций `build:start` / события завершения).

## Goals / Non-Goals

**Goals:**
- Ship a minimal, reliable in-app player: play/pause, seek, elapsed/total time, and chapter-jump for the built M4B.
- Avoid new native dependencies or IPC surface — playback is a pure renderer-side concern.

**RU (цели):** Реализовать минимальный, надёжный встроенный плеер: play/pause, перемотка, прошедшее/общее время и переход по главам для собранного M4B. Избежать новых нативных зависимостей или IPC-слоя — воспроизведение является чисто задачей рендерера.

**Non-Goals:**
- Waveform visualization, playback speed control, or volume persistence across sessions (nice-to-haves, not required by issue #30).
- Playing back a project's tracks as one continuous stream before build (i.e. simulating the final concatenation) — v1 plays one track at a time; continuous multi-track "preview" playback is a possible future enhancement.

**RU (не цели):** Визуализация волновой формы, управление скоростью воспроизведения или сохранение громкости между сессиями (приятные дополнения, не требуемые issue #30). Воспроизведение треков проекта одним непрерывным потоком до сборки (то есть симуляция итогового объединения) — v1 воспроизводит по одному треку за раз; непрерывное многотрековое «превью» — возможное будущее улучшение.

## Decisions

- **Use `<audio src="file://...">` directly**, no custom native playback module. This requires confirming the renderer's Content-Security-Policy (if any is set in `index.html`/main window config) allows `file:` media sources; if CSP blocks it, the fix is a scoped `media-src file:` addition rather than IPC-streamed bytes.
  - *Alternative considered*: stream audio bytes through IPC/a custom protocol handler for stricter sandboxing. Rejected as unnecessary complexity — the renderer already has `nodeIntegration`-free access to local paths for e.g. cover image previews (`metadata.getCoverDataUrl`), and file playback via `file://` is standard practice for local-first Electron apps.
  - **RU:** Использовать `<audio src="file://...">` напрямую, без кастомного нативного модуля воспроизведения. Это требует проверки, что Content-Security-Policy рендерера (если задана в `index.html`/конфигурации главного окна) разрешает `file:`-источники медиа; если CSP блокирует это, решением будет точечное добавление `media-src file:`, а не потоковая передача байтов через IPC. *Рассмотренная альтернатива*: передавать байты аудио через IPC/кастомный обработчик протокола для более строгой изоляции. Отклонено как излишняя сложность — рендерер уже имеет доступ к локальным путям без `nodeIntegration` (например, для превью обложек через `metadata.getCoverDataUrl`), а воспроизведение через `file://` — стандартная практика для локально-ориентированных Electron-приложений.
- **Single shared player instance.** One `<audio>` element (via a `MediaPlayer` component mounted once, e.g. near the top of the workspace layout) is reused for both "play a track" and "play the built M4B", switching `src` as needed, rather than mounting a new element per track row.
  - **RU:** Единый общий экземпляр плеера. Один элемент `<audio>` (через компонент `MediaPlayer`, монтируемый один раз, например, в верхней части рабочего пространства) переиспользуется как для «воспроизвести трек», так и для «воспроизвести собранный M4B», переключая `src` по необходимости, вместо монтирования отдельного элемента на каждую строку трека.
- **Chapter jump is a pure seek** (`audio.currentTime = chapter.startMs / 1000`) against the already-loaded M4B — no re-fetching or re-decoding beyond what the browser's media pipeline does automatically for a seek.
  - **RU:** Переход по главе — это чистая перемотка (`audio.currentTime = chapter.startMs / 1000`) для уже загруженного M4B — без повторной загрузки или декодирования сверх того, что браузерный медиа-конвейер автоматически делает при перемотке.

## Risks / Trade-offs

- [Risk] If Electron's window is configured with a strict CSP that blocks `file:` media sources, playback could silently fail → Mitigation: verify during implementation by checking `electron/main/main.ts`/`index.html` for any `Content-Security-Policy` meta tag or `session.webRequest` header injection, and adjust if needed.
  - **RU:** [Риск] Если окно Electron настроено со строгим CSP, блокирующим `file:`-источники медиа, воспроизведение может тихо не сработать → Смягчение: проверить при реализации `electron/main/main.ts`/`index.html` на наличие мета-тега `Content-Security-Policy` или внедрения заголовков через `session.webRequest`, и скорректировать при необходимости.
- [Risk] Large M4B files could take a moment to become seekable right after a build (file handle just closed by FFmpeg) → Mitigation: reuse the existing "verify output file exists and is non-empty" check from the build-completion flow before enabling "play result".
  - **RU:** [Риск] Большие M4B-файлы могут не сразу стать доступными для перемотки сразу после сборки (файловый дескриптор только что закрыт FFmpeg) → Смягчение: переиспользовать существующую проверку «выходной файл существует и не пуст» из сценария завершения сборки перед включением «прослушать результат».
- [Trade-off] No continuous multi-track preview in v1 means users still need to build to hear the full concatenated flow with transitions — acceptable since accurate preview really requires the same encode step; documented as a known limitation.
  - **RU:** [Компромисс] Отсутствие непрерывного многотрекового превью в v1 означает, что пользователям всё ещё нужно собирать проект, чтобы услышать полный объединённый поток с переходами — приемлемо, поскольку точное превью реально требует того же этапа кодирования; задокументировано как известное ограничение.
