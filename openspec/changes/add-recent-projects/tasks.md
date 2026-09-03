## 1. Main process persistence

- [ ] 1.1 Add a `recentProjects: string[]` key to the `electron-store` schema (separate from `AppSettings`) (RU: добавить ключ `recentProjects: string[]` в схему `electron-store` (отдельно от `AppSettings`))
- [ ] 1.2 Add helper functions to add/move-to-front a path (capped at 10), remove a path, and clear the list (RU: добавить вспомогательные функции для добавления/перемещения пути в начало (с ограничением в 10), удаления пути и очистки списка)
- [ ] 1.3 Call the "add/move-to-front" helper from the existing `project.open` and `project.save` (first-save) success paths in `electron/main/ipc.ts` / `electron/main/project.ts` (RU: вызывать функцию «добавить/переместить в начало» из существующих успешных сценариев `project.open` и `project.save` (первое сохранение) в `electron/main/ipc.ts` / `electron/main/project.ts`)

## 2. IPC & preload

- [ ] 2.1 Add `project.getRecent()` IPC handler returning the persisted path list (RU: добавить обработчик IPC `project.getRecent()`, возвращающий сохранённый список путей)
- [ ] 2.2 Add `project.removeFromRecent(path)` and `project.clearRecent()` IPC handlers (RU: добавить обработчики IPC `project.removeFromRecent(path)` и `project.clearRecent()`)
- [ ] 2.3 Expose all three via `electron/preload/preload.ts` and update `AudioPieAPI` types (RU: пробросить все три метода через `electron/preload/preload.ts` и обновить типы `AudioPieAPI`)

## 3. Renderer UI

- [ ] 3.1 In `src/components/ProjectManager.tsx`, fetch recent projects on mount and render a "Recent Projects" section when non-empty (RU: в `src/components/ProjectManager.tsx` запрашивать недавние проекты при монтировании и отрисовывать раздел «Недавние проекты», когда он непуст)
- [ ] 3.2 For each entry, resolve and display a title (read `metadata.title` from the file, fallback to file name) and full path (RU: для каждой записи разрешать и отображать название (читать `metadata.title` из файла, иначе имя файла) и полный путь)
- [ ] 3.3 Wire click-to-open: attempt to open the file; on failure, show a "file not found" message and call `project.removeFromRecent` (RU: подключить открытие по клику: попытаться открыть файл; при неудаче показать сообщение «файл не найден» и вызвать `project.removeFromRecent`)
- [ ] 3.4 Add a "Clear recent projects" action with a confirmation step (RU: добавить действие «Очистить недавние проекты» с шагом подтверждения)
- [ ] 3.5 Create `src/styles/components/recent-projects.scss` following BEM conventions and import it in `globals.scss` (RU: создать `src/styles/components/recent-projects.scss` по методологии BEM и подключить его в `globals.scss`)

## 4. Localization

- [ ] 4.1 Add new i18n keys ("Recent Projects", "Clear recent projects", "File not found", confirmation copy) to `src/i18n/locales/en.json` (RU: добавить новые ключи i18n («Недавние проекты», «Очистить недавние проекты», «Файл не найден», текст подтверждения) в `src/i18n/locales/en.json`)
- [ ] 4.2 Add matching Russian translations to `src/i18n/locales/ru.json` (RU: добавить соответствующие переводы на русский в `src/i18n/locales/ru.json`)

## 5. Tests

- [ ] 5.1 Unit test: adding paths beyond the cap drops the oldest entry (RU: юнит-тест: добавление путей сверх лимита удаляет самую старую запись)
- [ ] 5.2 Unit test: opening/saving moves an existing entry to the front rather than duplicating it (RU: юнит-тест: открытие/сохранение перемещает существующую запись в начало, а не дублирует её)
- [ ] 5.3 Unit test: opening a missing recent file removes it from the persisted list (RU: юнит-тест: открытие отсутствующего недавнего файла удаляет его из сохранённого списка)
