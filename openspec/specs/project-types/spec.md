# project-types Specification

## Purpose
Projects are either a single audiobook or a multi-book series inside the same `.audiopie` container. Type is chosen at creation (with an immediate save path) and can later be changed from Settings. A series is edited on one unified page: shared metadata plus an ordered list of member books.

**RU:** Проект — это либо одна аудиокнига, либо серия из нескольких книг внутри одного контейнера `.audiopie`. Тип выбирается при создании (с немедленным путём сохранения) и позже может быть изменён в настройках. Серия редактируется на одной странице: общие метаданные плюс упорядоченный список книг.

## Requirements
### Requirement: Choose a project type and save location before editing
When the user chooses "Create new" from the Project Manager screen, the system SHALL present a choice between "Audiobook" and "Series", then SHALL require the user to pick a save location via a native save dialog before the editor opens. The system SHALL write a minimal container to that location immediately (one empty book for "Audiobook"; zero books for "Series") and open it as the active working project.

**RU:** Когда пользователь выбирает «Создать новый» на экране менеджера проектов, система ДОЛЖНА предложить выбор между «Аудиокнига» и «Серия», затем ДОЛЖНА потребовать выбрать место сохранения через нативный диалог до открытия редактора. Система ДОЛЖНА немедленно записать минимальный контейнер по этому пути (одна пустая книга для «Аудиокнига»; ноль книг для «Серия») и открыть его как активный рабочий проект.

#### Scenario: Create a new audiobook
- **WHEN** the user picks "Audiobook" and selects a save location
- **THEN** the system SHALL create a `type: 'audiobook'` container at that location with one empty book, then open it for editing
- **RU:** Когда пользователь выбирает «Аудиокнига» и указывает место сохранения, система ДОЛЖНА создать контейнер `type: 'audiobook'` по этому пути с одной пустой книгой и открыть его для редактирования.

#### Scenario: Create a new series
- **WHEN** the user picks "Series" and selects a save location
- **THEN** the system SHALL create a `type: 'series'` container at that location with an empty `bookOrder` and default series metadata, then open its unified series management page
- **RU:** Когда пользователь выбирает «Серия» и указывает место сохранения, система ДОЛЖНА создать контейнер `type: 'series'` по этому пути с пустым `bookOrder` и метаданными серии по умолчанию, затем открыть его единую страницу управления серией.

#### Scenario: Cancelling the save dialog aborts creation
- **WHEN** the user cancels the save-location dialog after choosing a project type
- **THEN** the system SHALL NOT create any file and SHALL return to the Project Manager screen
- **RU:** Когда пользователь отменяет диалог выбора места сохранения после выбора типа проекта, система НЕ ДОЛЖНА создавать файл и ДОЛЖНА вернуться на экран менеджера проектов.

### Requirement: Create a new audiobook from an existing project as a template
When creating a new "Audiobook", the system SHALL offer an option to seed the new book's metadata (author, narrator, genre, publisher, series, cover) from an existing `.audiopie` file's first book, while starting with empty tracks. Choosing a `type: 'series'` file as a template SHALL be rejected with an explanatory message.

**RU:** При создании новой «Аудиокниги» система ДОЛЖНА предлагать вариант заполнить метаданные новой книги (автор, чтец, жанр, издатель, серия, обложка) из первой книги существующего `.audiopie`-файла, начав при этом с пустых треков. Выбор файла `type: 'series'` в качестве шаблона ДОЛЖЕН быть отклонён с поясняющим сообщением.

#### Scenario: Start from an existing project's metadata
- **WHEN** the user picks "Start from existing project…" and selects an `.audiobook`-type `.audiopie` file
- **THEN** the system SHALL prefill the new (empty-tracks) book's metadata fields from that file's book, leaving the new container's own save location as previously chosen
- **RU:** Когда пользователь выбирает «Начать на основе существующего проекта…» и указывает файл типа «аудиокнига», система ДОЛЖНА предзаполнить поля метаданных новой книги (с пустыми треками) из книги выбранного файла, оставив собственное место сохранения нового контейнера без изменений.

#### Scenario: Template file is a series
- **WHEN** the user selects a `type: 'series'` file as the template
- **THEN** the system SHALL reject the selection and show a message explaining that only audiobook files can be used as a template
- **RU:** Когда пользователь выбирает файл `type: 'series'` в качестве шаблона, система ДОЛЖНА отклонить выбор и показать сообщение о том, что шаблоном может быть только файл аудиокниги.

