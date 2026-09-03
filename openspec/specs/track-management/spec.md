# track-management Specification

## Purpose
TBD - created by archiving change baseline-capture-existing-capabilities. Update Purpose after archive.
## Requirements
### Requirement: Select and import MP3 tracks
The system SHALL let the user add MP3 tracks either via a native file dialog or by dropping `.mp3` files onto the tracks panel. For each imported file, the system SHALL probe its duration via FFprobe and derive a default display title from the file name (extension stripped).

**RU:** Система ДОЛЖНА позволять добавлять MP3-треки через нативный диалог выбора файлов или перетаскиванием (drag-and-drop) `.mp3`-файлов на панель треков. Для каждого импортированного файла система ДОЛЖНА определить его длительность через FFprobe и вычислить название по умолчанию из имени файла (без расширения).

#### Scenario: Add tracks via file dialog
- **WHEN** the user clicks "Add tracks" and selects one or more MP3 files
- **THEN** the system SHALL probe each file's duration, append the new tracks to the existing track list, and auto-regenerate chapters from the updated track list
- **RU:** Когда пользователь нажимает «Добавить треки» и выбирает один или несколько MP3-файлов, система ДОЛЖНА определить длительность каждого файла, добавить новые треки к существующему списку и автоматически перегенерировать главы из обновлённого списка треков.

#### Scenario: Add tracks via drag and drop
- **WHEN** the user drags files onto the tracks panel and drops them
- **THEN** the system SHALL filter the dropped files to only `.mp3` files, resolve their file system paths, and add them the same way as tracks selected via dialog
- **RU:** Когда пользователь перетаскивает файлы на панель треков и отпускает их, система ДОЛЖНА отфильтровать только `.mp3`-файлы, определить их пути в файловой системе и добавить их так же, как треки, выбранные через диалог.

#### Scenario: Some files fail to probe
- **WHEN** one or more dropped/selected files fail duration probing (e.g. corrupt or unsupported file)
- **THEN** the system SHALL still add the files that succeeded, and SHALL report the failures as a message sent over the build progress channel (`phase: 'probe'`), which the renderer surfaces as an alert
- **RU:** Когда один или несколько добавленных файлов не удаётся проанализировать (например, повреждён или не поддерживается), система ДОЛЖНА всё равно добавить успешно обработанные файлы и сообщить об ошибках через канал прогресса сборки (`phase: 'probe'`), который рендерер показывает как alert.

### Requirement: Reorder tracks
The system SHALL allow reordering tracks via drag handle and SHALL persist the new order to the in-memory project.

**RU:** Система ДОЛЖНА позволять изменять порядок треков перетаскиванием за ручку (drag handle) и сохранять новый порядок в проекте, хранящемся в памяти.

#### Scenario: Drag a track to a new position
- **WHEN** the user drags a track item by its handle to a new position in the list
- **THEN** the system SHALL compute the new index order, persist it via `tracks/reorder`, update the renderer's track list state, and auto-regenerate chapters from the reordered tracks
- **RU:** Когда пользователь перетаскивает трек за ручку на новую позицию в списке, система ДОЛЖНА вычислить новый порядок индексов, сохранить его через `tracks/reorder`, обновить состояние списка треков в рендерере и автоматически перегенерировать главы из переупорядоченных треков.

### Requirement: Rename a track
The system SHALL allow inline editing of a track's display title. If the user clears the title entirely, the system SHALL fall back to the previous title rather than allow an empty title.

**RU:** Система ДОЛЖНА позволять редактировать отображаемое название трека прямо в списке. Если пользователь полностью очищает поле названия, система ДОЛЖНА вернуться к предыдущему названию, а не сохранять пустую строку.

#### Scenario: Edit a track title
- **WHEN** the user types a new value into a track's title input and the value is non-empty after trimming
- **THEN** the system SHALL persist the trimmed title via `tracks/updateTitle` and auto-regenerate chapters, which overwrites any chapter title previously customized for that track's position
- **RU:** Когда пользователь вводит новое значение в поле названия трека и после обрезки пробелов значение непустое, система ДОЛЖНА сохранить обрезанное название через `tracks/updateTitle` и автоматически перегенерировать главы, что перезапишет любое ранее кастомизированное название главы для позиции этого трека.

#### Scenario: Clear a track title
- **WHEN** the user clears a track's title input entirely
- **THEN** the system SHALL keep the track's previous (pre-edit) title instead of persisting an empty string
- **RU:** Когда пользователь полностью очищает поле названия трека, система ДОЛЖНА сохранить предыдущее (до редактирования) название вместо пустой строки.

### Requirement: Remove tracks
The system SHALL allow removing one or more tracks by index and SHALL keep the remaining tracks' relative order intact.

**RU:** Система ДОЛЖНА позволять удалять один или несколько треков по индексу, сохраняя относительный порядок оставшихся треков.

#### Scenario: Remove a single track
- **WHEN** the user clicks the remove button on a track
- **THEN** the system SHALL remove that track from the project's track list and auto-regenerate chapters from the remaining tracks
- **RU:** Когда пользователь нажимает кнопку удаления трека, система ДОЛЖНА удалить этот трек из списка треков проекта и автоматически перегенерировать главы из оставшихся треков.

### Requirement: Track duration display
The system SHALL display each track's probed duration formatted as `MM:SS`, or `HH:MM:SS` when the duration is one hour or longer.

**RU:** Система ДОЛЖНА отображать определённую длительность каждого трека в формате `MM:SS`, либо `HH:MM:SS`, если длительность составляет час или больше.

#### Scenario: Track under an hour
- **WHEN** a track's duration is less than 3600000ms
- **THEN** the system SHALL display it as `MM:SS` (zero-padded)
- **RU:** Когда длительность трека меньше 3600000 мс, система ДОЛЖНА отображать её в формате `MM:SS` (с ведущими нулями).

#### Scenario: Track an hour or longer
- **WHEN** a track's duration is 3600000ms or more
- **THEN** the system SHALL display it as `HH:MM:SS` (zero-padded)
- **RU:** Когда длительность трека 3600000 мс или больше, система ДОЛЖНА отображать её в формате `HH:MM:SS` (с ведущими нулями).

