## ADDED Requirements

### Requirement: Second launch with a document path follows Rule A
When a second OS launch (or a macOS `open-file` while the app is running) includes one or more `.audiopie` paths, the system SHALL open each path using Rule A (focus existing, else reuse a welcome window, else create a new window) inside the already-running process. This SHALL NOT start a second process. A second launch that still has no document arguments SHALL keep the existing behavior: focus the last-focused window and do not create a window.

**RU:** Когда повторный запуск ОС (или macOS `open-file` при уже работающем приложении) содержит один или несколько путей `.audiopie`, система ДОЛЖНА открыть каждый путь по правилу A (focus существующего, иначе reuse welcome, иначе новое окно) в уже запущенном процессе. Это НЕ ДОЛЖНО стартовать второй процесс. Повторный запуск без аргументов-документов ДОЛЖЕН сохранить существующее поведение: сфокусировать последнее активное окно и не создавать окно.

#### Scenario: Double-click while all windows are occupied
- **WHEN** the app is already running, every window has a project open, and the user opens a different `.audiopie` file from the OS
- **THEN** the existing process SHALL create a new window for that file and SHALL NOT replace any occupied editor
- **RU:** Когда приложение уже запущено, в каждом окне открыт проект, и пользователь открывает другой файл `.audiopie` из ОС, существующий процесс ДОЛЖЕН создать новое окно для этого файла и НЕ ДОЛЖЕН подменять ни один занятый редактор

#### Scenario: Double-click while a welcome window exists
- **WHEN** the app is already running with a welcome window and the user opens a `.audiopie` file that is not already open
- **THEN** the existing process SHALL load the file into a welcome window and SHALL NOT create an extra empty window
- **RU:** Когда приложение уже запущено с welcome-окном и пользователь открывает ещё не открытый `.audiopie`, существующий процесс ДОЛЖЕН загрузить файл в welcome-окно и НЕ ДОЛЖЕН создавать лишнее пустое окно

#### Scenario: Second launch without a file is unchanged
- **WHEN** the user launches AudioPie again while it is already running, with no project file in the launch arguments
- **THEN** the existing process SHALL focus its last-focused window and SHALL NOT create a new window
- **RU:** Когда пользователь снова запускает AudioPie, пока оно уже запущено, без файла проекта в аргументах, существующий процесс ДОЛЖЕН сфокусировать последнее активное окно и НЕ ДОЛЖЕН создавать новое окно
