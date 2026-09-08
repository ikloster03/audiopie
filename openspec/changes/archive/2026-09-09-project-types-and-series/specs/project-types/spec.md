## ADDED Requirements

### Requirement: Project type distinction
The system SHALL support two project types: `audiobook` (a single audiobook with tracks, chapters, and metadata — the existing behavior) and `series` (a collection referencing multiple `audiobook` projects). Every project file SHALL declare its `type`.

**RU:** Система ДОЛЖНА поддерживать два типа проекта: `audiobook` (одна аудиокнига с треками, главами и метаданными — существующее поведение) и `series` (коллекция, ссылающаяся на несколько проектов типа `audiobook`). Каждый файл проекта ДОЛЖЕН объявлять свой `type`.

#### Scenario: Choose project type when creating new
- **WHEN** the user chooses "Create new" from the Project Manager screen
- **THEN** the system SHALL present a sub-screen with two tiles, "Audiobook" and "Series" (the top-level "Open Project" / "Create New" cards on the Project Manager are unchanged), and SHALL initialize the in-memory project with the `type` corresponding to the chosen tile; choosing "Audiobook" SHALL also offer the existing-template choice (see `project-persistence`) as a secondary option within the same sub-screen
- **RU:** Когда пользователь выбирает «Создать новый» на экране менеджера проектов, система ДОЛЖНА показать подэкран с двумя плитками «Аудиокнига» и «Серия» (верхнеуровневые карточки «Открыть проект» / «Создать новый» на экране менеджера проектов не меняются) и ДОЛЖНА инициализировать проект в памяти с `type`, соответствующим выбранной плитке; выбор «Аудиокнига» ДОЛЖЕН также предлагать существующий выбор шаблона (см. `project-persistence`) как вторичную опцию в том же подэкране.

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

### Requirement: Unified series management page
The system SHALL present a `series` project's editing view as a single page laid out in two columns: a left column containing the series' own metadata form (title, author, narrator, cover, description), and a right column containing the ordered list of member audiobooks. The system SHALL NOT render a separate persistent navigation column alongside the workspace sidebar for any project type.

**RU:** Система ДОЛЖНА представлять экран редактирования проекта `series` как единую страницу с двухколоночной раскладкой: левая колонка содержит собственную форму метаданных серии (название, автор, чтец, обложка, описание), правая колонка содержит упорядоченный список входящих аудиокниг. Система НЕ ДОЛЖНА отображать отдельную постоянную колонку навигации рядом с сайдбаром рабочего пространства ни для одного типа проекта.

#### Scenario: Opening a series project shows the unified page
- **WHEN** the user opens or creates a `type: 'series'` project
- **THEN** the system SHALL show the workspace sidebar with a single entry for the series page (in place of separate "Books" and "Metadata" entries) plus "Settings", and selecting it SHALL show the two-column layout described above
- **RU:** Когда пользователь открывает или создаёт проект `type: 'series'`, система ДОЛЖНА показать сайдбар рабочего пространства с единственным пунктом для страницы серии (вместо раздельных пунктов «Книги» и «Метаданные») плюс «Настройки», и выбор этого пункта ДОЛЖЕН показывать описанную выше двухколоночную раскладку.

### Requirement: Drag-and-drop reordering in the member list
The right column's member list SHALL support reordering member audiobooks via drag handles that are always visible on each row (no separate toggle mode), consistent with the pattern used by the chapter list. Dragging a row to a new position SHALL update the order of `audiobookPaths` and persist it to the series file. Clicking a row's body (outside the drag handle) SHALL open that member for editing.

**RU:** Список участников в правой колонке ДОЛЖЕН поддерживать изменение порядка через хендлы перетаскивания, всегда видимые на каждой строке (без отдельного режима-переключателя), по аналогии с паттерном, используемым в списке глав. Перетаскивание строки на новую позицию ДОЛЖНО обновлять порядок `audiobookPaths` и сохранять его в файл серии. Клик по телу строки (за пределами хендла) ДОЛЖЕН открывать этого участника для редактирования.

