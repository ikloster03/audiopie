## 1. Types & data model

- [ ] 1.1 Add `ProjectType = 'audiobook' | 'series'` to `src/types.ts` and `electron/main/types.ts` (RU: добавить `ProjectType = 'audiobook' | 'series'` в `src/types.ts` и `electron/main/types.ts`)
- [ ] 1.2 Add `SeriesProject` type: `{ type: 'series'; version: number; title: string; author?: string; narrator?: string; coverPath?: string; description?: string; audiobookPaths: string[] }` (RU: добавить тип `SeriesProject` с указанными полями)
- [ ] 1.3 Add `type: 'audiobook'` to the existing audiobook project shape (kept otherwise unchanged) (RU: добавить `type: 'audiobook'` в существующую структуру проекта аудиокниги (в остальном без изменений))

## 2. Main process persistence

- [ ] 2.1 Update `electron/main/project.ts` open logic to default missing `type` to `'audiobook'` without rewriting the file (RU: обновить логику открытия в `electron/main/project.ts`, чтобы отсутствующий `type` по умолчанию считался `'audiobook'` без перезаписи файла)
- [ ] 2.2 Update `electron/main/project.ts` save logic to branch on `type` when serializing (RU: обновить логику сохранения в `electron/main/project.ts`, чтобы ветвиться по `type` при сериализации)
- [ ] 2.3 Add IPC handler(s) for series member management: add member path, remove member path, reorder members (RU: добавить обработчики IPC для управления участниками серии: добавить путь, удалить путь, изменить порядок участников)
- [ ] 2.4 Add IPC handler `project.newFromTemplate(templatePath)` that reads a template audiobook file and returns just its metadata fields (rejecting `type: 'series'` templates) (RU: добавить обработчик IPC `project.newFromTemplate(templatePath)`, читающий файл-шаблон аудиокниги и возвращающий только поля метаданных (отклоняя шаблоны с `type: 'series'`))
- [ ] 2.5 Add IPC handler `project.openSeriesMember(path)` reusing existing open-project logic (RU: добавить обработчик IPC `project.openSeriesMember(path)`, переиспользующий существующую логику открытия проекта)

## 3. Preload bridge

- [ ] 3.1 Expose new `project.*` methods in `electron/preload/preload.ts` and update the `AudioPieAPI` types (RU: пробросить новые методы `project.*` в `electron/preload/preload.ts` и обновить типы `AudioPieAPI`)

## 4. Renderer UI

- [ ] 4.1 Update `src/components/ProjectManager.tsx`: "Create new" now asks for project type (Audiobook / Series), and audiobook creation offers an optional "start from existing project" file picker (RU: обновить `src/components/ProjectManager.tsx`: «Создать новый» теперь спрашивает тип проекта (Аудиокнига / Серия), а создание аудиокниги предлагает опциональный выбор файла «начать на основе существующего проекта»)
- [ ] 4.2 Special-case the open-project UI-completeness check in `AppContext`/`ProjectManager.tsx` so `type: 'series'` files (no tracks/chapters) are accepted (RU: выделить особый случай в проверке полноты UI при открытии проекта в `AppContext`/`ProjectManager.tsx`, чтобы файлы `type: 'series'` (без треков/глав) принимались)
- [ ] 4.3 Create `src/components/SeriesEditor.tsx`: list of member audiobooks (title/author from resolved metadata or "missing" state), add/remove/reorder controls, click-to-open a member (RU: создать `src/components/SeriesEditor.tsx`: список входящих аудиокниг (название/автор из разрешённых метаданных либо состояние «отсутствует»), элементы добавления/удаления/переупорядочивания, открытие участника по клику)
- [ ] 4.4 Wire `SeriesEditor` into the workspace shell (coordinate with `redesign-project-workspace`'s sidebar if that change lands first; otherwise add as its own top-level view for series-type projects) (RU: подключить `SeriesEditor` в оболочку рабочего пространства (согласовать с боковой панелью из `redesign-project-workspace`, если то изменение будет реализовано раньше; иначе добавить как отдельный верхнеуровневый экран для проектов типа «серия»))
- [ ] 4.5 Create `src/styles/components/series-editor.scss` following BEM conventions and import it in `globals.scss` (RU: создать `src/styles/components/series-editor.scss` по методологии BEM и подключить его в `globals.scss`)

## 5. Localization

- [ ] 5.1 Add new i18n keys (project type picker, "create from template", series editor labels, "missing" member state) to `src/i18n/locales/en.json` (RU: добавить новые ключи i18n (выбор типа проекта, «создать по шаблону», подписи редактора серии, состояние «отсутствует») в `src/i18n/locales/en.json`)
- [ ] 5.2 Add matching Russian translations to `src/i18n/locales/ru.json` (RU: добавить соответствующие переводы на русский в `src/i18n/locales/ru.json`)

## 6. Tests

- [ ] 6.1 Unit test: opening a legacy `.audiopie` file without `type` is treated as `audiobook` (RU: юнит-тест: открытие старого `.audiopie`-файла без `type` считается `audiobook`)
- [ ] 6.2 Unit test: saving/opening a `series` project round-trips `audiobookPaths` correctly (RU: юнит-тест: сохранение/открытие проекта `series` корректно сохраняет `audiobookPaths`)
- [ ] 6.3 Unit test: `project.newFromTemplate` copies only metadata fields and rejects series-type templates (RU: юнит-тест: `project.newFromTemplate` копирует только поля метаданных и отклоняет шаблоны типа «серия»)
- [ ] 6.4 Manual test: series editor gracefully shows "missing" for a deleted/moved member file (RU: ручной тест: редактор серии корректно показывает «отсутствует» для удалённого/перемещённого файла участника)
