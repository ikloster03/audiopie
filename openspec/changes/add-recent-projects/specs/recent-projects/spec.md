## ADDED Requirements

### Requirement: Track recently opened/saved projects
The system SHALL maintain a most-recently-used (MRU) list of project file paths, capped at 10 entries, ordered most-recent-first. The system SHALL add or move a path to the front of the list whenever a project is successfully opened or successfully saved to that path, persisting the list across app restarts.

**RU:** Система ДОЛЖНА вести список недавно использованных (MRU) путей к файлам проектов, ограниченный 10 записями, упорядоченный от самого недавнего. Система ДОЛЖНА добавлять или перемещать путь в начало списка каждый раз, когда проект успешно открывается или успешно сохраняется по этому пути, сохраняя список между перезапусками приложения.

#### Scenario: Open a project adds it to recents
- **WHEN** the user successfully opens a `.audiopie` file
- **THEN** the system SHALL move that file's path to the front of the recent projects list, persisting the updated list
- **RU:** Когда пользователь успешно открывает `.audiopie`-файл, система ДОЛЖНА переместить путь этого файла в начало списка недавних проектов, сохранив обновлённый список.

#### Scenario: Saving a new project adds it to recents
- **WHEN** the user saves a project for the first time (no previously known path) and the save dialog completes successfully
- **THEN** the system SHALL add the newly chosen path to the front of the recent projects list
- **RU:** Когда пользователь впервые сохраняет проект (без ранее известного пути) и диалог сохранения успешно завершается, система ДОЛЖНА добавить новый выбранный путь в начало списка недавних проектов.

#### Scenario: List exceeds the cap
- **WHEN** adding a new path would make the recent projects list exceed 10 entries
- **THEN** the system SHALL drop the oldest (last) entry so the list never exceeds 10
- **RU:** Когда добавление нового пути привело бы к превышению списком недавних проектов 10 записей, система ДОЛЖНА удалить самую старую (последнюю) запись, чтобы список никогда не превышал 10.

### Requirement: Display recent projects in the Project Manager
The Project Manager screen SHALL display the recent projects list, showing each entry's project title (read from the file's `metadata.title`, falling back to the file name if unreadable) and full path, alongside the existing "Open Project" and "Create New" cards.

**RU:** Экран менеджера проектов ДОЛЖЕН отображать список недавних проектов, показывая для каждой записи название проекта (из `metadata.title` файла, либо имя файла, если прочитать не удалось) и полный путь, рядом с существующими карточками «Открыть проект» и «Создать новый».

#### Scenario: No recent projects yet
- **WHEN** the recent projects list is empty (e.g. first run)
- **THEN** the Project Manager screen SHALL show only the "Open Project" and "Create New" cards, without an empty recents section
- **RU:** Когда список недавних проектов пуст (например, при первом запуске), экран менеджера проектов ДОЛЖЕН показывать только карточки «Открыть проект» и «Создать новый», без пустого раздела недавних проектов.

#### Scenario: Click a recent project entry
- **WHEN** the user clicks a recent project entry whose file still exists
- **THEN** the system SHALL open that project the same way as using the "Open Project" file dialog and selecting that file, and SHALL move it to the front of the recent list
- **RU:** Когда пользователь нажимает на запись недавнего проекта, файл которого всё ещё существует, система ДОЛЖНА открыть этот проект так же, как при выборе файла через диалог «Открыть проект», и переместить его в начало списка недавних.

### Requirement: Handle missing or invalid recent project files
The system SHALL detect when a recent project's file no longer exists or fails to parse when the user attempts to open it, show an inline "not found"/"failed to open" indication, and remove that entry from the recent list.

**RU:** Система ДОЛЖНА определять, что файл недавнего проекта больше не существует или не удаётся разобрать при попытке пользователя его открыть, показывать встроенное сообщение «не найден»/«не удалось открыть» и удалять эту запись из списка недавних.

#### Scenario: Recent file was deleted
- **WHEN** the user clicks a recent project entry whose underlying file no longer exists on disk
- **THEN** the system SHALL NOT attempt to transition into the editing workspace, SHALL show a "file not found" message, and SHALL remove that entry from the persisted recent projects list
- **RU:** Когда пользователь нажимает на запись недавнего проекта, файл которого больше не существует на диске, система НЕ ДОЛЖНА пытаться перейти в рабочее пространство редактирования, ДОЛЖНА показать сообщение «файл не найден» и удалить эту запись из сохранённого списка недавних проектов.

### Requirement: Clear recent projects
The system SHALL provide an explicit action to clear the entire recent projects list.

**RU:** Система ДОЛЖНА предоставлять явное действие для полной очистки списка недавних проектов.

#### Scenario: User clears recent projects
- **WHEN** the user clicks "Clear recent projects" and confirms
- **THEN** the system SHALL empty the persisted recent projects list and hide the recents section from the Project Manager screen
- **RU:** Когда пользователь нажимает «Очистить недавние проекты» и подтверждает действие, система ДОЛЖНА очистить сохранённый список недавних проектов и скрыть раздел недавних на экране менеджера проектов.
