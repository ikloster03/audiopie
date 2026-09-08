## ADDED Requirements

### Requirement: Packaged app registers the .audiopie file type
The packaged application SHALL declare `.audiopie` as a document type it edits, including a human-readable type name, on macOS, Windows, and Linux. Linux packaging SHALL include the MIME type `application/x-audiopie` associated with the `*.audiopie` glob. Display of that type in every Linux desktop environment under AppImage SHALL be treated as best-effort and SHALL NOT be required for macOS or Windows registration to ship.

**RU:** Упакованное приложение ДОЛЖНО объявлять `.audiopie` как тип документа, который оно редактирует, с человекочитаемым именем типа, на macOS, Windows и Linux. Linux-упаковка ДОЛЖНА включать MIME-тип `application/x-audiopie` для glob `*.audiopie`. Отображение этого типа во всех окружениях Linux под AppImage считается best-effort и НЕ ДОЛЖНО блокировать регистрацию на macOS и Windows.

#### Scenario: macOS document type is present in the app bundle
- **WHEN** a macOS build is packaged
- **THEN** the app bundle SHALL list `.audiopie` as a document type AudioPie handles (Editor)
- **RU:** Когда собирается macOS-сборка, бандл приложения ДОЛЖЕН перечислять `.audiopie` как тип документа, который обрабатывает AudioPie (Editor)

#### Scenario: Windows installer registers the extension
- **WHEN** the Windows NSIS build is installed
- **THEN** `.audiopie` SHALL be associated with AudioPie so Explorer can treat it as an AudioPie project
- **RU:** Когда установлен Windows NSIS-билд, `.audiopie` ДОЛЖЕН быть ассоциирован с AudioPie, чтобы Explorer считал его проектом AudioPie

#### Scenario: Linux AppImage ships MIME metadata
- **WHEN** the Linux AppImage is packaged
- **THEN** the image SHALL include MIME metadata for `application/x-audiopie` with glob `*.audiopie`
- **RU:** Когда упаковывается Linux AppImage, образ ДОЛЖЕН содержать MIME-метаданные для `application/x-audiopie` с glob `*.audiopie`

### Requirement: Document icon for .audiopie files
The packaged app SHALL supply a document icon for the `.audiopie` type derived from the existing application-icon artwork (same logo; not a distinct folded-document illustration in this change). After a successful OS association, `.audiopie` files SHALL be able to display that icon in the platform file manager.

**RU:** Упакованное приложение ДОЛЖНО поставлять иконку документа для типа `.audiopie`, полученную из существующего арта иконки приложения (тот же логотип; не отдельная иллюстрация «листа» в этом change). После успешной ассоциации ОС файлы `.audiopie` ДОЛЖНЫ иметь возможность отображать эту иконку в файловом менеджере платформы.

#### Scenario: Association uses app artwork
- **WHEN** electron-builder packages any of the three desktop targets with file associations
- **THEN** the `.audiopie` document icon SHALL be produced from the existing app-icon source artwork rather than a new unrelated image
- **RU:** Когда electron-builder упаковывает любой из трёх десктопных таргетов с файловыми ассоциациями, иконка документа `.audiopie` ДОЛЖНА быть получена из существующего исходника иконки приложения, а не из нового постороннего изображения

### Requirement: OS-supplied project path opens using Rule A
When the OS supplies a filesystem path to a `.audiopie` file (macOS `open-file`, first-launch command-line argument, or `second-instance` argument), the system SHALL open that project using Rule A: if the canonical path is already open, focus that window and do not extract again; else if a window has no project open (welcome), load the file into that window; else create a new window and load the file there. The system SHALL NOT replace an occupied editor in-place. Non-`.audiopie` arguments SHALL be ignored.

**RU:** Когда ОС передаёт путь к файлу `.audiopie` (macOS `open-file`, аргумент командной строки при первом запуске или `second-instance`), система ДОЛЖНА открыть этот проект по правилу A: если канонический путь уже открыт — сфокусировать это окно и не распаковывать снова; иначе если есть окно без проекта (welcome) — загрузить файл в него; иначе создать новое окно и загрузить файл туда. Система НЕ ДОЛЖНА подменять занятый редактор на месте. Аргументы не с расширением `.audiopie` ДОЛЖНЫ игнорироваться.

