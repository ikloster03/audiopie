# chapter-management Specification

## Purpose
Chapters are the primary editing surface of the project workspace: users reorder chapters via drag-and-drop, edit titles inline, and bulk-rename by template. Track duration and start/end times are displayed read-only. Adding tracks appends matching chapters without discarding existing titles; Generate/Regenerate still replaces the full list from tracks.

**RU:** Главы — основная поверхность редактирования рабочего пространства: пользователь меняет порядок перетаскиванием, правит названия в списке и массово переименовывает по шаблону. Длительность трека и start/end только отображаются. Добавление треков дописывает главы, не затирая существующие названия; «Сгенерировать» / «Пересоздать» по-прежнему полностью заменяют список из треков.

## Requirements
### Requirement: Auto-generate chapters from tracks
The system SHALL be able to derive a chapter list from the current track list, where each track becomes exactly one chapter whose title equals the track's display title, and whose start/end times are computed sequentially (chapter N's start equals the cumulative duration of all prior tracks; chapter N's end equals its start plus its track's duration). Adding tracks SHALL append new chapters for the added files without discarding existing chapter titles. Removing a chapter's source file SHALL remove that track and its paired chapter, then recompute start/end for remaining chapters while keeping their titles. "Generate" / "Regenerate" SHALL still replace the full chapter list from tracks.

**RU:** Система ДОЛЖНА уметь формировать список глав из текущего списка треков: каждый трек становится ровно одной главой, название которой равно отображаемому названию трека, а время начала/конца вычисляется последовательно (начало главы N равно суммарной длительности всех предыдущих треков; конец главы N равен её началу плюс длительность её трека). Добавление треков ДОЛЖНО дописывать новые главы, не затирая существующие названия. Удаление исходника ДОЛЖНО убрать трек и парную главу и пересчитать start/end оставшихся, сохранив названия. «Сгенерировать» / «Пересоздать» по-прежнему полностью заменяют список глав.

#### Scenario: Generate chapters for the first time
- **WHEN** the user clicks "Generate" while no chapters exist
- **THEN** the system SHALL create one chapter per track, in track order, with non-overlapping, contiguous `startMs`/`endMs` ranges covering the whole audiobook duration
- **RU:** Когда пользователь нажимает «Сгенерировать» при отсутствии глав, система ДОЛЖНА создать по одной главе на каждый трек, в порядке треков, с непересекающимися смежными диапазонами `startMs`/`endMs`, покрывающими всю длительность аудиокниги.

#### Scenario: Regenerate chapters overwrites manual edits
- **WHEN** the user clicks "Regenerate" after having manually edited chapter titles
- **THEN** the system SHALL replace the entire chapter list with freshly computed chapters from the current tracks, discarding any manual chapter title customizations
- **RU:** Когда пользователь нажимает «Перегенерировать» после ручного редактирования названий глав, система ДОЛЖНА полностью заменить список глав заново вычисленными главами из текущих треков, отбросив все ручные изменения названий.

#### Scenario: Add tracks without wiping titles
- **WHEN** the user adds MP3 files while chapters already exist
- **THEN** the system SHALL append tracks and matching chapters for the new files only, and SHALL NOT regenerate titles of existing chapters
- **RU:** Когда пользователь добавляет MP3 при уже существующих главах, система ДОЛЖНА дописать треки и главы только для новых файлов и НЕ ДОЛЖНА перегенерировать названия существующих глав.

#### Scenario: Remove a chapter's source file
- **WHEN** the user removes a chapter row's source file
- **THEN** the system SHALL remove that track and chapter, recompute remaining chapter start/end from remaining track durations, and keep remaining titles
- **RU:** Когда пользователь удаляет исходный файл строки главы, система ДОЛЖНА удалить этот трек и главу, пересчитать start/end оставшихся по длительностям и сохранить оставшиеся названия.

### Requirement: Manually edit chapter titles
The system SHALL allow editing only a chapter's title inline; chapter start/end times are derived from tracks and are not independently user-editable. Title edits SHALL be persisted via `chapters/update` with a debounce.

**RU:** Система ДОЛЖНА позволять редактировать только название главы; start/end вычисляются из треков и не редактируются. Сохранение названия — через `chapters/update` с debounce.

#### Scenario: Edit a chapter title
- **WHEN** the user types into a chapter's title field
- **THEN** the system SHALL update the local chapter list immediately and persist via `chapters/update` after 200ms without further edits
- **RU:** Когда пользователь вводит название, система ДОЛЖНА сразу обновить локальный список и сохранить через `chapters/update` после 200 мс без ввода.

### Requirement: Empty chapters state
The system SHALL show a "no chapters yet" empty state with a "Generate" action when the chapter list is empty, and SHALL show a chapter count with a "Regenerate" action once chapters exist.

**RU:** Система ДОЛЖНА показывать пустое состояние «глав пока нет» с действием «Сгенерировать», когда список глав пуст, и показывать счётчик глав с действием «Перегенерировать», когда главы уже существуют.

#### Scenario: No chapters yet
- **WHEN** the project has tracks but chapters have not been generated
- **THEN** the chapters panel SHALL display an empty-state message and a "Generate" button instead of a chapter list
- **RU:** Когда в проекте есть треки, но главы ещё не сгенерированы, панель глав ДОЛЖНА отображать сообщение о пустом состоянии и кнопку «Сгенерировать» вместо списка глав.

### Requirement: Reorder chapters via drag-and-drop
The system SHALL allow the user to reorder chapters directly in the Chapters view via a drag handle. Reordering chapters SHALL update the underlying track order to match the new chapter order, persist both lists in one IPC round-trip (`chapters/reorder`), recompute contiguous start/end from the new track durations, and keep existing chapter titles.

