## ADDED Requirements

### Requirement: Project session is per window
The system SHALL keep a separate in-memory project session (state, working directory, remembered path, legacy-pending flag) for each application window. Open, create, save, and close operations invoked from a window SHALL apply only to that window's session.

**RU:** Система ДОЛЖНА хранить отдельную сессию проекта в памяти (состояние, рабочая директория, путь, флаг legacy) для каждого окна приложения. Операции открытия, создания, сохранения и закрытия, вызванные из окна, ДОЛЖНЫ применяться только к сессии этого окна.

#### Scenario: Close project in one window
- **WHEN** the user closes the project in window W while window V has a different project open
- **THEN** the system SHALL reset only window W's session (clean its working directory, clear its path, return W to welcome) and SHALL leave window V's session intact
- **RU:** Когда пользователь закрывает проект в окне W, а в окне V открыт другой проект, система ДОЛЖНА сбросить только сессию окна W (очистить рабочую директорию, очистить путь, вернуть W на welcome) и НЕ ДОЛЖНА трогать сессию окна V.

#### Scenario: Cancelled open dialog is per window
- **WHEN** the user cancels the open-file dialog shown for window W
- **THEN** the system SHALL leave every window's in-memory project data unchanged, including window W
- **RU:** Когда пользователь отменяет диалог открытия файла, показанный для окна W, система ДОЛЖНА оставить данные проекта во всех окнах без изменений, включая окно W.

### Requirement: Open or create of an owned path focuses the owner
When a path chosen for open or new-project create is already owned by another window's session (same canonical path), the system SHALL focus that owner window and SHALL NOT load the path into the requesting window's session.

**RU:** Когда путь, выбранный для открытия или создания нового проекта, уже принадлежит сессии другого окна (тот же канонический путь), система ДОЛЖНА вывести окно-владельца на передний план и НЕ ДОЛЖНА загружать этот путь в сессию запросившего окна.

#### Scenario: Open dialog then owned path
- **WHEN** the renderer of an empty window confirms an open-dialog path that is already owned by another window
- **THEN** the system SHALL return a focused-existing result without extracting a container or parsing the file into the requester, and the requesting renderer SHALL remain on the welcome screen
- **RU:** Когда рендерер пустого окна подтверждает путь из диалога открытия, уже принадлежащий другому окну, система ДОЛЖНА вернуть результат «уже открыт и сфокусирован» без распаковки контейнера и без разбора файла в запросившем окне, а рендерер запросившего окна ДОЛЖЕН остаться на welcome-экране.

#### Scenario: Canonical path collision
- **WHEN** the user opens a path that is a symlink or differently-cased/normalized spelling of a file already open
- **THEN** the system SHALL treat it as the same project and focus the existing window instead of opening a second session
- **RU:** Когда пользователь открывает путь, который является симлинком или иначе нормализованным написанием уже открытого файла, система ДОЛЖНА считать это тем же проектом и сфокусировать существующее окно вместо второй сессии.
