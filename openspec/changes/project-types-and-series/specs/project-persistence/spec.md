## MODIFIED Requirements

### Requirement: Project file format
The system SHALL persist a project as a JSON file with the `.audiopie` extension containing a `version` number, a `type` field (`audiobook` or `series`), and type-specific fields: for `type: 'audiobook'`, the project's `tracks`, `chapters`, and `metadata`; for `type: 'series'`, the series' shared metadata and an ordered `audiobookPaths` array. Files that do not declare a `type` SHALL be treated as `type: 'audiobook'` for backward compatibility with projects saved before this change.

**RU:** Система ДОЛЖНА сохранять проект как JSON-файл с расширением `.audiopie`, содержащий номер `version`, поле `type` (`audiobook` или `series`) и специфичные для типа поля: для `type: 'audiobook'` — `tracks`, `chapters` и `metadata`; для `type: 'series'` — общие метаданные серии и упорядоченный массив `audiobookPaths`. Файлы, не объявляющие `type`, ДОЛЖНЫ рассматриваться как `type: 'audiobook'` для обратной совместимости с проектами, сохранёнными до этого изменения.

#### Scenario: Save appends extension when missing
- **WHEN** the user saves a project and the chosen/target path does not end with `.audiopie`
- **THEN** the system SHALL append `.audiopie` to the file name before writing
- **RU:** Когда пользователь сохраняет проект, а выбранный/целевой путь не заканчивается на `.audiopie`, система ДОЛЖНА добавить `.audiopie` к имени файла перед записью.

#### Scenario: Open a legacy project file without a type field
- **WHEN** the user opens a `.audiopie` file that has no `type` field (saved before this change)
- **THEN** the system SHALL treat it as `type: 'audiobook'` and load its `tracks`, `chapters`, and `metadata` as before
- **RU:** Когда пользователь открывает `.audiopie`-файл без поля `type` (сохранённый до этого изменения), система ДОЛЖНА считать его `type: 'audiobook'` и загрузить его `tracks`, `chapters` и `metadata` как раньше.

## ADDED Requirements

### Requirement: Create project from an existing project template
When creating a new `audiobook` project, the system SHALL let the user optionally select an existing `.audiopie` audiobook file as a template. The new project SHALL be pre-filled with the template's metadata (author, narrator, genre, publisher, series, series index, cover path) but SHALL start with empty `tracks` and `chapters`, and SHALL NOT remember the template's file path as its own save path.

**RU:** При создании нового проекта `audiobook` система ДОЛЖНА позволять пользователю опционально выбрать существующий `.audiopie`-файл аудиокниги в качестве шаблона. Новый проект ДОЛЖЕН быть предзаполнен метаданными шаблона (автор, чтец, жанр, издатель, серия, номер в серии, путь к обложке), но ДОЛЖЕН начинаться с пустых `tracks` и `chapters`, и НЕ ДОЛЖЕН запоминать путь файла шаблона как свой собственный путь сохранения.

#### Scenario: Create a new project from a template
- **WHEN** the user chooses "Create new" → "Audiobook", then selects an existing `.audiopie` file as a template
- **THEN** the system SHALL copy that file's metadata fields into the new project's in-memory metadata, leave `tracks` and `chapters` empty, and open the editing workspace without a remembered save path (so the first save shows the save dialog)
- **RU:** Когда пользователь выбирает «Создать новый» → «Аудиокнига», а затем выбирает существующий `.audiopie`-файл в качестве шаблона, система ДОЛЖНА скопировать поля метаданных этого файла в метаданные нового проекта в памяти, оставить `tracks` и `chapters` пустыми и открыть рабочее пространство редактирования без запомненного пути сохранения (поэтому при первом сохранении откроется диалог сохранения).

#### Scenario: Template file is a series project
- **WHEN** the user attempts to select a `.audiopie` file whose `type` is `series` as a template for a new audiobook
- **THEN** the system SHALL reject the selection and show a message that only audiobook projects can be used as templates
- **RU:** Когда пользователь пытается выбрать `.audiopie`-файл с `type: 'series'` в качестве шаблона для нового аудиопроекта, система ДОЛЖНА отклонить выбор и показать сообщение о том, что в качестве шаблона можно использовать только проекты аудиокниг.
