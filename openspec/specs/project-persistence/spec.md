# project-persistence Specification

## Purpose
TBD - created by archiving change baseline-capture-existing-capabilities. Update Purpose after archive.
## Requirements
### Requirement: Project file format
The system SHALL persist a project as a JSON file with the `.audiopie` extension containing a `version` number and the project's `tracks`, `chapters`, and `metadata`.

**RU:** Система ДОЛЖНА сохранять проект как JSON-файл с расширением `.audiopie`, содержащий номер `version` и данные проекта: `tracks`, `chapters` и `metadata`.

#### Scenario: Save appends extension when missing
- **WHEN** the user saves a project and the chosen/target path does not end with `.audiopie`
- **THEN** the system SHALL append `.audiopie` to the file name before writing
- **RU:** Когда пользователь сохраняет проект, а выбранный/целевой путь не заканчивается на `.audiopie`, система ДОЛЖНА добавить `.audiopie` к имени файла перед записью.

### Requirement: Guard against saving an empty project
The UI SHALL block saving when there are no tracks or the book title is still the default "Untitled Audiobook" placeholder, showing a dismissible warning (auto-hidden after 5 seconds) instead of invoking the save.

**RU:** UI ДОЛЖЕН блокировать сохранение, если нет треков или название книги всё ещё равно плейсхолдеру "Untitled Audiobook" по умолчанию, показывая закрываемое предупреждение (скрывается через 5 секунд) вместо вызова сохранения.

#### Scenario: Save blocked for a fresh project
- **WHEN** the user clicks "Save" on a project with zero tracks or an unset title
- **THEN** the system SHALL NOT open the save dialog or write any file, and SHALL show a "cannot save" alert for 5 seconds
- **RU:** Когда пользователь нажимает «Сохранить» на проекте без треков или с ненастроенным названием, система НЕ ДОЛЖНА открывать диалог сохранения или записывать файл, и ДОЛЖНА показать предупреждение «невозможно сохранить» на 5 секунд.

### Requirement: Save to a known or new path
The system SHALL save to the previously known project path without prompting, or SHALL show a native save dialog when no path is yet known (new project), remembering the chosen path for subsequent saves.

**RU:** Система ДОЛЖНА сохранять в ранее известный путь проекта без диалога, либо показывать нативный диалог сохранения, если путь ещё не известен (новый проект), запоминая выбранный путь для последующих сохранений.

#### Scenario: Save an already-saved project
- **WHEN** the project was previously saved or opened from a file
- **THEN** subsequent saves SHALL write to that same path without showing a dialog, unless an explicit target path is supplied
- **RU:** Когда проект ранее уже был сохранён или открыт из файла, последующие сохранения ДОЛЖНЫ записывать в этот же путь без показа диалога, если явно не указан другой целевой путь.

### Requirement: Open a project file
The system SHALL let the user open a `.audiopie` file via a native file dialog, parse its JSON content, and fall back to empty tracks/chapters and default metadata (`{ title: 'Untitled Audiobook' }`) for any missing fields.

**RU:** Система ДОЛЖНА позволять открывать `.audiopie`-файл через нативный диалог, разбирать его JSON-содержимое и подставлять пустые треки/главы и метаданные по умолчанию (`{ title: 'Untitled Audiobook' }`) для любых отсутствующих полей.

#### Scenario: Open dialog is cancelled
- **WHEN** the user cancels the open-file dialog
- **THEN** the system SHALL leave the current in-memory project data unchanged
- **RU:** Когда пользователь отменяет диалог открытия файла, система ДОЛЖНА оставить текущие данные проекта в памяти без изменений.

#### Scenario: Opened project fails UI completeness check
- **WHEN** a project is opened whose parsed data has zero tracks, zero chapters, or a title still equal to "Untitled Audiobook"
- **THEN** the renderer SHALL NOT apply the opened data to the UI state and SHALL NOT transition into the open-project view, even though the main process has already loaded that data into its in-memory project store
- **RU:** Когда открывается проект, у которого в разобранных данных ноль треков, ноль глав или название всё ещё равно "Untitled Audiobook", рендерер НЕ ДОЛЖЕН применять открытые данные к состоянию UI и НЕ ДОЛЖЕН переключаться на экран открытого проекта, даже несмотря на то, что главный процесс уже загрузил эти данные в своё хранилище проекта в памяти.

### Requirement: Create a new project
The system SHALL let the user start a new, empty project, resetting the in-memory project (tracks, chapters, metadata) and clearing any remembered file path.

**RU:** Система ДОЛЖНА позволять начинать новый пустой проект, сбрасывая проект в памяти (треки, главы, метаданные) и очищая запомненный путь к файлу.

#### Scenario: Start a new project
- **WHEN** the user chooses "Create new" from the project manager screen
- **THEN** the system SHALL reset tracks and chapters to empty, reset the title to the default untitled placeholder, and open the empty project for editing
- **RU:** Когда пользователь выбирает «Создать новый» на экране менеджера проектов, система ДОЛЖНА сбросить треки и главы в пустые, сбросить название на плейсхолдер по умолчанию и открыть пустой проект для редактирования.