#### Scenario: Reorder series members via drag-and-drop
- **WHEN** the user drags a member row in the right column to a new position
- **THEN** the system SHALL update the order of `audiobookPaths` and persist it to the series file
- **RU:** Когда пользователь перетаскивает строку участника в правой колонке на новую позицию, система ДОЛЖНА обновить порядок `audiobookPaths` и сохранить его в файл серии.

### Requirement: Manual series-position number per member
Each row in the member list SHALL show an editable numeric field bound to that member audiobook's own `metadata.seriesIndex` field, independent of the member's position in the drag-ordered list. Editing this field SHALL update only that member's own project file and SHALL NOT modify the series file or the member's position in `audiobookPaths`.

**RU:** Каждая строка в списке участников ДОЛЖНА показывать редактируемое числовое поле, привязанное к собственному полю `metadata.seriesIndex` этой аудиокниги, независимое от позиции участника в списке, заданной перетаскиванием. Редактирование этого поля ДОЛЖНО обновлять только собственный файл проекта этого участника и НЕ ДОЛЖНО изменять файл серии или позицию участника в `audiobookPaths`.

#### Scenario: Set an arbitrary series number for a member
- **WHEN** the user types a number (e.g. `15`) into a member row's number field
- **THEN** the system SHALL write that value to `metadata.seriesIndex` in the member's own project file, leaving `audiobookPaths` and the list's drag order unchanged
- **RU:** Когда пользователь вводит число (например, `15`) в поле номера строки участника, система ДОЛЖНА записать это значение в `metadata.seriesIndex` собственного файла проекта участника, оставляя `audiobookPaths` и порядок перетаскивания списка без изменений.

### Requirement: Add a member via a menu offering attach-existing or create-new
The system SHALL provide a single "add book" control on the series page, shown as a floating action button pinned to the bottom of the page and visible only while the series page is the active view. Activating it SHALL open a menu with two options: attaching an existing audiobook project file, and creating a new audiobook project within this series.

**RU:** Система ДОЛЖНА предоставлять единый элемент управления «добавить книгу» на странице серии, отображаемый как плавающая кнопка, закреплённая внизу страницы и видимая только когда активна страница серии. Активация ДОЛЖНА открывать меню с двумя пунктами: прикрепление существующего файла проекта аудиокниги и создание новой аудиокниги в рамках этой серии.

#### Scenario: Add an audiobook to a series
- **WHEN** the user, while on a series page, chooses "Attach existing audiobook" from the add-book menu and selects an existing `.audiopie` audiobook file
- **THEN** the system SHALL append its path to `audiobookPaths` if it is not already present, and SHALL reject (with a message) adding a file whose `type` is not `audiobook`
- **RU:** Когда пользователь на странице серии выбирает «Прикрепить существующую аудиокнигу» из меню добавления книги и выбирает существующий `.audiopie`-файл аудиокниги, система ДОЛЖНА добавить его путь в `audiobookPaths`, если он ещё не присутствует, и ДОЛЖНА отклонить (с сообщением) добавление файла, чей `type` не равен `audiobook`.

#### Scenario: Open a series member for editing
- **WHEN** the user clicks a member audiobook listed in a `series` project
- **THEN** the system SHALL open that referenced `.audiopie` file the same way as opening it directly from the Project Manager
- **RU:** Когда пользователь нажимает на участника-аудиокнигу, перечисленного в проекте `series`, система ДОЛЖНА открыть указанный `.audiopie`-файл так же, как при открытии напрямую из менеджера проектов.

