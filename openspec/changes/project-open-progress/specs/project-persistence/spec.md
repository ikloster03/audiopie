## MODIFIED Requirements

### Requirement: Open a project file
The system SHALL let the user open a `.audiopie` file via a native file dialog, detect whether it is a container or legacy JSON by content, and load its books/tracks/chapters/metadata (extracting to a working directory for a container, or falling back to empty tracks/chapters and default metadata for any missing fields for legacy JSON). Selecting a path and extracting a container SHALL be separate steps so the UI can block and report progress only during extract (see `project-open-progress`).

**RU:** Система ДОЛЖНА позволять открывать `.audiopie`-файл через нативный диалог, определять по содержимому, контейнер это или старый JSON, и загружать его книги/треки/главы/метаданные (распаковывая в рабочую директорию для контейнера, либо подставляя пустые треки/главы и метаданные по умолчанию для отсутствующих полей в старом JSON). Выбор пути и распаковка контейнера ДОЛЖНЫ быть отдельными шагами, чтобы UI мог блокироваться и показывать прогресс только во время распаковки (см. `project-open-progress`).

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

#### Scenario: Path selection is independent of extract
- **WHEN** the user confirms a file in the open dialog
- **THEN** the system SHALL return that path to the renderer without having started extract, so the renderer can show the extract overlay before asking the main process to open that path
- **RU:** Когда пользователь подтверждает файл в диалоге открытия, система ДОЛЖНА вернуть этот путь рендереру, ещё не начав распаковку, чтобы рендерер мог показать оверлей до запроса главному процессу открыть этот путь.

#### Scenario: Opening a chosen path loads the project
- **WHEN** the renderer requests open of an already-chosen `.audiopie` path
- **THEN** the system SHALL detect format by content, extract a container to a working directory or parse legacy JSON, and return a project snapshot
- **RU:** Когда рендерер запрашивает открытие уже выбранного пути `.audiopie`, система ДОЛЖНА определить формат по содержимому, распаковать контейнер в рабочую директорию или разобрать старый JSON и вернуть снимок проекта.
