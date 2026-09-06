## 1. IPC & backend

- [x] 1.1 Add `chapters/reorder` IPC handler in `electron/main/ipc.ts` that accepts a new chapter order, reorders the underlying `tracks` array to match, and persists both to the in-memory project (RU: добавить обработчик IPC `chapters/reorder`)
- [x] 1.2 Add `chapters/renameByTemplate` IPC handler that accepts a template string, substitutes `{n}` with each chapter's 1-based index, and persists the updated chapter list (RU: добавить обработчик IPC `chapters/renameByTemplate`)
- [x] 1.3 Expose both new handlers via `electron/preload/preload.ts` (`window.audioPie.chapters.reorder`, `window.audioPie.chapters.renameByTemplate`) (RU: пробросить оба обработчика через preload)
- [x] 1.4 Update `electron/main/types.ts` and preload types with the new API shapes (RU: обновить типы API)

## 2. Chapters view enhancements

- [x] 2.1 Add `sortablejs`-based drag-and-drop to `src/components/ChapterList.tsx` (RU: drag-and-drop глав)
- [x] 2.2 On drag end, call `chapters/reorder`, update local chapter and track state in `AppContext` (RU: по окончании DnD вызывать `chapters/reorder`)
- [x] 2.3 Display start/end and track duration per chapter row as read-only; only the title is editable (RU: таймкоды и длительность трека только для чтения; редактируется название)
- [x] 2.4 Add a "Rename by template" toolbar action + dialog, wired to `chapters/renameByTemplate` (RU: переименование по шаблону)
- [x] 2.5 Add add/remove source-file controls in the Chapters view (toolbar icon + per-row remove; drop MP3 on workspace) (RU: добавление/удаление исходников из панели глав)
- [x] 2.6 Show chapter count and total audiobook duration (hours + minutes) in the top-left of the Chapters view (RU: счётчик глав и суммарная длительность слева вверху)

## 3. Sidebar navigation

- [x] 3.1 Create `src/components/WorkspaceSidebar.tsx` with sections Chapters, Metadata, Settings and brand at the top (RU: сайдбар с разделами и брендом)
- [x] 3.2 Add `activeSection` state local to `App.tsx`; default to Chapters on project open (RU: `activeSection` в `App.tsx`)
- [x] 3.3 Remove the horizontal tab bar and top header; render sidebar + active section (RU: убрать вкладки и шапку)
- [x] 3.4 Create `src/styles/components/workspace-sidebar.scss` (BEM) and import it in `globals.scss` (RU: стили сайдбара)
- [x] 3.5 Support expanded vs minimal sidebar modes (Discord-like icons + tooltips in minimal); persist as `sidebarMode` (RU: два режима сайдбара)
- [x] 3.6 Render Settings as a workspace page (`SettingsPage`) instead of a modal (RU: настройки страницей)

## 4. Cleanup

- [x] 4.1 Remove `src/components/TrackList.tsx` and its tab wiring (RU: удалить TrackList)
- [x] 4.2 Remove unused track-list-only styles/translations (RU: убрать неиспользуемые стили/переводы списка треков)

## 5. Localization

- [x] 5.1 Add i18n keys (sidebar, FABs, rename-by-template, duration summary, sidebar modes) to `src/i18n/locales/en.json` (RU: ключи en)
- [x] 5.2 Add matching Russian translations to `src/i18n/locales/ru.json` (RU: ключи ru)

## 6. Tests

- [x] 6.1 Unit tests for chapter reordering, time-range helpers, rename-by-template, and hours/minutes duration formatting (RU: юнит-тесты)
- [x] 6.2 Verify reorder keeps chapter markers aligned with concatenated track durations (data-contract tests; FFmpeg pipeline unchanged) (RU: проверка меток глав после reorder)

## 7. Workspace chrome (post-apply UX)

- [x] 7.1 Icon-only Save/Build/Add-tracks buttons with hover tooltips (RU: кнопки-иконки с тултипами)
- [x] 7.2 Medium Save FAB stacked above large Build FAB on Chapters and Metadata (RU: float Сохранить над Собрать)
- [x] 7.3 Hide FABs on scroll down and show on scroll up with animation (RU: скрытие float-кнопок при скролле)

## 8. Chapters identity header (post-apply UX)

- [x] 8.1 Render cover thumbnail + metadata title above chapter count and total duration in `ChapterList` (including empty states) (RU: миниатюра обложки и название над сводкой глав)
- [x] 8.2 Load cover via `metadata.getCoverDataUrl`; cover placeholder when missing/failed; muted untitled placeholder when title is empty or default untitled (RU: загрузка обложки и заглушки)
- [x] 8.3 BEM styles for the identity header in `chapter-list.scss` (~56×56 thumbnail, reserved slot while loading) (RU: стили шапки идентичности)
- [x] 8.4 i18n for cover alt / identity header as needed; reuse `common.untitledAudiobook` for the title placeholder (RU: i18n, заглушка названия из `common.untitledAudiobook`)
