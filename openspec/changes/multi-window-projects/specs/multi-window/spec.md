## ADDED Requirements

### Requirement: Multiple application windows
The system SHALL allow more than one application window to be open in a single app process, each with an independent renderer and project session.

**RU:** Система ДОЛЖНА позволять держать больше одного окна приложения в одном процессе, у каждого — свой рендерер и своя сессия проекта.

#### Scenario: Two windows hold different projects
- **WHEN** the user has project file A open in one window and opens a different project file B in a second window
- **THEN** each window SHALL show and persist its own project, and edits in one window SHALL NOT change the other window's in-memory project, working directory, or path
- **RU:** Когда в одном окне открыт файл A, а во втором — другой файл B, каждое окно ДОЛЖНО показывать и сохранять свой проект, и правки в одном окне НЕ ДОЛЖНЫ менять проект, рабочую директорию или путь другого окна.

### Requirement: New Window opens an empty welcome screen
The system SHALL provide a New Window action that creates a new `BrowserWindow` showing the project manager (welcome) screen with no project open.

**RU:** Система ДОЛЖНА предоставлять действие «Новое окно», которое создаёт новое `BrowserWindow` с экраном менеджера проектов (welcome) без открытого проекта.

#### Scenario: New Window from an occupied editor
- **WHEN** the user invokes New Window while a project is open in the focused window
- **THEN** the system SHALL create a new window on the welcome screen and SHALL leave the original window and its project unchanged
- **RU:** Когда пользователь вызывает «Новое окно», пока в сфокусированном окне открыт проект, система ДОЛЖНА создать новое окно на welcome-экране и НЕ ДОЛЖНА менять исходное окно и его проект.

#### Scenario: App start still has one window
- **WHEN** the app finishes launching with no existing windows
- **THEN** the system SHALL create exactly one empty welcome window (same as today's first window)
- **RU:** Когда приложение завершает запуск без существующих окон, система ДОЛЖНА создать ровно одно пустое welcome-окно (как сегодняшнее первое окно).

### Requirement: Single open of a project path
The system SHALL allow a given project file (identified by canonical filesystem path) to be open in at most one window at a time. Opening or creating a project at a path that is already open SHALL bring that existing window to the front and SHALL NOT start a second session, extract, or overwrite.

**RU:** Система ДОЛЖНА позволять данному файлу проекта (канонический путь в файловой системе) быть открытым максимум в одном окне. Открытие или создание проекта по уже занятому пути ДОЛЖНО выводить существующее окно на передний план и НЕ ДОЛЖНО начинать вторую сессию, распаковку или перезапись.

#### Scenario: Open an already-open file from another window
- **WHEN** the user chooses a `.audiopie` path in window W that is already open in window V
- **THEN** the system SHALL show and focus window V, SHALL NOT extract or load the file into window W, and SHALL leave window W on its current screen (typically welcome)
- **RU:** Когда пользователь выбирает путь `.audiopie` в окне W, который уже открыт в окне V, система ДОЛЖНА показать и сфокусировать окно V, НЕ ДОЛЖНА распаковывать или загружать файл в окно W, и ДОЛЖНА оставить окно W на текущем экране (обычно welcome).

#### Scenario: Create new at an already-open path
- **WHEN** the user confirms a new-project save path that canonicalizes to a file already open in another window
- **THEN** the system SHALL show and focus that existing window and SHALL NOT create, overwrite, or replace the live session
- **RU:** Когда пользователь подтверждает путь сохранения нового проекта, который совпадает с уже открытым файлом в другом окне, система ДОЛЖНА показать и сфокусировать это окно и НЕ ДОЛЖНА создавать, перезаписывать или подменять живую сессию.

#### Scenario: Close project releases the path
- **WHEN** the user closes the project in the window that owned path P (returning that window to welcome) and then opens P from any window
- **THEN** the system SHALL load P into the requesting window as a normal open, because P is no longer owned
- **RU:** Когда пользователь закрывает проект в окне, которому принадлежал путь P (окно возвращается на welcome), а затем открывает P из любого окна, система ДОЛЖНА загрузить P в запросившее окно как обычное открытие, потому что P больше никому не принадлежит.

### Requirement: Window title reflects the document
The system SHALL set each window's title to `AudioPie` when that window has no project open, and to the open project's series title (for `series`) or book title (for `audiobook`) followed by ` — AudioPie` when a project is open.

**RU:** Система ДОЛЖНА задавать заголовок каждого окна как `AudioPie`, когда в нём нет открытого проекта, и как название серии (для `series`) или книги (для `audiobook`) плюс ` — AudioPie`, когда проект открыт.

#### Scenario: Empty window title
- **WHEN** a window is showing the welcome screen
- **THEN** that window's title SHALL be `AudioPie`
- **RU:** Когда окно показывает welcome-экран, его заголовок ДОЛЖЕН быть `AudioPie`.

#### Scenario: Occupied window title
- **WHEN** a window has an open audiobook whose title is "The Hobbit"
- **THEN** that window's title SHALL be `The Hobbit — AudioPie`
- **RU:** Когда в окне открыта аудиокнига с названием «The Hobbit», заголовок окна ДОЛЖЕН быть `The Hobbit — AudioPie`.

### Requirement: Closing a window is not closing the app
The system SHALL clean up only that window's project session (including its working directory) when the window is closed. Closing the last window SHALL quit the app on Windows and Linux, and SHALL leave the process running on macOS until the user quits or a new window is created via Dock activate.

**RU:** Система ДОЛЖНА очищать только сессию проекта закрываемого окна (включая его рабочую директорию). Закрытие последнего окна ДОЛЖНО завершать приложение на Windows и Linux и ДОЛЖНО оставлять процесс живым на macOS, пока пользователь не выйдет или не создастся новое окно через activate в Dock.

#### Scenario: Close one of two windows
- **WHEN** two windows are open and the user closes one
- **THEN** the remaining window SHALL keep its project session, and the closed window's working directory SHALL be removed
- **RU:** Когда открыты два окна и пользователь закрывает одно, оставшееся окно ДОЛЖНО сохранить свою сессию проекта, а рабочая директория закрытого окна ДОЛЖНА быть удалена.

#### Scenario: Last window on macOS
- **WHEN** the user closes the last window on macOS
- **THEN** the app process SHALL remain running, and a subsequent Dock activate with zero windows SHALL create a new empty welcome window
- **RU:** Когда пользователь закрывает последнее окно на macOS, процесс приложения ДОЛЖЕН оставаться запущенным, а последующий activate из Dock при нуле окон ДОЛЖЕН создать новое пустое welcome-окно.

### Requirement: Single app instance
The system SHALL run as a single OS-level instance. A second launch of the executable while the app is already running SHALL focus an existing window and SHALL NOT start a second process that could open the same project file.

**RU:** Система ДОЛЖНА работать как один экземпляр на уровне ОС. Повторный запуск исполняемого файла, пока приложение уже запущено, ДОЛЖЕН сфокусировать существующее окно и НЕ ДОЛЖЕН стартовать второй процесс, который мог бы открыть тот же файл проекта.

#### Scenario: Second launch with no document arguments
- **WHEN** the user launches AudioPie again while it is already running, with no project file in the launch arguments
- **THEN** the existing process SHALL focus its last-focused window and SHALL NOT create a new window
- **RU:** Когда пользователь снова запускает AudioPie, пока оно уже запущено, без файла проекта в аргументах, существующий процесс ДОЛЖЕН сфокусировать последнее активное окно и НЕ ДОЛЖЕН создавать новое окно.
