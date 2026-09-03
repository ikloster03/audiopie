## Context

`electron-store` is already a dependency, used by `electron/main/settings.ts` for `AppSettings`. There is no persisted list of previously opened files anywhere today; `ProjectManager.tsx` only offers "Open" (native dialog) and "New".

**RU:** `electron-store` уже является зависимостью проекта, используемой `electron/main/settings.ts` для `AppSettings`. Сейчас нигде нет сохранённого списка ранее открытых файлов; `ProjectManager.tsx` предлагает только «Открыть» (нативный диалог) и «Новый».

## Goals / Non-Goals

**Goals:**
- Let users reopen a recently used project in one click from the Project Manager screen.
- Keep the implementation small: a capped array of file paths, persisted via the existing `electron-store` mechanism.

**RU (цели):** Дать пользователям возможность переоткрыть недавно использованный проект одним кликом с экрана менеджера проектов. Сохранить реализацию компактной: ограниченный массив путей к файлам, сохраняемый через существующий механизм `electron-store`.

**Non-Goals:**
- Thumbnails/previews of covers in the recent list (title + path text is sufficient for v1).
- Cross-device sync of recent projects (local `electron-store` only, same as existing settings).
- Proactively validating every recent path's existence on every app launch (only validated lazily, on click, to avoid startup disk I/O).

**RU (не цели):** Миниатюры/превью обложек в списке недавних (текста названия + пути достаточно для v1). Синхронизация недавних проектов между устройствами (только локальный `electron-store`, как и у существующих настроек). Проактивная проверка существования каждого недавнего пути при каждом запуске приложения (проверка только лениво, по клику, чтобы избежать обращения к диску при старте).

## Decisions

- **Separate store key from `AppSettings`.** Recent projects is operational/session state, not a user preference, so it's stored under its own `electron-store` key (e.g. `recentProjects: string[]`) rather than being folded into the existing settings schema — keeps `settings/get`/`settings/set` semantics (get/set the whole settings object) unpolluted by a frequently-mutated list.
  - **RU:** Отдельный ключ хранилища от `AppSettings`. Недавние проекты — это операционное/сессионное состояние, а не пользовательская настройка, поэтому хранится под собственным ключом `electron-store` (например, `recentProjects: string[]`), а не встраивается в существующую схему настроек — это сохраняет семантику `settings/get`/`settings/set` (получение/установка всего объекта настроек) незасорённой часто изменяемым списком.
- **Store paths only, resolve titles lazily.** The recent list persists just file paths. When rendering, the Project Manager reads each file's `metadata.title` on demand (small JSON reads); this avoids keeping a second, potentially-stale copy of each project's title in the store.
  - *Alternative considered*: cache `{ path, title }` pairs at write time. Rejected because titles can change after the fact (renaming the book) and we'd need a cache invalidation strategy; reading a handful of small JSON files on the Project Manager screen is cheap.
  - **RU:** Хранить только пути, названия разрешать лениво. Список недавних хранит только пути к файлам. При отрисовке менеджер проектов читает `metadata.title` каждого файла по требованию (небольшие чтения JSON); это исключает хранение второй, потенциально устаревшей копии названия каждого проекта. *Рассмотренная альтернатива*: кешировать пары `{ path, title }` при записи. Отклонено, поскольку названия могут меняться постфактум (переименование книги), и потребовалась бы стратегия инвалидации кеша; чтение нескольких небольших JSON-файлов на экране менеджера проектов дёшево.
- **Lazy pruning.** Entries aren't validated until clicked, keeping app startup fast; a stale entry only gets removed when the user actually tries to open it and it fails.
  - **RU:** Ленивая очистка. Записи не проверяются до клика, что сохраняет быстрый запуск приложения; устаревшая запись удаляется только когда пользователь реально пытается её открыть и попытка проваливается.

## Risks / Trade-offs

- [Risk] Reading each recent file's `metadata.title` synchronously/serially on the Project Manager screen could add a small delay if entries are on a slow/network drive → Mitigation: read titles in parallel (`Promise.all`) and show the file name as an immediate fallback while resolving.
  - **RU:** [Риск] Синхронное/последовательное чтение `metadata.title` каждого недавнего файла на экране менеджера проектов может добавить небольшую задержку, если записи находятся на медленном/сетевом диске → Смягчение: читать названия параллельно (`Promise.all`) и сразу показывать имя файла как временный вариант, пока идёт разрешение.
- [Trade-off] No proactive validation means a stale entry can sit in the list until clicked; acceptable given the low cost of an occasional failed click vs. added startup I/O.
  - **RU:** [Компромисс] Отсутствие проактивной проверки означает, что устаревшая запись может оставаться в списке до клика; приемлемо с учётом низкой цены редкого неудачного клика по сравнению с дополнительным вводом-выводом при запуске.
