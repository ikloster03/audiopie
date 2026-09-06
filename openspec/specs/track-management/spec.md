# track-management Specification

## Purpose
MP3 tracks are an internal source-file concept: users add and remove them from the Chapters view, and track order stays synchronized with chapter order. Each paired track's probed duration is shown on the corresponding chapter row.

**RU:** MP3-треки — внутренняя сущность исходных файлов: пользователь добавляет и удаляет их из панели глав, порядок треков синхронен с порядком глав. Длительность парного трека показывается в соответствующей строке главы.

## Requirements
### Requirement: Select and import MP3 tracks
The system SHALL let the user add MP3 tracks via a native file dialog from the Chapters toolbar, or by dropping `.mp3` files onto the workspace main area. For each imported file, the system SHALL probe duration via FFprobe and derive a default display title from the file name.

**RU:** Система ДОЛЖНА позволять добавлять MP3 через диалог из тулбара глав или drop на основную область. Для каждого файла — probe длительности и название из имени файла.

#### Scenario: Add tracks via file dialog
- **WHEN** the user activates "Add tracks" in the Chapters view and selects one or more MP3 files
- **THEN** the system SHALL probe each file, append tracks, and append matching chapters without regenerating existing chapter titles
- **RU:** Когда пользователь добавляет треки из панели глав, система ДОЛЖНА проанализировать файлы, дописать треки и главы, не перегенерируя существующие названия глав.

#### Scenario: Add tracks via drag and drop
- **WHEN** the user drops files onto the workspace main area
- **THEN** the system SHALL keep only `.mp3` files and add them the same way as files chosen via the dialog
- **RU:** Когда пользователь бросает файлы на основную область, система ДОЛЖНА оставить только `.mp3` и добавить их как через диалог.

#### Scenario: Some files fail to probe
- **WHEN** one or more dropped/selected files fail duration probing (e.g. corrupt or unsupported file)
- **THEN** the system SHALL still add the files that succeeded, and SHALL report the failures as a message sent over the build progress channel (`phase: 'probe'`), which the renderer surfaces as an alert
- **RU:** Когда один или несколько добавленных файлов не удаётся проанализировать (например, повреждён или не поддерживается), система ДОЛЖНА всё равно добавить успешно обработанные файлы и сообщить об ошибках через канал прогресса сборки (`phase: 'probe'`), который рендерер показывает как alert.

### Requirement: Reorder tracks
The system SHALL keep track order synchronized with chapter order. Track reordering SHALL be performed indirectly by dragging chapters in the Chapters view rather than through a standalone track list UI; the standalone tracks tab and its own drag-and-drop controls are removed from the primary workspace.

**RU:** Система ДОЛЖНА держать порядок треков синхронным с порядком глав. Перестановка — через drag глав, без отдельной вкладки треков.

#### Scenario: Drag a chapter to a new position
- **WHEN** the user drags a chapter item by its handle to a new position in the chapters list
- **THEN** the system SHALL persist the matching track order as part of `chapters/reorder` and update the renderer's track list state, without exposing a separate tracks UI
- **RU:** Когда пользователь перетаскивает главу, система ДОЛЖНА сохранить соответствующий порядок треков в `chapters/reorder` и обновить состояние треков в рендерере без отдельного UI треков.

### Requirement: Remove tracks
The system SHALL allow removing a track from the Chapters view by removing that chapter row's source file. Remaining tracks SHALL keep their relative order.

**RU:** Система ДОЛЖНА позволять удалять трек из панели глав удалением исходника строки главы. Относительный порядок оставшихся треков сохраняется.

#### Scenario: Remove a chapter's source file
- **WHEN** the user clicks remove on a chapter row
- **THEN** the system SHALL remove that track and its paired chapter and recompute remaining chapter times from remaining track durations
- **RU:** Когда пользователь нажимает удаление на строке главы, система ДОЛЖНА удалить этот трек и парную главу и пересчитать время оставшихся глав.

### Requirement: Track duration display
The system SHALL display each paired track's probed duration on the chapter row, formatted as `MM:SS`, or `HH:MM:SS` when the duration is one hour or longer.

**RU:** Система ДОЛЖНА показывать длительность парного трека в строке главы в формате `MM:SS` или `HH:MM:SS`.

#### Scenario: Track under an hour
- **WHEN** a track's duration is less than 3600000ms
- **THEN** the system SHALL display it as `MM:SS` (zero-padded) on the corresponding chapter row
- **RU:** Когда длительность меньше часа, система ДОЛЖНА показать `MM:SS` в строке главы.

#### Scenario: Track an hour or longer
- **WHEN** a track's duration is 3600000ms or more
- **THEN** the system SHALL display it as `HH:MM:SS` (zero-padded) on the corresponding chapter row
- **RU:** Когда длительность трека 3600000 мс или больше, система ДОЛЖНА отображать её в формате `HH:MM:SS` (с ведущими нулями) в соответствующей строке главы.
