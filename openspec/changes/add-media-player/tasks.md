## 1. Player component

- [ ] 1.1 Create `src/components/MediaPlayer.tsx` wrapping a single shared `<audio>` element with play/pause, seek bar, and elapsed/total time display (RU: создать `src/components/MediaPlayer.tsx`, оборачивающий единый общий элемент `<audio>` с play/pause, полосой перемотки и отображением прошедшего/общего времени)
- [ ] 1.2 Add player UI state (current source path, playing/paused, current time, duration) to `AppContext` or a small local context/hook (RU: добавить состояние UI плеера (текущий путь источника, играет/на паузе, текущее время, длительность) в `AppContext` или небольшой локальный контекст/хук)
- [ ] 1.3 Verify/adjust CSP (if any) in `electron/main/main.ts` / `index.html` to allow `file:` media sources (RU: проверить/скорректировать CSP (если есть) в `electron/main/main.ts` / `index.html`, чтобы разрешить `file:`-источники медиа)

## 2. Track playback

- [ ] 2.1 Add a "play" affordance per track/chapter row (in `ChapterList.tsx` or its `redesign-project-workspace` successor) that sets the player's source to that track's path (RU: добавить элемент «воспроизвести» для каждой строки трека/главы (в `ChapterList.tsx` или его преемнике из `redesign-project-workspace`), устанавливающий источник плеера на путь этого трека)
- [ ] 2.2 Handle switching tracks while one is playing (stop current, start new from 0) (RU: обработать переключение треков во время воспроизведения (остановить текущий, начать новый с нуля))

## 3. Built M4B playback + chapter seek

- [ ] 3.1 Track the last successful build's output path in `AppContext` (populated from the existing build-completion event) (RU: отслеживать путь результата последней успешной сборки в `AppContext` (заполняется из существующего события завершения сборки))
- [ ] 3.2 Add a "Play result" action (enabled only when an output path is known and the file still exists) that loads the M4B into the player (RU: добавить действие «Прослушать результат» (активно только если путь результата известен и файл ещё существует), загружающее M4B в плеер)
- [ ] 3.3 Add a chapter selector in the player (reading the project's current chapter list) that seeks `audio.currentTime` to the selected chapter's `startMs` (RU: добавить селектор глав в плеере (читающий текущий список глав проекта), перематывающий `audio.currentTime` к `startMs` выбранной главы)

## 4. Lifecycle

- [ ] 4.1 Reset player state when the project is closed/reopened (new project, open different project) (RU: сбрасывать состояние плеера при закрытии/переоткрытии проекта (новый проект, открытие другого проекта))

## 5. Localization

- [ ] 5.1 Add new i18n keys (play/pause labels, "Play result", chapter selector) to `src/i18n/locales/en.json` (RU: добавить новые ключи i18n (подписи play/pause, «Прослушать результат», селектор глав) в `src/i18n/locales/en.json`)
- [ ] 5.2 Add matching Russian translations to `src/i18n/locales/ru.json` (RU: добавить соответствующие переводы на русский в `src/i18n/locales/ru.json`)

## 6. Styling

- [ ] 6.1 Create `src/styles/components/media-player.scss` following BEM conventions and import it in `globals.scss` (RU: создать `src/styles/components/media-player.scss` по методологии BEM и подключить его в `globals.scss`)

## 7. Tests

- [ ] 7.1 Manual test: play/pause/seek an MP3 track (RU: ручной тест: play/pause/перемотка MP3-трека)
- [ ] 7.2 Manual test: build a project, play the result, seek via chapter selector (RU: ручной тест: собрать проект, прослушать результат, перемотать через селектор глав)
- [ ] 7.3 Manual test: "Play result" is hidden/disabled before any successful build in the session (RU: ручной тест: «Прослушать результат» скрыто/неактивно до первой успешной сборки в сессии)
