## Why

AudioPie currently only understands a single kind of project: one audiobook, saved as one `.audiopie` file. Users who work on multi-book series have no way to represent the series itself (its shared identity, ordering, and shared metadata like author/narrator/cover) or to quickly start a new book that reuses the previous book's settings. This addresses GitHub issues [#28](https://github.com/ikloster03/audiopie/issues/28) (project types: Audiobook vs. Series) and [#27](https://github.com/ikloster03/audiopie/issues/27) (create a new project from an existing one).

**RU:** Сейчас AudioPie понимает только один тип проекта — одна аудиокнига, сохранённая в одном `.audiopie`-файле. У пользователей, работающих над сериями из нескольких книг, нет способа представить саму серию (её идентичность, порядок книг, общие метаданные вроде автора/чтеца/обложки) или быстро начать новую книгу на основе настроек предыдущей. Это закрывает issues #28 (типы проектов: аудиокнига/серия) и #27 (создание нового проекта на основе существующего).

## What Changes

- Introduce a `type` field on projects: `audiobook` (existing behavior, default) or `series`.
  - **RU:** Ввести поле `type` у проектов: `audiobook` (существующее поведение, по умолчанию) или `series`.
- A `series` project is a lightweight project that holds series-level metadata (title, author, narrator, cover, description) plus an ordered list of references (file paths) to `audiobook` project files that belong to it. It does NOT itself contain tracks/chapters.
  - **RU:** Проект `series` — это лёгкий проект, хранящий метаданные уровня серии (название, автор, чтец, обложка, описание) и упорядоченный список ссылок (путей к файлам) на входящие в неё проекты `audiobook`. Сам он НЕ содержит треков/глав.
- Existing `.audiopie` files without a `type` field SHALL be treated as `type: 'audiobook'` for backward compatibility. **Not breaking** for existing saved projects.
  - **RU:** Существующие `.audiopie`-файлы без поля `type` ДОЛЖНЫ считаться `type: 'audiobook'` для обратной совместимости. Не является ломающим изменением для уже сохранённых проектов.
- The Project Manager screen (`ProjectManager.tsx`) gains a choice of project type when creating new: "New Audiobook" or "New Series".
  - **RU:** Экран менеджера проектов (`ProjectManager.tsx`) получает выбор типа проекта при создании нового: «Новая аудиокнига» или «Новая серия».
- A `series` project's editing view lets the user add/remove/reorder audiobook references and open a referenced audiobook project directly.
  - **RU:** Экран редактирования проекта `series` позволяет пользователю добавлять/удалять/переупорядочивать ссылки на аудиокниги и открывать связанный проект аудиокниги напрямую.
- Add "Create new project from existing project": when creating a new `audiobook` project, the user may optionally pick an existing `.audiopie` file as a template; the new project is pre-filled with that project's metadata (author, narrator, genre, publisher, series, cover) but starts with empty tracks/chapters and no remembered file path (so it must be saved separately).
  - **RU:** Добавить «Создать новый проект на основе существующего»: при создании нового проекта `audiobook` пользователь может опционально выбрать существующий `.audiopie`-файл в качестве шаблона; новый проект будет предзаполнен метаданными этого проекта (автор, чтец, жанр, издатель, серия, обложка), но начнётся с пустых треков/глав и без запомненного пути файла (поэтому его нужно будет сохранить отдельно).

## Capabilities

### New Capabilities
- `project-types`: Defines the `audiobook`/`series` project type distinction, the `series` project's data shape (ordered audiobook references + shared metadata), and the UI for managing a series' member audiobooks.
  - **RU:** Определяет разделение типов проектов `audiobook`/`series`, структуру данных проекта `series` (упорядоченные ссылки на аудиокниги + общие метаданные) и UI для управления входящими в серию аудиокнигами.

### Modified Capabilities
- `project-persistence`: Project file format gains a `type` field (defaulting to `audiobook` when absent); adds a "create from existing project" flow that seeds a new project's metadata from a chosen template file.
  - **RU:** Формат файла проекта получает поле `type` (по умолчанию `audiobook`, если отсутствует); добавляется сценарий «создать на основе существующего проекта», заполняющий метаданные нового проекта из выбранного файла-шаблона.

## Impact

- `electron/main/types.ts` / `src/types.ts`: add `ProjectType = 'audiobook' | 'series'` and a `SeriesProject` type (title, author, narrator, coverPath, description, `audiobookPaths: string[]`).
- `electron/main/project.ts`: handle reading/writing both project types; default missing `type` to `'audiobook'` on open.
- `src/components/ProjectManager.tsx`: add a type choice when creating a new project, and a "create from template" file picker.
- New component (e.g. `src/components/SeriesEditor.tsx`) for managing a series' audiobook references.
- `electron/preload/preload.ts`: new/extended `project.*` IPC methods (e.g. `project.newFromTemplate(templatePath)`, `project.openSeriesMember(path)`).
- `src/i18n/locales/en.json` / `ru.json`: new strings for project type selection and series editing.

**RU:** `electron/main/types.ts` / `src/types.ts` — добавить `ProjectType = 'audiobook' | 'series'` и тип `SeriesProject` (title, author, narrator, coverPath, description, `audiobookPaths: string[]`). `electron/main/project.ts` — обработка чтения/записи обоих типов проектов; отсутствующий `type` по умолчанию считать `'audiobook'` при открытии. `src/components/ProjectManager.tsx` — добавить выбор типа при создании нового проекта и выбор файла «создать по шаблону». Новый компонент (например, `src/components/SeriesEditor.tsx`) для управления ссылками на аудиокниги в серии. `electron/preload/preload.ts` — новые/расширенные методы IPC `project.*` (например, `project.newFromTemplate(templatePath)`, `project.openSeriesMember(path)`). `src/i18n/locales/en.json` / `ru.json` — новые строки для выбора типа проекта и редактирования серии.
