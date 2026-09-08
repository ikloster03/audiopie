## MODIFIED Requirements

### Requirement: Project file format
The system SHALL persist a project as a ZIP archive with the `.audiopie` extension (the "container format"), using the `STORE` method, containing a root `index.json` (`{ version: 2, type, series?, bookOrder }`) at the archive root plus one `books/<bookId>/` directory per book, each owning its own `index.json` (metadata + tracks), its chapter MP3s, and its own optional cover image (no shared top-level `covers/` directory, no series-level cover). The system SHALL also continue to recognize and open a legacy plain-JSON `.audiopie` file (`{ version: 1, tracks, chapters, metadata }`) by inspecting the file's content rather than trusting its extension, and SHALL upgrade a legacy file to the container format the first time it is saved (see `project-container-format` capability for the full container schema and migration behavior).

**RU:** Система ДОЛЖНА сохранять проект как ZIP-архив с расширением `.audiopie` (формат контейнера), методом `STORE`, содержащий корневой `index.json` (`{ version: 2, type, series?, bookOrder }`) в корне архива плюс по одной директории `books/<bookId>/` на книгу, каждая со своим `index.json` (метаданные + треки), главами-MP3 и опциональной собственной обложкой (без общей директории `covers/` и без обложки уровня серии). Система ДОЛЖНА также продолжать распознавать и открывать старый plain-JSON `.audiopie`-файл (`{ version: 1, tracks, chapters, metadata }`) по содержимому, а не по расширению, и ДОЛЖНА обновлять его до формата контейнера при первом сохранении.

#### Scenario: Save appends extension when missing
- **WHEN** the user saves a project and the chosen/target path does not end with `.audiopie`
- **THEN** the system SHALL append `.audiopie` to the file name before writing
- **RU:** Когда пользователь сохраняет проект, а выбранный/целевой путь не заканчивается на `.audiopie`, система ДОЛЖНА добавить `.audiopie` к имени файла перед записью.

#### Scenario: File content, not extension, determines format on open
- **WHEN** the system opens a file with the `.audiopie` extension
- **THEN** the system SHALL inspect its content to determine whether it is a ZIP container or legacy JSON, and SHALL parse it accordingly regardless of any assumption based on the extension alone
- **RU:** Когда система открывает файл с расширением `.audiopie`, она ДОЛЖНА определить по содержимому, является ли он ZIP-контейнером или старым JSON, и разобрать его соответствующим образом, не полагаясь только на расширение.

### Requirement: Save to the project's already-known path
The system SHALL save an open project to its already-known path without prompting, since every open project has a path assigned either at creation (see `project-types` capability) or by having been opened from an existing file. An explicit "Save As" action SHALL prompt for a new path and SHALL NOT alter the currently open project's remembered path.

**RU:** Система ДОЛЖНА сохранять открытый проект по уже известному пути без диалога, поскольку у каждого открытого проекта путь назначен либо при создании (см. capability `project-types`), либо получен при открытии существующего файла. Явное действие «Сохранить как» ДОЛЖНО запрашивать новый путь и НЕ ДОЛЖНО изменять запомненный путь текущего открытого проекта.

#### Scenario: Save an open project
- **WHEN** the user saves a project that is currently open (created moments ago or opened from a file)
- **THEN** the system SHALL write to that project's known path without showing a save dialog
- **RU:** Когда пользователь сохраняет открытый проект (только что созданный или открытый из файла), система ДОЛЖНА записать по известному пути этого проекта без показа диалога сохранения.

#### Scenario: Save As writes to a new path
- **WHEN** the user explicitly invokes "Save As" and chooses a different path
- **THEN** the system SHALL write the container to the new path and SHALL leave the originally open project's own remembered path unchanged unless the user subsequently continues editing at the new path
- **RU:** Когда пользователь явно вызывает «Сохранить как» и выбирает другой путь, система ДОЛЖНА записать контейнер по новому пути и оставить запомненный путь исходно открытого проекта без изменений, если пользователь не продолжит редактирование по новому пути.

