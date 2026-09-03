## 1. Types & data model

- [ ] 1.1 Add a `BuildHistoryEntry` type to `src/types.ts` / `electron/main/types.ts`: `{ timestamp: number; durationMs: number; outcome: 'success' | 'error' | 'cancelled'; outputSizeBytes?: number; bitrateKbps: number; threads: number }` (RU: добавить тип `BuildHistoryEntry` с указанными полями в `src/types.ts` / `electron/main/types.ts`)
- [ ] 1.2 Add optional `buildHistory: BuildHistoryEntry[]` to the audiobook project shape, defaulting to `[]` when absent on open (RU: добавить опциональное поле `buildHistory: BuildHistoryEntry[]` в структуру проекта аудиокниги, по умолчанию `[]`, если отсутствует при открытии)

## 2. Main process

- [ ] 2.1 In `electron/main/ffmpeg.ts`, construct a `BuildHistoryEntry` on success, error, and cancellation paths (RU: в `electron/main/ffmpeg.ts` формировать `BuildHistoryEntry` в сценариях успеха, ошибки и отмены)
- [ ] 2.2 Append the entry to the in-memory project's `buildHistory` (capped at 20, dropping oldest) in `electron/main/project.ts` (RU: добавлять запись в `buildHistory` проекта в памяти (с ограничением в 20, удаляя самые старые) в `electron/main/project.ts`)
- [ ] 2.3 Include the new entry in the `build:complete`/`build:error` IPC payload (or a new dedicated event) so the renderer can update immediately (RU: включить новую запись в полезную нагрузку IPC `build:complete`/`build:error` (или новое отдельное событие), чтобы рендерер мог сразу обновиться)

## 3. Renderer

- [ ] 3.1 Add `buildHistory` state to `AppContext`, updated when a build-completion/error event includes a new history entry (RU: добавить состояние `buildHistory` в `AppContext`, обновляемое при получении новой записи истории из события завершения/ошибки сборки)
- [ ] 3.2 Create `src/components/BuildStatistics.tsx` rendering the history list (most recent first) with date/time, duration, outcome, size, and settings (RU: создать `src/components/BuildStatistics.tsx`, отображающий список истории (от самой недавней) с датой/временем, длительностью, результатом, размером и настройками)
- [ ] 3.3 Add an empty-state message for projects with no build history yet (RU: добавить сообщение о пустом состоянии для проектов, у которых ещё нет истории сборок)
- [ ] 3.4 Wire `BuildStatistics` into the workspace navigation (coordinate with `redesign-project-workspace`'s sidebar if available, otherwise add as its own entry point e.g. in the progress/build modal) (RU: подключить `BuildStatistics` в навигацию рабочего пространства (согласовать с боковой панелью из `redesign-project-workspace`, если доступна, иначе добавить как отдельную точку входа, например в модальном окне прогресса сборки))

## 4. Localization

- [ ] 4.1 Add new i18n keys (statistics view labels, outcome labels, empty state) to `src/i18n/locales/en.json` (RU: добавить новые ключи i18n (подписи экрана статистики, метки результатов, пустое состояние) в `src/i18n/locales/en.json`)
- [ ] 4.2 Add matching Russian translations to `src/i18n/locales/ru.json` (RU: добавить соответствующие переводы на русский в `src/i18n/locales/ru.json`)

## 5. Styling

- [ ] 5.1 Create `src/styles/components/build-statistics.scss` following BEM conventions and import it in `globals.scss` (RU: создать `src/styles/components/build-statistics.scss` по методологии BEM и подключить его в `globals.scss`)

## 6. Tests

- [ ] 6.1 Unit test: successful build appends a `success` entry with correct duration/size/settings (RU: юнит-тест: успешная сборка добавляет запись `success` с корректной длительностью/размером/настройками)
- [ ] 6.2 Unit test: cancelled/errored build appends an entry with the correct outcome and no `outputSizeBytes` (RU: юнит-тест: отменённая/ошибочная сборка добавляет запись с верным результатом и без `outputSizeBytes`)
- [ ] 6.3 Unit test: history is capped at 20 entries, dropping the oldest (RU: юнит-тест: история ограничена 20 записями, самые старые удаляются)
- [ ] 6.4 Unit test: opening a legacy project without `buildHistory` yields an empty array (RU: юнит-тест: открытие старого проекта без `buildHistory` даёт пустой массив)