### Requirement: Unified series management page
The system SHALL present a `type: 'series'` project's editing surface as a single page with two columns: the series' own shared metadata form (title, author, narrator, description — no cover, since a series has no cover of its own) on one side, and the ordered list of its member books on the other. There SHALL be no separate navigation rail or split tabs for a series project.

**RU:** Система ДОЛЖНА представлять поверхность редактирования проекта `type: 'series'` единой страницей с двумя колонками: форма общих метаданных серии (название, автор, чтец, описание — без обложки, так как у серии нет собственной обложки) с одной стороны и упорядоченный список входящих книг с другой. Отдельной панели навигации или раздельных вкладок для проекта серии быть не должно.

#### Scenario: Opening a series project shows the unified page
- **WHEN** the user opens or creates a `type: 'series'` project
- **THEN** the system SHALL display the series metadata form and the member book list together on one page, and the workspace sidebar SHALL show a single entry for this page plus Settings
- **RU:** Когда пользователь открывает или создаёт проект `type: 'series'`, система ДОЛЖНА показать форму метаданных серии и список книг вместе на одной странице, а боковая панель рабочего пространства ДОЛЖНА показывать один пункт для этой страницы плюс «Настройки».

#### Scenario: Series list represents itself via member covers, not a series cover
- **WHEN** the series management page or any series summary is rendered
- **THEN** the system SHALL use its member books' own covers (e.g. the first book in `bookOrder`) for any visual representation of the series, and SHALL NOT show a dedicated series-level cover picker
- **RU:** Когда отрисовывается страница управления серией или любая её сводка, система ДОЛЖНА использовать собственные обложки книг-участников (например, первой книги в `bookOrder`) для любого визуального представления серии и НЕ ДОЛЖНА показывать отдельный выбор обложки уровня серии.

### Requirement: Reorder member books via drag-and-drop
The system SHALL let the user reorder a series' member books by dragging a row's always-visible drag handle, persisting the new order to `bookOrder` on drop. Reordering SHALL NOT rename any book's storage folder and SHALL NOT alter any book's `metadata.seriesIndex`.

**RU:** Система ДОЛЖНА позволять переупорядочивать книги серии перетаскиванием за постоянно видимый хендл, сохраняя новый порядок в `bookOrder` при отпускании. Переупорядочивание НЕ ДОЛЖНО переименовывать папку хранения книги и НЕ ДОЛЖНО изменять `metadata.seriesIndex` книги.

#### Scenario: Drag a book to a new position
- **WHEN** the user drags a member book row to a new position in the list
- **THEN** the system SHALL persist the new `bookOrder` and re-render the list in that order, leaving every book's `id` and `metadata.seriesIndex` unchanged
- **RU:** Когда пользователь перетаскивает строку книги на новую позицию, система ДОЛЖНА сохранить новый `bookOrder` и перерисовать список в этом порядке, оставив `id` и `metadata.seriesIndex` каждой книги без изменений.

### Requirement: Manual per-book series numbering, independent of list order
Each member book row SHALL show an editable series-position number bound to that book's own `metadata.seriesIndex`, distinct from and independent of its position in the drag-ordered `bookOrder`. Editing this number SHALL update only that book's own `index.json`.

**RU:** Каждая строка книги-участника ДОЛЖНА показывать редактируемый номер позиции в серии, привязанный к собственному `metadata.seriesIndex` этой книги, отдельный от и независимый от её позиции в упорядоченном перетаскиванием `bookOrder`. Редактирование этого номера ДОЛЖНО обновлять только собственный `index.json` этой книги.

#### Scenario: Editing a book's series number
- **WHEN** the user types a new value into a member book row's series-number field
- **THEN** the system SHALL update that book's `metadata.seriesIndex` in its own `books/<id>/index.json` and SHALL NOT change `bookOrder`
- **RU:** Когда пользователь вводит новое значение в поле номера серии строки книги, система ДОЛЖНА обновить `metadata.seriesIndex` этой книги в её собственном `books/<id>/index.json` и НЕ ДОЛЖНА менять `bookOrder`.

### Requirement: Add a book to a series
The system SHALL present a floating "Add book" action on the series management page (shown in place of the "Build" action, which does not apply to a series) offering two ways to add a member: "Create new book" (a blank book pre-filled with the series' shared author/narrator, appended to `bookOrder` immediately) and "Import from existing project file" (pick an existing `type: 'audiobook'` `.audiopie` file; its book folder — index.json, tracks, and cover — is copied into a newly created `books/<bookId>/` within the series' working directory).