**RU:** Система ДОЛЖНА позволять менять порядок глав перетаскиванием за ручку, синхронно обновлять порядок треков за один IPC-вызов `chapters/reorder`, пересчитывать start/end по длительностям треков и сохранять названия глав.

#### Scenario: Drag a chapter to a new position
- **WHEN** the user drags a chapter item by its handle to a new position in the chapters list
- **THEN** the system SHALL persist the permuted chapters and tracks via `chapters/reorder`, update renderer state from the returned arrays, and SHALL NOT re-derive chapter titles from track display titles
- **RU:** Когда пользователь перетаскивает главу на новую позицию, система ДОЛЖНА сохранить оба списка через `chapters/reorder`, обновить состояние рендерера и НЕ ДОЛЖНА заново брать названия из `displayTitle` треков.

### Requirement: Display chapter timing read-only
The system SHALL show each chapter's paired track duration and its start–end range in the chapter row. The user SHALL be able to edit only the chapter title; start and end SHALL NOT be independently editable in this workspace.

**RU:** Система ДОЛЖНА показывать в строке главы длительность парного трека и диапазон начала/конца. Редактируется только название; start/end в этом рабочем пространстве НЕ редактируются отдельно.

#### Scenario: View a chapter row
- **WHEN** a chapter is rendered in the list
- **THEN** the system SHALL display an editable title, the track duration as `MM:SS` or `HH:MM:SS`, and a read-only start–end range
- **RU:** Когда глава отображается в списке, система ДОЛЖНА показать редактируемое название, длительность трека в `MM:SS` или `HH:MM:SS` и диапазон начала/конца только для чтения.

### Requirement: Rename chapters by template
The system SHALL let the user rename all chapters in one bulk action using a text template containing a numeric placeholder (e.g. `Chapter {n}`), where `{n}` is replaced by the chapter's 1-based position in the list.

**RU:** Система ДОЛЖНА позволять переименовать все главы одним действием по шаблону с плейсхолдером `{n}` (нумерация с 1).

#### Scenario: Apply a rename template
- **WHEN** the user opens the "Rename by template" action, enters a template containing `{n}`, and confirms
- **THEN** the system SHALL generate a new title for every chapter by substituting `{n}` with that chapter's 1-based index, update the chapter list, and persist it via `chapters/renameByTemplate`
- **RU:** Когда пользователь подтверждает шаблон с `{n}`, система ДОЛЖНА подставить порядковый номер каждой главы, обновить список и сохранить через `chapters/renameByTemplate`.

#### Scenario: Template without a placeholder
- **WHEN** the user submits a template that does not contain `{n}`
- **THEN** the system SHALL apply the literal template text to every chapter unchanged (all chapters receive the same title) rather than rejecting the action
- **RU:** Когда шаблон без `{n}`, система ДОЛЖНА применить его буквально ко всем главам.

### Requirement: Chapter list summary
The system SHALL show in the top-left of the Chapters view the chapter count and the total audiobook duration derived from the sum of track durations, formatted as hours and minutes (e.g. `15ч 54м` / `15h 54m`). This summary SHALL appear below the identity header (cover + title).

**RU:** Система ДОЛЖНА показывать слева вверху панели глав число глав и суммарную длительность книги по сумме длительностей треков в формате часов и минут (например, `15ч 54м`). Эта сводка ДОЛЖНА быть под шапкой идентичности (обложка + название).

#### Scenario: Project with tracks
- **WHEN** the Chapters view is visible
- **THEN** the system SHALL render the localized chapter count next to the localized total duration (`hours` + `minutes` from rounded total milliseconds), below the cover and title
- **RU:** Когда открыта панель глав, система ДОЛЖНА показать локализованный счётчик глав рядом с локализованной суммарной длительностью, под обложкой и названием.

### Requirement: Chapters view identity header
The system SHALL display the audiobook cover thumbnail and title from project metadata at the top of the Chapters view, above the chapter count and total duration. The header SHALL be display-only (not a cover picker and not a navigation control). It SHALL remain visible in empty Chapters states (no tracks / no chapters).

**RU:** Система ДОЛЖНА показывать миниатюру обложки и название аудиокниги из метаданных проекта вверху панели глав, над числом глав и суммарной длительностью. Шапка только для отображения (не выбор обложки и не навигация). Она ДОЛЖНА быть видна и в пустых состояниях панели глав.

#### Scenario: Cover and title present
- **WHEN** the project has a `coverPath` that loads successfully and a title that is not empty, whitespace-only, or the default untitled value
- **THEN** the system SHALL render the cover as a compact thumbnail and the metadata title as the primary heading above the chapter count and total duration
- **RU:** Когда есть загружаемая обложка и настоящее название, система ДОЛЖНА показать миниатюру и название над счётчиком глав и длительностью.

#### Scenario: Missing cover
- **WHEN** `coverPath` is absent or the cover image fails to load
- **THEN** the system SHALL render a cover placeholder (muted rounded square with a book icon) in the same thumbnail slot
- **RU:** Когда обложки нет или она не загрузилась, система ДОЛЖНА показать заглушку обложки в том же слоте миниатюры.

#### Scenario: Missing title
- **WHEN** `metadata.title` is empty, whitespace-only, or equal to the default untitled value (`Untitled Audiobook` or the localized `common.untitledAudiobook`)
- **THEN** the system SHALL render a muted title placeholder using the localized untitled audiobook string
- **RU:** Когда названия нет (пустое, пробелы или значение «без названия» по умолчанию), система ДОЛЖНА показать приглушённую заглушку с локализованной строкой «Без названия» / «Untitled Audiobook».