### Requirement: Open a project file
The system SHALL let the user open a `.audiopie` file via a native file dialog, detect whether it is a container or legacy JSON by content, and load its books/tracks/chapters/metadata (extracting to a working directory for a container, or falling back to empty tracks/chapters and default metadata for any missing fields for legacy JSON).

**RU:** Система ДОЛЖНА позволять открывать `.audiopie`-файл через нативный диалог, определять по содержимому, контейнер это или старый JSON, и загружать его книги/треки/главы/метаданные (распаковывая в рабочую директорию для контейнера, либо подставляя пустые треки/главы и метаданные по умолчанию для отсутствующих полей в старом JSON).

#### Scenario: Open dialog is cancelled
- **WHEN** the user cancels the open-file dialog
- **THEN** the system SHALL leave the current in-memory project data unchanged
- **RU:** Когда пользователь отменяет диалог открытия файла, система ДОЛЖНА оставить текущие данные проекта в памяти без изменений.

#### Scenario: Opened project fails UI completeness check
- **WHEN** an opened `audiobook`-type project has zero tracks in its book, zero chapters, or a title still equal to "Untitled Audiobook"
- **THEN** the renderer SHALL NOT apply the opened data to the UI state and SHALL NOT transition into the open-project view, even though the main process has already loaded that data into its in-memory project store
- **RU:** Когда открытый проект типа `audiobook` содержит ноль треков в книге, ноль глав или название всё ещё равно "Untitled Audiobook", рендерер НЕ ДОЛЖЕН применять открытые данные к состоянию UI и НЕ ДОЛЖЕН переключаться на экран открытого проекта, даже несмотря на то, что главный процесс уже загрузил эти данные в своё хранилище проекта в памяти.

#### Scenario: Opening a series project bypasses the audiobook completeness check
- **WHEN** an opened `series`-type project has zero books
- **THEN** the renderer SHALL still transition into the open-project view (its unified series management page), since the audiobook-specific "zero tracks" completeness check does not apply to a series
- **RU:** Когда открытый проект типа `series` содержит ноль книг, рендерер ДОЛЖЕН всё равно переключиться на экран открытого проекта (его единую страницу управления серией), поскольку проверка полноты для аудиокниги («ноль треков») не применяется к серии.

## REMOVED Requirements

### Requirement: Guard against saving an empty project
**Reason**: Every project now has a save path assigned up front at creation time (see `project-types` capability's "Choose a project type and save location before editing"), so there is no longer an untitled/unsaved state to guard against — Save always writes to an already-known path.
**Migration**: No user-facing migration needed. The "cannot save" warning UI is removed; "Create new" now always requires picking a save location before the editor opens, which is where this concern is now handled.

**RU:** **Причина**: у каждого проекта путь сохранения теперь назначается заранее, при создании (см. capability `project-types`), поэтому неозаглавленного несохранённого состояния, от которого нужно защищаться, больше не существует. **Миграция**: миграция для пользователя не требуется. Предупреждение «невозможно сохранить» удаляется; теперь «Создать новый» всегда требует выбрать место сохранения до открытия редактора.

### Requirement: Create a new project
**Reason**: Superseded by `project-types`' "Choose a project type and save location before editing" — creating a new project now requires picking a project type (audiobook/series) and a save location up front, and writes a real container to disk immediately, rather than resetting in-memory state and clearing any remembered path.
**Migration**: No user-facing migration needed. Any code calling the old "new project" IPC/flow should be updated to call the type-and-path-aware creation flow described in `project-types`.

**RU:** **Причина**: заменено требованием «Выбор типа проекта и места сохранения перед началом редактирования» из capability `project-types` — создание нового проекта теперь требует заранее выбрать тип (аудиокнига/серия) и место сохранения и сразу записывает реальный контейнер на диск, вместо сброса состояния в памяти и очистки запомненного пути. **Миграция**: миграция для пользователя не требуется. Код, вызывающий старый флоу «новый проект», должен быть обновлён на флоу создания с учётом типа и пути из `project-types`.