**RU:** Система ДОЛЖНА показывать на странице управления серией плавающее действие «Добавить книгу» (вместо действия «Собрать», неприменимого к серии), предлагающее два способа добавить участника: «Создать новую книгу» (пустая книга, предзаполненная общими автором/чтецом серии, немедленно добавляется в `bookOrder`) и «Импортировать из существующего файла проекта» (выбрать существующий файл `.audiopie` типа «аудиокнига»; его папка книги — index.json, треки и обложка — копируется в новую папку `books/<bookId>/` внутри рабочей директории серии).

#### Scenario: Create a new book within a series
- **WHEN** the user chooses "Create new book" from the "Add book" menu
- **THEN** the system SHALL create a new, empty book folder (metadata seeded from the series' author/narrator), append its id to `bookOrder` immediately, and switch the active editing view to that book
- **RU:** Когда пользователь выбирает «Создать новую книгу» в меню «Добавить книгу», система ДОЛЖНА создать новую пустую папку книги (с метаданными, заполненными из автора/чтеца серии), немедленно добавить её id в `bookOrder` и переключить активный вид редактирования на эту книгу.

#### Scenario: Import an existing audiobook file as a new member
- **WHEN** the user chooses "Import from existing project file" and selects a `type: 'audiobook'` `.audiopie` file
- **THEN** the system SHALL copy that file's book folder (index.json, tracks, cover) into a new `books/<bookId>/` within the series' working directory and append its id to `bookOrder`
- **RU:** Когда пользователь выбирает «Импортировать из существующего файла проекта» и указывает файл `.audiopie` типа «аудиокнига», система ДОЛЖНА скопировать папку книги этого файла (index.json, треки, обложка) в новую папку `books/<bookId>/` внутри рабочей директории серии и добавить её id в `bookOrder`.

#### Scenario: Importing a series file is rejected
- **WHEN** the user selects a `type: 'series'` file via "Import from existing project file"
- **THEN** the system SHALL reject the selection and show a message explaining that only individual audiobook files can be imported
- **RU:** Когда пользователь выбирает файл `type: 'series'` через «Импортировать из существующего файла проекта», система ДОЛЖНА отклонить выбор и показать сообщение о том, что импортировать можно только файлы отдельных аудиокниг.

### Requirement: Remove a book from a series
The system SHALL let the user remove a member book from a series, permanently deleting that book's folder from the container's working directory once the removal is saved. Before deleting, the system SHALL warn the user that this is destructive and SHALL offer "Extract as standalone audiobook file" as an alternative first step.

**RU:** Система ДОЛЖНА позволять удалить книгу-участника из серии, безвозвратно удаляя папку этой книги из рабочей директории контейнера после сохранения удаления. Перед удалением система ДОЛЖНА предупредить пользователя о деструктивности действия и ДОЛЖНА предложить «Извлечь как отдельный файл аудиокниги» в качестве альтернативного первого шага.

#### Scenario: Confirming removal deletes the book
- **WHEN** the user confirms removing a member book from the series
- **THEN** the system SHALL remove its id from `bookOrder` and delete its folder from the working directory the next time the series is saved
- **RU:** Когда пользователь подтверждает удаление книги-участника из серии, система ДОЛЖНА удалить её id из `bookOrder` и удалить её папку из рабочей директории при следующем сохранении серии.

#### Scenario: Extracting before removal preserves the book
- **WHEN** the user chooses "Extract as standalone audiobook file" before removing a book
- **THEN** the system SHALL prompt for a save location and write that book's folder as a new `type: 'audiobook'` container there before proceeding with removal from the series
- **RU:** Когда пользователь выбирает «Извлечь как отдельный файл аудиокниги» перед удалением книги, система ДОЛЖНА запросить место сохранения и записать папку этой книги как новый контейнер `type: 'audiobook'`, прежде чем продолжить удаление из серии.

### Requirement: Series membership context while editing a member book
When editing a book that belongs to an open series container, the metadata editing view SHALL show a "Part of series: `<title>`" indicator with a "Back to series" action that switches the active editing view back to the series management page without closing or reopening the container.

**RU:** При редактировании книги, входящей в открытый контейнер серии, экран редактирования метаданных ДОЛЖЕН показывать индикатор «Входит в серию: `<название>`» с действием «К серии», которое переключает активный вид редактирования обратно на страницу управления серией без закрытия или повторного открытия контейнера.

#### Scenario: Viewing a series member's metadata
- **WHEN** the active book being edited is one of an open series container's member books
- **THEN** the metadata view SHALL show the series title and a "Back to series" button
- **RU:** Когда активно редактируемая книга — одна из книг-участников открытого контейнера серии, экран метаданных ДОЛЖЕН показать название серии и кнопку «К серии».

#### Scenario: Returning to the series page
- **WHEN** the user clicks "Back to series"
- **THEN** the system SHALL switch the active editing view to the series management page, keeping the same open container and working directory
- **RU:** Когда пользователь нажимает «К серии», система ДОЛЖНА переключить активный вид редактирования на страницу управления серией, сохранив тот же открытый контейнер и рабочую директорию.

### Requirement: Change project type from a Settings danger zone
The open project's Settings view SHALL include a "Danger zone" section letting the user switch the project's `type` between "Audiobook" and "Series" at any time, without restructuring any `books/<id>/` folder (see `project-container-format` capability — both types share the same on-disk book-folder shape). Switching `audiobook → series` SHALL apply immediately without confirmation. Switching `series → audiobook` SHALL, if the series has more than one book, first show a confirmation modal stating that every book except the first (by current `bookOrder` position) will be permanently deleted; only on confirmation SHALL the system proceed. If the series has zero books when switching to "Audiobook", the system SHALL first create one empty book (as in normal audiobook creation) before completing the switch.

**RU:** Настройки открытого проекта ДОЛЖНЫ включать секцию «Опасная зона», позволяющую в любой момент переключить `type` проекта между «Аудиокнига» и «Серия» без реструктуризации папок `books/<id>/` (обе структуры идентичны на диске — см. capability `project-container-format`). Переключение `audiobook → series` ДОЛЖНО применяться немедленно, без подтверждения. Переключение `series → audiobook`, если в серии больше одной книги, ДОЛЖНО сначала показать модальное окно подтверждения, сообщающее, что все книги, кроме первой (по текущей позиции в `bookOrder`), будут безвозвратно удалены; система ДОЛЖНА продолжить только по подтверждению. Если при переключении на «Аудиокнига» в серии ноль книг, система ДОЛЖНА сначала создать одну пустую книгу (как при обычном создании аудиокниги), прежде чем завершить переключение.

#### Scenario: Switching audiobook to series
- **WHEN** the user switches project type from "Audiobook" to "Series" in the Settings danger zone
- **THEN** the system SHALL set `type: 'series'`, initialize empty series metadata, keep the existing single book as `bookOrder[0]` unchanged, and show the unified series management page
- **RU:** Когда пользователь переключает тип проекта с «Аудиокнига» на «Серия» в опасной зоне настроек, система ДОЛЖНА установить `type: 'series'`, инициализировать пустые метаданные серии, оставить существующую единственную книгу как `bookOrder[0]` без изменений и показать единую страницу управления серией.

#### Scenario: Switching series to audiobook with multiple books
- **WHEN** the user switches project type from "Series" to "Audiobook" while more than one book exists
- **THEN** the system SHALL show a confirmation modal naming how many books will be permanently deleted, and SHALL only delete every book folder except `bookOrder[0]`, set `type: 'audiobook'`, and clear `series` to `null` if the user confirms
- **RU:** Когда пользователь переключает тип проекта с «Серия» на «Аудиокнига», пока существует больше одной книги, система ДОЛЖНА показать модальное окно подтверждения с указанием числа книг, которые будут безвозвратно удалены, и ДОЛЖНА удалить все папки книг кроме `bookOrder[0]`, установить `type: 'audiobook'` и очистить `series` до `null` только при подтверждении пользователя.

#### Scenario: Cancelling the destructive switch
- **WHEN** the user cancels the confirmation modal for switching "Series" to "Audiobook"
- **THEN** the system SHALL leave the project's `type`, `bookOrder`, and all book folders unchanged
- **RU:** Когда пользователь отменяет модальное окно подтверждения переключения «Серия» на «Аудиокнига», система ДОЛЖНА оставить `type`, `bookOrder` и все папки книг проекта без изменений.

#### Scenario: Switching series to audiobook with zero books
- **WHEN** the user switches project type from "Series" to "Audiobook" while the series has zero books
- **THEN** the system SHALL create one empty book, set it as `bookOrder[0]`, set `type: 'audiobook'`, and clear `series` to `null`, without showing the deletion-warning modal
- **RU:** Когда пользователь переключает тип проекта с «Серия» на «Аудиокнига», пока в серии ноль книг, система ДОЛЖНА создать одну пустую книгу, установить её как `bookOrder[0]`, установить `type: 'audiobook'` и очистить `series` до `null`, без показа модалки предупреждения об удалении.