#### Scenario: Cold start by double-clicking a project
- **WHEN** the app is not running and the user opens a `.audiopie` file with the OS
- **THEN** the system SHALL start with one window that loads that project (not a leftover empty welcome plus a second window)
- **RU:** Когда приложение не запущено и пользователь открывает файл `.audiopie` через ОС, система ДОЛЖНА стартовать с одним окном, которое загружает этот проект (не пустой welcome плюс второе окно)

#### Scenario: Open an already-open file from the OS
- **WHEN** the user opens a `.audiopie` path that is already open in a window
- **THEN** the system SHALL show and focus that window and SHALL NOT extract or load the file into any other window
- **RU:** Когда пользователь открывает путь `.audiopie`, уже открытый в окне, система ДОЛЖНА показать и сфокусировать это окно и НЕ ДОЛЖНА распаковывать или загружать файл в какое-либо другое окно

#### Scenario: Reuse an empty welcome window
- **WHEN** the app is running with at least one welcome window (no project) and the user opens a `.audiopie` file that is not already open
- **THEN** the system SHALL load that file into a welcome window and SHALL NOT create an additional window
- **RU:** Когда приложение запущено хотя бы с одним welcome-окном (нет проекта) и пользователь открывает ещё не открытый `.audiopie`, система ДОЛЖНА загрузить этот файл в welcome-окно и НЕ ДОЛЖНА создавать дополнительное окно

#### Scenario: Occupied editors get a new window
- **WHEN** the app is running, every window already has a project open, and the user opens a `.audiopie` file that is not already open
- **THEN** the system SHALL create a new window and load that file there, and SHALL leave the existing windows' projects unchanged
- **RU:** Когда приложение запущено, в каждом окне уже открыт проект, и пользователь открывает ещё не открытый `.audiopie`, система ДОЛЖНА создать новое окно и загрузить файл туда и НЕ ДОЛЖНА менять проекты существующих окон

#### Scenario: Non-project arguments are ignored
- **WHEN** the process receives command-line arguments that are not `.audiopie` paths (flags, the executable path, or other files)
- **THEN** the system SHALL NOT attempt to open those arguments as projects
- **RU:** Когда процесс получает аргументы командной строки, которые не являются путями `.audiopie` (флаги, путь исполняемого файла или другие файлы), система НЕ ДОЛЖНА пытаться открыть эти аргументы как проекты

#### Scenario: Several project files in one launch
- **WHEN** the OS supplies more than one `.audiopie` path in a single launch or `second-instance` event
- **THEN** the system SHALL apply Rule A to each path in order
- **RU:** Когда ОС передаёт больше одного пути `.audiopie` в одном запуске или событии `second-instance`, система ДОЛЖНА применить правило A к каждому пути по порядку

### Requirement: OS-open uses the same load path as in-app open
An OS-supplied path that is not already open SHALL be loaded with the same extract/parse behavior as opening that path from the in-app dialog (`openPath` / `openProjectAtPath`), including container extract vs legacy JSON and the existing UI completeness check. A container extract started this way SHALL show the same blocking overlay as a dialog-chosen container. `focused-existing` SHALL NOT extract and SHALL NOT show the overlay.

**RU:** Путь от ОС, который ещё не открыт, ДОЛЖЕН загружаться тем же extract/parse поведением, что и открытие этого пути из диалога в приложении (`openPath` / `openProjectAtPath`), включая распаковку контейнера против legacy JSON и существующую проверку полноты UI. Распаковка контейнера, начатая так, ДОЛЖНА показывать тот же блокирующий оверлей, что и контейнер, выбранный в диалоге. `focused-existing` НЕ ДОЛЖЕН распаковывать и НЕ ДОЛЖЕН показывать оверлей.

#### Scenario: Container extract from OS-open shows the overlay
- **WHEN** the OS supplies a container-format `.audiopie` path that is not already open and extract begins in the target window
- **THEN** that window SHALL show the extract overlay until extract finishes or fails, same as after the open dialog
- **RU:** Когда ОС передаёт путь контейнерного `.audiopie`, который ещё не открыт, и в целевом окне начинается распаковка, это окно ДОЛЖНО показывать оверлей распаковки до успеха или ошибки — так же, как после диалога открытия

#### Scenario: Legacy JSON from OS-open skips the overlay
- **WHEN** the OS supplies a legacy plain-JSON `.audiopie` path that is not already open
- **THEN** the system SHALL load it without showing the extract overlay
- **RU:** Когда ОС передаёт путь старого plain-JSON `.audiopie`, который ещё не открыт, система ДОЛЖНА загрузить его без оверлея распаковки