#### Scenario: Referenced audiobook file is missing
- **WHEN** the system attempts to resolve a member path in `audiobookPaths` that no longer exists on disk
- **THEN** the system SHALL display that member as "missing" in the series editor instead of failing to render the whole series, and SHALL NOT remove it from `audiobookPaths` automatically
- **RU:** Когда система пытается разрешить путь участника в `audiobookPaths`, который больше не существует на диске, она ДОЛЖНА отобразить этого участника как «отсутствует» в редакторе серии вместо сбоя отрисовки всей серии, и НЕ ДОЛЖНА автоматически удалять его из `audiobookPaths`.

### Requirement: Create a new audiobook within a series
When the user chooses "Create new audiobook in this series" from the add-book menu, the system SHALL open a new, blank `audiobook` project pre-filled with the series' own author, narrator, and cover, keeping the series as the active session context. The new book's path SHALL NOT be added to the series' `audiobookPaths` until the book is saved for the first time; on that first successful save, the system SHALL append the book's path to the series' `audiobookPaths` and persist the series file.

**RU:** Когда пользователь выбирает «Создать новую аудиокнигу в этой серии» из меню добавления книги, система ДОЛЖНА открыть новый пустой проект `audiobook`, предзаполненный собственным автором, чтецом и обложкой серии, сохраняя серию как активный контекст сессии. Путь новой книги НЕ ДОЛЖЕН добавляться в `audiobookPaths` серии до первого сохранения книги; при этом первом успешном сохранении система ДОЛЖНА добавить путь книги в `audiobookPaths` серии и сохранить файл серии.

#### Scenario: Create and save a new book as part of a series
- **WHEN** the user creates a new audiobook via "Create new audiobook in this series" and later saves it for the first time
- **THEN** the system SHALL append the newly saved path to the series' `audiobookPaths` and persist the series file, in addition to saving the audiobook's own project file
- **RU:** Когда пользователь создаёт новую аудиокнигу через «Создать новую аудиокнигу в этой серии» и позже сохраняет её в первый раз, система ДОЛЖНА добавить только что сохранённый путь в `audiobookPaths` серии и сохранить файл серии, в дополнение к сохранению собственного файла проекта аудиокниги.

### Requirement: Remove a book from its series, and return to the series, via its own metadata
When an `audiobook` was opened via "Open a series member" or created via "Create new audiobook in this series," the system SHALL show, within that audiobook's own metadata editing view, an indicator that it belongs to that series, a control to remove it from the series, and a control to return to the series' own page. The removal control SHALL be independent of the audiobook's own free-text `series`/`seriesIndex` metadata fields, which remain separately editable.

**RU:** Когда `audiobook` была открыта через «Открыть участника серии» или создана через «Создать новую аудиокнигу в этой серии», система ДОЛЖНА показывать в собственном представлении редактирования метаданных этой аудиокниги индикатор принадлежности к серии, элемент управления для удаления из серии и элемент управления для возврата на страницу серии. Элемент управления удалением ДОЛЖЕН быть независим от собственных текстовых полей метаданных аудиокниги `series`/`seriesIndex`, которые остаются отдельно редактируемыми.

#### Scenario: Remove the currently open book from its series
- **WHEN** the user clicks "Remove from series" in the metadata view of an audiobook opened via a series
- **THEN** the system SHALL remove that audiobook's path from the series file's `audiobookPaths`, and SHALL NOT modify or delete the audiobook's own project file
- **RU:** Когда пользователь нажимает «Убрать из серии» в представлении метаданных аудиокниги, открытой через серию, система ДОЛЖНА удалить путь этой аудиокниги из `audiobookPaths` файла серии, и НЕ ДОЛЖНА изменять или удалять собственный файл проекта аудиокниги.

#### Scenario: Return to the series page from an open member
- **WHEN** the user clicks "Back to series" in the metadata view of an audiobook opened via a series
- **THEN** the system SHALL open the series project at the active series context's path and show its unified series page
- **RU:** Когда пользователь нажимает «К серии» в представлении метаданных аудиокниги, открытой через серию, система ДОЛЖНА открыть проект серии по пути активного контекста серии и показать его единую страницу серии.
