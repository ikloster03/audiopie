## ADDED Requirements

### Requirement: Project type distinction
The system SHALL support two project types: `audiobook` (a single audiobook with tracks, chapters, and metadata — the existing behavior) and `series` (a collection referencing multiple `audiobook` projects). Every project file SHALL declare its `type`.

**RU:** Система ДОЛЖНА поддерживать два типа проекта: `audiobook` (одна аудиокнига с треками, главами и метаданными — существующее поведение) и `series` (коллекция, ссылающаяся на несколько проектов типа `audiobook`). Каждый файл проекта ДОЛЖЕН объявлять свой `type`.

#### Scenario: Choose project type when creating new
- **WHEN** the user chooses "Create new" from the Project Manager screen
- **THEN** the system SHALL ask whether to create a new "Audiobook" or a new "Series" project, and SHALL initialize the in-memory project with the corresponding `type`
- **RU:** Когда пользователь выбирает «Создать новый» на экране менеджера проектов, система ДОЛЖНА спросить, создавать ли новую «Аудиокнигу» или новую «Серию», и ДОЛЖНА инициализировать проект в памяти с соответствующим `type`.

### Requirement: Series project data shape
A `series` project SHALL store series-level metadata (title, author, narrator, cover path, description) and an ordered list of file system paths to member `audiobook` project files. A `series` project SHALL NOT itself contain `tracks` or `chapters`.

**RU:** Проект типа `series` ДОЛЖЕН хранить метаданные уровня серии (название, автор, чтец, путь к обложке, описание) и упорядоченный список путей к файлам входящих в неё проектов типа `audiobook`. Проект типа `series` НЕ ДОЛЖЕН сам содержать `tracks` или `chapters`.

#### Scenario: Save a series project
- **WHEN** the user saves a `series` project
- **THEN** the system SHALL write a JSON file containing `type: 'series'`, the series metadata, and the ordered `audiobookPaths` array, without any `tracks` or `chapters` fields
- **RU:** Когда пользователь сохраняет проект типа `series`, система ДОЛЖНА записать JSON-файл, содержащий `type: 'series'`, метаданные серии и упорядоченный массив `audiobookPaths`, без полей `tracks` или `chapters`.

### Requirement: Manage series members
The system SHALL let the user add an existing `audiobook` project file to a series, remove a member from a series, and reorder members within the series.

**RU:** Система ДОЛЖНА позволять пользователю добавлять существующий файл проекта `audiobook` в серию, удалять участника из серии и изменять порядок участников внутри серии.

#### Scenario: Add an audiobook to a series
- **WHEN** the user, while editing a `series` project, selects an existing `.audiopie` audiobook file to add
- **THEN** the system SHALL append its path to `audiobookPaths` if it is not already present, and SHALL reject (with a message) adding a file whose `type` is not `audiobook`
- **RU:** Когда пользователь, редактируя проект `series`, выбирает существующий `.audiopie`-файл аудиокниги для добавления, система ДОЛЖНА добавить его путь в `audiobookPaths`, если он ещё не присутствует, и ДОЛЖНА отклонить (с сообщением) добавление файла, чей `type` не равен `audiobook`.

#### Scenario: Open a series member for editing
- **WHEN** the user clicks a member audiobook listed in a `series` project
- **THEN** the system SHALL open that referenced `.audiopie` file the same way as opening it directly from the Project Manager
- **RU:** Когда пользователь нажимает на участника-аудиокнигу, перечисленного в проекте `series`, система ДОЛЖНА открыть указанный `.audiopie`-файл так же, как при открытии напрямую из менеджера проектов.

#### Scenario: Referenced audiobook file is missing
- **WHEN** the system attempts to resolve a member path in `audiobookPaths` that no longer exists on disk
- **THEN** the system SHALL display that member as "missing" in the series editor instead of failing to render the whole series, and SHALL NOT remove it from `audiobookPaths` automatically
- **RU:** Когда система пытается разрешить путь участника в `audiobookPaths`, который больше не существует на диске, она ДОЛЖНА отобразить этого участника как «отсутствует» в редакторе серии вместо сбоя отрисовки всей серии, и НЕ ДОЛЖНА автоматически удалять его из `audiobookPaths`.
