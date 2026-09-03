## 1. IPC & backend

- [ ] 1.1 Add `chapters/reorder` IPC handler in `electron/main/ipc.ts` that accepts a new chapter order, reorders the underlying `tracks` array to match, and persists both to the in-memory project (RU: добавить обработчик IPC `chapters/reorder` в `electron/main/ipc.ts`, который принимает новый порядок глав, переупорядочивает соответствующий массив `tracks` и сохраняет оба списка в проекте в памяти)
- [ ] 1.2 Add `chapters/renameByTemplate` IPC handler that accepts a template string, substitutes `{n}` with each chapter's 1-based index, and persists the updated chapter list (RU: добавить обработчик IPC `chapters/renameByTemplate`, принимающий строку-шаблон, подставляющий `{n}` порядковым номером каждой главы (с 1) и сохраняющий обновлённый список глав)
- [ ] 1.3 Expose both new handlers via `electron/preload/preload.ts` (`window.audioPie.chapters.reorder`, `window.audioPie.chapters.renameByTemplate`) (RU: пробросить оба новых обработчика через `electron/preload/preload.ts`)
- [ ] 1.4 Update `electron/main/types.ts` and preload types with the new API shapes (RU: обновить `electron/main/types.ts` и типы preload новыми формами API)

## 2. Chapters view enhancements

- [ ] 2.1 Add `sortablejs`-based drag-and-drop to `src/components/ChapterList.tsx`, mirroring the pattern used in `src/components/TrackList.tsx` (RU: добавить drag-and-drop на основе `sortablejs` в `src/components/ChapterList.tsx`, повторяя паттерн из `src/components/TrackList.tsx`)
- [ ] 2.2 On drag end, call `chapters/reorder`, update local chapter and track state in `AppContext` (RU: по завершении перетаскивания вызывать `chapters/reorder`, обновлять локальное состояние глав и треков в `AppContext`)
- [ ] 2.3 Add editable start/end time inputs per chapter row, with `start < end` validation before persisting via `chapters/update` (RU: добавить редактируемые поля времени начала/конца для каждой строки главы с проверкой `start < end` перед сохранением через `chapters/update`)
- [ ] 2.4 Add a "Rename by template" toolbar action + small dialog/input for the template string, wired to `chapters/renameByTemplate` (RU: добавить действие тулбара «Переименовать по шаблону» и небольшой диалог/поле ввода шаблона, подключённые к `chapters/renameByTemplate`)
- [ ] 2.5 Add an "Add/remove tracks" affordance reachable from the Chapters view (per design.md open question resolution) so users can still fix source files without a dedicated tab (RU: добавить элемент управления «Добавить/удалить треки», доступный из панели глав (по итогам решения открытого вопроса в design.md), чтобы пользователи могли исправлять исходные файлы без отдельной вкладки)

## 3. Sidebar navigation

- [ ] 3.1 Create `src/components/WorkspaceSidebar.tsx` with a Discord-style vertical list of sections (Chapters, Metadata) (RU: создать `src/components/WorkspaceSidebar.tsx` с вертикальным списком разделов в стиле Discord (Главы, Метаданные))
- [ ] 3.2 Add `activeSection` state (in `AppContext` or local to `App.tsx`) and wire sidebar item clicks to switch it (RU: добавить состояние `activeSection` (в `AppContext` или локально в `App.tsx`) и подключить клики по пунктам боковой панели к его переключению)
- [ ] 3.3 Update `src/App.tsx` to remove the horizontal tab bar and render the sidebar + active section's content instead (RU: обновить `src/App.tsx`, убрав горизонтальную панель вкладок и отрисовав вместо неё боковую панель + содержимое активного раздела)
- [ ] 3.4 Create `src/styles/components/workspace-sidebar.scss` following BEM conventions and import it in `globals.scss` (RU: создать `src/styles/components/workspace-sidebar.scss` по методологии BEM и подключить его в `globals.scss`)

## 4. Cleanup

- [ ] 4.1 Remove or repurpose `src/components/TrackList.tsx` and its dedicated tab wiring from `src/App.tsx` (RU: удалить или переиспользовать `src/components/TrackList.tsx` и его отдельную привязку к вкладке в `src/App.tsx`)
- [ ] 4.2 Remove now-unused track-list-only styles/translations, or repurpose them for the new "manage source files" affordance (RU: удалить ставшие ненужными стили/переводы, относящиеся только к списку треков, либо переиспользовать их для нового элемента «управление исходными файлами»)

## 5. Localization

- [ ] 5.1 Add new i18n keys (sidebar labels, rename-by-template dialog, time-range inputs, add/remove-tracks affordance) to `src/i18n/locales/en.json` (RU: добавить новые ключи i18n (подписи боковой панели, диалог переименования по шаблону, поля временного диапазона, элемент добавления/удаления треков) в `src/i18n/locales/en.json`)
- [ ] 5.2 Add matching Russian translations to `src/i18n/locales/ru.json` (RU: добавить соответствующие переводы на русский в `src/i18n/locales/ru.json`)

## 6. Tests

- [ ] 6.1 Add/update unit tests for chapter reordering, time-range validation, and rename-by-template logic (RU: добавить/обновить юнит-тесты для переупорядочивания глав, валидации временного диапазона и логики переименования по шаблону)
- [ ] 6.2 Manually verify build pipeline still produces correct chapter markers after reordering via the new UI (RU: вручную проверить, что конвейер сборки по-прежнему создаёт корректные метки глав после переупорядочивания через новый UI)
