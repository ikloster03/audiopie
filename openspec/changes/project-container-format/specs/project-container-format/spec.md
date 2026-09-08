## ADDED Requirements

### Requirement: Container file structure
The system SHALL persist a project as a ZIP archive with the `.audiopie` extension, using the `STORE` (uncompressed) method for every entry, containing a root `index.json` file and a `books/<bookId>/` directory per book. Each book directory SHALL contain its own `index.json` (that book's metadata and tracks), its chapter audio as MP3 files, and an optional cover image file referenced by that book's own `metadata.coverFile`. There SHALL be no shared top-level `covers/` directory and no series-level cover asset.

**RU:** Система ДОЛЖНА сохранять проект как ZIP-архив с расширением `.audiopie`, используя метод `STORE` (без сжатия) для всех записей, содержащий корневой `index.json` и директорию `books/<bookId>/` на каждую книгу. Каждая директория книги ДОЛЖНА содержать собственный `index.json` (метаданные и треки этой книги), её главы-MP3 и опциональный файл обложки, на который ссылается собственное поле `metadata.coverFile` этой книги. Общей директории `covers/` на верхнем уровне и обложки уровня серии быть не должно.

#### Scenario: Save writes a ZIP container
- **WHEN** the user saves a project (new or existing)
- **THEN** the system SHALL write a ZIP archive at the target path containing the root `index.json` and one `books/<bookId>/` directory per book, each with its own `index.json`, chapter MP3s, and optional cover file, using the `STORE` method
- **RU:** Когда пользователь сохраняет проект (новый или существующий), система ДОЛЖНА записать ZIP-архив по целевому пути, содержащий корневой `index.json` и по одной директории `books/<bookId>/` на книгу с её собственным `index.json`, главами-MP3 и опциональным файлом обложки, методом `STORE`.

#### Scenario: Save appends extension when missing
- **WHEN** the user saves a project and the chosen/target path does not end with `.audiopie`
- **THEN** the system SHALL append `.audiopie` to the file name before writing
- **RU:** Когда пользователь сохраняет проект, а выбранный/целевой путь не заканчивается на `.audiopie`, система ДОЛЖНА добавить `.audiopie` к имени файла перед записью.

### Requirement: Root index.json holds only container-level facts
The system SHALL structure the root `index.json` as `{ version: 2, type: 'audiobook' | 'series', series: SeriesMetadata | null, bookOrder: string[] }`, where `SeriesMetadata` is `{ title, author?, narrator?, description? }` (no cover). The root `index.json` SHALL NOT contain per-book metadata or track lists — its size SHALL depend only on the number of books, not on how many chapters each book has. A `type: 'audiobook'` container's `bookOrder` SHALL contain exactly one id and its `series` SHALL be `null`. A `type: 'series'` container's `bookOrder` MAY contain any number of ids (including zero, for a newly created series with no books attached yet) and its `series` SHALL be a non-null `SeriesMetadata` object.

**RU:** Система ДОЛЖНА структурировать корневой `index.json` как `{ version: 2, type: 'audiobook' | 'series', series: SeriesMetadata | null, bookOrder: string[] }`, где `SeriesMetadata` — `{ title, author?, narrator?, description? }` (без обложки). Корневой `index.json` НЕ ДОЛЖЕН содержать метаданные или списки треков отдельных книг — его размер ДОЛЖЕН зависеть только от числа книг, не от числа глав в каждой. Контейнер `type: 'audiobook'` ДОЛЖЕН иметь ровно один id в `bookOrder` и `series: null`. Контейнер `type: 'series'` МОЖЕТ иметь любое число id в `bookOrder` (включая ноль) и ненулевой объект `series`.

#### Scenario: Reading an audiobook container's root manifest
- **WHEN** the system reads a container with `type: 'audiobook'`
- **THEN** the system SHALL treat `bookOrder[0]` as the id of the project's single book and SHALL ignore any `series` value if unexpectedly non-null
- **RU:** Когда система читает контейнер `type: 'audiobook'`, она ДОЛЖНА использовать `bookOrder[0]` как id единственной книги проекта и игнорировать значение `series`, если оно неожиданно не равно null.

#### Scenario: Reading a series container's root manifest
- **WHEN** the system reads a container with `type: 'series'`
- **THEN** the system SHALL expose the root `series` metadata separately from each book, and SHALL treat `bookOrder` as the authoritative display order of member books
- **RU:** Когда система читает контейнер `type: 'series'`, она ДОЛЖНА показывать метаданные `series` отдельно от каждой книги и считать `bookOrder` авторитетным порядком отображения книг-участников.

### Requirement: Each book folder has its own self-contained index.json
The system SHALL store each book's metadata and track list in its own `books/<bookId>/index.json`, structured as `{ metadata: BookMetadata, tracks: { file: string, displayTitle: string, durationMs: number }[] }`, where `BookMetadata` MAY include a `coverFile` field naming a cover image file located in the same `books/<bookId>/` directory. This file SHALL be sufficient on its own (together with its sibling MP3s and cover) to describe that book without reading the root `index.json` or any other book's files.

**RU:** Система ДОЛЖНА хранить метаданные и список треков каждой книги в её собственном `books/<bookId>/index.json`, структурированном как `{ metadata: BookMetadata, tracks: [...] }`, где `BookMetadata` МОЖЕТ включать поле `coverFile` с именем файла обложки в той же директории `books/<bookId>/`. Этого файла (вместе с соседними MP3 и обложкой) ДОЛЖНО быть достаточно, чтобы полностью описать книгу без чтения корневого `index.json` или файлов других книг.

#### Scenario: A book folder is self-describing
- **WHEN** a book folder's contents are copied out of a container in isolation (e.g. for extract/import)
- **THEN** its own `index.json`, MP3 files, and optional cover file SHALL fully describe that book with no dependency on the root `index.json` or any other book folder
- **RU:** Когда содержимое папки книги копируется из контейнера отдельно (например, для extract/import), её собственный `index.json`, MP3-файлы и опциональный файл обложки ДОЛЖНЫ полностью описывать эту книгу без зависимости от корневого `index.json` или других папок книг.

### Requirement: Chapters derived from track order, not stored separately
The system SHALL derive each book's chapter list from its own `tracks` array — one chapter per track, in array order, with `startMs`/`endMs` computed sequentially from track durations — rather than persisting a separate chapter list anywhere.

**RU:** Система ДОЛЖНА выводить список глав книги из её собственного массива `tracks` — одна глава на трек, в порядке массива, с `startMs`/`endMs`, вычисляемыми последовательно из длительностей треков — вместо хранения отдельного списка глав.

#### Scenario: Opening a book computes chapters from tracks
- **WHEN** a book with a non-empty `tracks` array is opened for editing
- **THEN** the system SHALL compute its chapter list as one chapter per track, titled from `displayTitle`, with contiguous `startMs`/`endMs` ranges
- **RU:** Когда книга с непустым массивом `tracks` открывается для редактирования, система ДОЛЖНА вычислить список глав как одну главу на трек с названием из `displayTitle` и смежными диапазонами `startMs`/`endMs`.

### Requirement: Book folder identity is stable and independent of order
The system SHALL assign each book an opaque, stable `id` (used as its `books/<id>/` directory name) at creation time. This `id` SHALL NOT change when the book's position in `bookOrder` changes (reordering) or when its `metadata.seriesIndex` is edited, and SHALL NOT be reused by a different book even after the original book is removed.

**RU:** Система ДОЛЖНА назначать каждой книге непрозрачный стабильный `id` (используемый как имя директории `books/<id>/`) при создании. Этот `id` НЕ ДОЛЖЕН меняться при изменении позиции книги в `bookOrder` (переупорядочивание) или при редактировании её `metadata.seriesIndex`, и НЕ ДОЛЖЕН повторно использоваться другой книгой даже после удаления исходной.

#### Scenario: Reordering books keeps folder ids stable
- **WHEN** the user reorders books within a series
- **THEN** the system SHALL update only the order of ids in `bookOrder` and SHALL NOT rename any `books/<id>/` directory
- **RU:** Когда пользователь переупорядочивает книги в серии, система ДОЛЖНА изменить только порядок id в `bookOrder` и НЕ ДОЛЖНА переименовывать директории `books/<id>/`.

### Requirement: Working-directory editing lifecycle
The system SHALL extract a container's ZIP contents into a per-session working directory when a project is opened, perform all edits (track add/remove, metadata changes, book add/remove) against real files in that working directory, and re-create the ZIP archive from the working directory's current contents when the project is saved.

**RU:** Система ДОЛЖНА распаковывать содержимое ZIP-контейнера во временную рабочую директорию сессии при открытии проекта, выполнять все правки (добавление/удаление треков, изменения метаданных, добавление/удаление книг) над реальными файлами в этой директории, и заново собирать ZIP-архив из текущего содержимого рабочей директории при сохранении.

#### Scenario: Open extracts to a working directory
- **WHEN** the user opens a container-format `.audiopie` file
- **THEN** the system SHALL extract its contents to a new per-session working directory before the project becomes editable
- **RU:** Когда пользователь открывает `.audiopie`-файл в формате контейнера, система ДОЛЖНА распаковать его содержимое во временную рабочую директорию сессии перед тем, как проект станет доступен для редактирования.

#### Scenario: Save re-packages the working directory
- **WHEN** the user saves an open project
- **THEN** the system SHALL create (or overwrite) the ZIP archive at the target path from the current contents of that project's working directory
- **RU:** Когда пользователь сохраняет открытый проект, система ДОЛЖНА создать (или перезаписать) ZIP-архив по целевому пути из текущего содержимого рабочей директории этого проекта.

#### Scenario: Closing a project cleans up its working directory
- **WHEN** the user closes a project, opens a different project, or quits the application
- **THEN** the system SHALL delete the working directory associated with the previously open project
- **RU:** Когда пользователь закрывает проект, открывает другой проект или завершает приложение, система ДОЛЖНА удалить рабочую директорию, связанную с ранее открытым проектом.

### Requirement: Legacy plain-JSON files remain openable and upgrade on first save
The system SHALL detect whether a `.audiopie` file is a ZIP container or a legacy plain-JSON file by inspecting its content (not by trusting the file extension), SHALL open a legacy JSON file exactly as before (tracks keep referencing their original external paths, no files are copied), and SHALL transparently upgrade it to a ZIP container the first time it is saved, copying every referenced external track file into a newly created working directory (as that book's `books/<bookId>/` folder) before writing the new container.

**RU:** Система ДОЛЖНА определять, является ли `.audiopie`-файл ZIP-контейнером или старым plain-JSON-файлом, по содержимому (не по расширению), ДОЛЖНА открывать старый JSON-файл как раньше (треки продолжают ссылаться на исходные внешние пути, ничего не копируется), и ДОЛЖНА прозрачно обновить его до ZIP-контейнера при первом сохранении, скопировав каждый внешний файл трека в новую рабочую директорию (как папку `books/<bookId>/` этой книги) перед записью нового контейнера.

#### Scenario: Opening a legacy file does not copy anything
- **WHEN** the user opens a plain-JSON `.audiopie` file saved by an older version of the app
- **THEN** the system SHALL load its tracks/chapters/metadata as before, keeping `tracks[].path` pointed at their original external locations, and SHALL NOT copy any audio file during this open
- **RU:** Когда пользователь открывает plain-JSON `.audiopie`-файл, сохранённый старой версией приложения, система ДОЛЖНА загрузить треки/главы/метаданные как раньше, оставив `tracks[].path` указывающими на исходные внешние расположения, и НЕ ДОЛЖНА копировать ни один аудиофайл при этом открытии.

#### Scenario: First save of a legacy project upgrades it
- **WHEN** the user saves a project that was opened from a legacy plain-JSON file, for the first time since opening it
- **THEN** the system SHALL copy every one of its tracks' external files into a new working directory's `books/<bookId>/`, write that book's own `index.json` and a root `index.json` (`version: 2`, `type: 'audiobook'`, `bookOrder: [bookId]`), and write the result as a ZIP container to the target path
- **RU:** Когда пользователь впервые с момента открытия сохраняет проект, открытый из старого plain-JSON-файла, система ДОЛЖНА скопировать все внешние файлы его треков в новую рабочую директорию `books/<bookId>/`, записать собственный `index.json` этой книги и корневой `index.json` (`version: 2`, `type: 'audiobook'`, `bookOrder: [bookId]`), и сохранить результат как ZIP-контейнер по целевому пути.

### Requirement: New tracks are copied into the working directory immediately
The system SHALL copy a newly added track's source file into the current book's `books/<bookId>/` directory within the working directory at the moment it is added, rather than only recording its external path.

**RU:** Система ДОЛЖНА копировать файл-источник вновь добавленного трека в директорию `books/<bookId>/` текущей книги внутри рабочей директории в момент добавления, а не только запоминать его внешний путь.

#### Scenario: Adding a track copies it into the project
- **WHEN** the user adds an MP3 file to a project that is already in container form (a new project, or a legacy project already opened and previously saved once this session)
- **THEN** the system SHALL copy that file into the current book's working-directory folder immediately, assign it a stable filename, probe its duration, and append it to that book's own `tracks` array
- **RU:** Когда пользователь добавляет MP3-файл в проект, уже находящийся в форме контейнера, система ДОЛЖНА немедленно скопировать этот файл в папку текущей книги в рабочей директории, назначить стабильное имя файла, определить длительность и добавить его в собственный массив `tracks` этой книги.

#### Scenario: Removing a track removes its copied file
- **WHEN** the user removes a track from a book
- **THEN** the system SHALL delete that track's file from the working directory in addition to removing it from that book's own `tracks` array
- **RU:** Когда пользователь удаляет трек из книги, система ДОЛЖНА удалить файл этого трека из рабочей директории в дополнение к удалению из собственного массива `tracks` этой книги.
