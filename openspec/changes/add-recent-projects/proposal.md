## Why

Every session starts from the same two choices — "Open Project" (native file dialog) or "Create New" — with no memory of what the user worked on last. For users iterating on the same audiobook across multiple sessions, this means re-navigating the file system every time. Addresses GitHub issue [#37](https://github.com/ikloster03/audiopie/issues/37).

**RU:** Каждая сессия начинается с одного и того же выбора — «Открыть проект» (нативный диалог) или «Создать новый» — без памяти о том, над чем пользователь работал в прошлый раз. Для пользователей, которые итеративно работают над одной аудиокнигой в нескольких сессиях, это означает необходимость каждый раз заново искать файл в файловой системе. Закрывает issue #37.

## What Changes

- Persist a most-recently-used (MRU) list of opened/saved project file paths (capped at a fixed size, e.g. 10 entries, most recent first).
  - **RU:** Сохранять список недавно использованных (MRU) путей к открытым/сохранённым файлам проектов (ограниченный фиксированным размером, например 10 записей, от самого недавнего).
- The Project Manager screen displays this list (title + path, derived by peeking at each file's `metadata.title` where resolvable) below/alongside the existing Open/New cards, letting the user reopen a project with one click.
  - **RU:** Экран менеджера проектов отображает этот список (название + путь, полученные из `metadata.title` каждого файла, где это возможно) под/рядом с существующими карточками «Открыть»/«Создать», позволяя переоткрыть проект одним кликом.
- Recording happens on both successful "Open" and successful "Save" (a freshly created project becomes "recent" as soon as it's first saved).
  - **RU:** Запись происходит как при успешном «Открытии», так и при успешном «Сохранении» (только что созданный проект становится «недавним», как только он впервые сохранён).
- Entries whose underlying file no longer exists on disk are shown as unavailable and are pruned when the user attempts to open them (not proactively swept on every app start, to avoid unnecessary disk I/O).
  - **RU:** Записи, файл которых больше не существует на диске, показываются как недоступные и удаляются при попытке пользователя их открыть (не проверяются проактивно при каждом запуске приложения, чтобы избежать лишнего обращения к диску).
- The recent list is cleared of an entry when its file is deleted from disk and fails to open, and there SHALL be an explicit "clear recent projects" action.
  - **RU:** Запись удаляется из списка недавних, когда её файл удалён с диска и не открывается, а также ДОЛЖНО быть явное действие «очистить недавние проекты».

## Capabilities

### New Capabilities
- `recent-projects`: Tracking, persisting, displaying, and pruning the most-recently-used project list.
  - **RU:** Отслеживание, сохранение, отображение и очистка списка недавно использованных проектов.

## Impact

- `electron/main/settings.ts` (or a new small store, e.g. `electron/main/recentProjects.ts`) using the existing `electron-store` dependency to persist the MRU list, separate from `AppSettings` since it's operational state rather than a user preference.
- `electron/main/ipc.ts` / `electron/preload/preload.ts`: new `project.getRecent()`, `project.removeFromRecent(path)`, `project.clearRecent()` IPC surface; existing `project.open()`/`project.save()` handlers updated to push onto the MRU list on success.
- `src/components/ProjectManager.tsx`: render the recent projects list and wire click-to-open / remove actions.
- `src/i18n/locales/en.json` / `ru.json`: new strings ("Recent Projects", "Clear", "File not found", etc.).

**RU:** `electron/main/settings.ts` (или новое небольшое хранилище, например `electron/main/recentProjects.ts`) с использованием уже имеющейся зависимости `electron-store` для сохранения MRU-списка, отдельно от `AppSettings`, поскольку это операционное состояние, а не пользовательская настройка. `electron/main/ipc.ts` / `electron/preload/preload.ts` — новые методы IPC `project.getRecent()`, `project.removeFromRecent(path)`, `project.clearRecent()`; существующие обработчики `project.open()`/`project.save()` обновляются, чтобы при успехе добавлять путь в MRU-список. `src/components/ProjectManager.tsx` — отрисовка списка недавних проектов и подключение действий открытия/удаления по клику. `src/i18n/locales/en.json` / `ru.json` — новые строки («Недавние проекты», «Очистить», «Файл не найден» и т.д.).
