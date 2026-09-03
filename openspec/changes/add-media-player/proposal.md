## Why

Users currently have no way to listen to their imported MP3 tracks or a built M4B file from inside AudioPie — they must open files in an external player to verify content, ordering, or chapter boundaries. An in-app player closes this feedback loop directly in the editing workflow. Addresses GitHub issue [#30](https://github.com/ikloster03/audiopie/issues/30).

**RU:** Сейчас у пользователей нет способа прослушать импортированные MP3-треки или собранный M4B-файл прямо в AudioPie — приходится открывать файлы во внешнем плеере, чтобы проверить содержимое, порядок или границы глав. Встроенный плеер замыкает эту обратную связь прямо в процессе редактирования. Закрывает issue #30.

## What Changes

- Add an in-app audio player capable of playing a single MP3 track selected from the chapters/tracks view.
  - **RU:** Добавить встроенный аудиоплеер, способный воспроизводить один MP3-трек, выбранный из панели глав/треков.
- Add the ability to play the most recently built M4B output file, with the ability to jump to a specific chapter's start time (using the project's chapter list as a seek menu).
  - **RU:** Добавить возможность воспроизведения последнего собранного M4B-файла с переходом к началу конкретной главы (используя список глав проекта как меню перемотки).
- Player UI: play/pause, seek bar with current time / total duration, and (for M4B playback) a chapter selector.
  - **RU:** UI плеера: play/pause, полоса перемотки с текущим временем/общей длительностью и (для воспроизведения M4B) селектор глав.
- Player state (currently playing file, position) is transient UI state, not persisted to the project file.
  - **RU:** Состояние плеера (текущий воспроизводимый файл, позиция) — временное состояние UI, не сохраняемое в файл проекта.

## Capabilities

### New Capabilities
- `media-playback`: In-app playback of a selected MP3 track or the last-built M4B file, including chapter-based seeking for M4B playback.
  - **RU:** Встроенное воспроизведение выбранного MP3-трека или последнего собранного M4B-файла, включая перемотку по главам при воспроизведении M4B.

## Impact

- New component (e.g. `src/components/MediaPlayer.tsx`) using the standard HTML5 `<audio>` element (Chromium's renderer supports MP3/M4B/AAC natively; no new native dependency needed).
- `src/components/ChapterList.tsx` (or its successor from `redesign-project-workspace`): add a "play" affordance per chapter/track row that loads that track (or seeks to that chapter's start time within the M4B) into the player.
- `src/context/AppContext.tsx`: track the last successfully built M4B output path (already available via build completion) so the player can offer "play the result" after a build finishes.
- `src/i18n/locales/en.json` / `ru.json`: new strings for player controls.
- No new Electron main-process/IPC surface is expected — local file playback can use `file://` URLs directly from the renderer since track/output paths are already absolute local paths (subject to a design-time check that this doesn't violate Electron's `contextIsolation`/CSP setup).

**RU:** Новый компонент (например, `src/components/MediaPlayer.tsx`) на основе стандартного HTML5-элемента `<audio>` (рендерер на Chromium нативно поддерживает MP3/M4B/AAC; новая нативная зависимость не нужна). `src/components/ChapterList.tsx` (или его преемник из `redesign-project-workspace`) — добавить элемент «воспроизвести» для каждой строки главы/трека, загружающий этот трек в плеер (или перематывающий к началу главы внутри M4B). `src/context/AppContext.tsx` — отслеживать путь последнего успешно собранного M4B-файла (уже доступен через событие завершения сборки), чтобы плеер мог предложить «прослушать результат» после сборки. `src/i18n/locales/en.json` / `ru.json` — новые строки для элементов управления плеером. Новый IPC/main-process слой не ожидается — воспроизведение локальных файлов может использовать `file://` URL напрямую из рендерера, поскольку пути треков/результата уже являются абсолютными локальными путями (при условии проверки на этапе проектирования, что это не нарушает настройки `contextIsolation`/CSP Electron).
