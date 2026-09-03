## MODIFIED Requirements

### Requirement: Project file format
The system SHALL persist a project as a JSON file with the `.audiopie` extension containing a `version` number, the project's `tracks`, `chapters`, and `metadata`, and an optional `buildHistory` array of past build attempts (each with timestamp, duration, outcome, and, for successful builds, output size and the bitrate/thread settings used). Projects saved before this change (with no `buildHistory` field) SHALL be treated as having an empty history.

**RU:** Система ДОЛЖНА сохранять проект как JSON-файл с расширением `.audiopie`, содержащий номер `version`, данные проекта `tracks`, `chapters`, `metadata` и опциональный массив `buildHistory` с предыдущими попытками сборки (каждая с временной меткой, длительностью, результатом и, для успешных сборок, размером выходного файла и использованными настройками битрейта/потоков). Проекты, сохранённые до этого изменения (без поля `buildHistory`), ДОЛЖНЫ считаться имеющими пустую историю.

#### Scenario: Save appends extension when missing
- **WHEN** the user saves a project and the chosen/target path does not end with `.audiopie`
- **THEN** the system SHALL append `.audiopie` to the file name before writing
- **RU:** Когда пользователь сохраняет проект, а выбранный/целевой путь не заканчивается на `.audiopie`, система ДОЛЖНА добавить `.audiopie` к имени файла перед записью.

#### Scenario: Open a legacy project without build history
- **WHEN** the user opens a `.audiopie` file saved before this change (no `buildHistory` field)
- **THEN** the system SHALL treat its build history as an empty array rather than failing to load the project
- **RU:** Когда пользователь открывает `.audiopie`-файл, сохранённый до этого изменения (без поля `buildHistory`), система ДОЛЖНА считать его историю сборок пустым массивом, а не сбоить при загрузке проекта.
