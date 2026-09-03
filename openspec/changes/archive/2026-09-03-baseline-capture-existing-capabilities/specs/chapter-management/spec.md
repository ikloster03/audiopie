## ADDED Requirements

### Requirement: Auto-generate chapters from tracks
The system SHALL be able to derive a chapter list from the current track list, where each track becomes exactly one chapter whose title equals the track's display title, and whose start/end times are computed sequentially (chapter N's start equals the cumulative duration of all prior tracks; chapter N's end equals its start plus its track's duration).

**RU:** Система ДОЛЖНА уметь формировать список глав из текущего списка треков: каждый трек становится ровно одной главой, название которой равно отображаемому названию трека, а время начала/конца вычисляется последовательно (начало главы N равно суммарной длительности всех предыдущих треков; конец главы N равен её началу плюс длительность её трека).

#### Scenario: Generate chapters for the first time
- **WHEN** the user clicks "Generate" while no chapters exist
- **THEN** the system SHALL create one chapter per track, in track order, with non-overlapping, contiguous `startMs`/`endMs` ranges covering the whole audiobook duration
- **RU:** Когда пользователь нажимает «Сгенерировать» при отсутствии глав, система ДОЛЖНА создать по одной главе на каждый трек, в порядке треков, с непересекающимися смежными диапазонами `startMs`/`endMs`, покрывающими всю длительность аудиокниги.

#### Scenario: Regenerate chapters overwrites manual edits
- **WHEN** the user clicks "Regenerate" after having manually edited chapter titles
- **THEN** the system SHALL replace the entire chapter list with freshly computed chapters from the current tracks, discarding any manual chapter title customizations
- **RU:** Когда пользователь нажимает «Перегенерировать» после ручного редактирования названий глав, система ДОЛЖНА полностью заменить список глав заново вычисленными главами из текущих треков, отбросив все ручные изменения названий.

#### Scenario: Chapters auto-refresh after track changes
- **WHEN** tracks are added, removed, reordered, or renamed
- **THEN** the system SHALL automatically recompute the full chapter list from the updated tracks (this also discards prior manual chapter title edits)
- **RU:** Когда треки добавляются, удаляются, переупорядочиваются или переименовываются, система ДОЛЖНА автоматически пересчитать весь список глав из обновлённых треков (это также отбрасывает ранее сделанные ручные изменения названий глав).

### Requirement: Manually edit chapter titles
The system SHALL allow editing only a chapter's title inline; chapter start/end times are derived from tracks and are not independently user-editable. Title edits SHALL be persisted to the backend with a debounce so rapid keystrokes do not trigger excessive IPC calls.

**RU:** Система ДОЛЖНА позволять редактировать только название главы прямо в списке; время начала/конца главы вычисляется из треков и не редактируется отдельно пользователем. Изменения названия ДОЛЖНЫ сохраняться на бэкенде с задержкой (debounce), чтобы быстрый ввод не вызывал избыточные IPC-вызовы.

#### Scenario: Edit a chapter title
- **WHEN** the user types into a chapter's title field
- **THEN** the system SHALL update the local chapter list immediately for responsive typing, and SHALL persist the updated chapter list via `chapters/update` after 200ms of no further edits to that debounce window
- **RU:** Когда пользователь вводит текст в поле названия главы, система ДОЛЖНА немедленно обновить локальный список глав для отзывчивого ввода и сохранить обновлённый список через `chapters/update` спустя 200 мс без новых изменений (debounce).

### Requirement: Empty chapters state
The system SHALL show a "no chapters yet" empty state with a "Generate" action when the chapter list is empty, and SHALL show a chapter count with a "Regenerate" action once chapters exist.

**RU:** Система ДОЛЖНА показывать пустое состояние «глав пока нет» с действием «Сгенерировать», когда список глав пуст, и показывать счётчик глав с действием «Перегенерировать», когда главы уже существуют.

#### Scenario: No chapters yet
- **WHEN** the project has tracks but chapters have not been generated
- **THEN** the chapters panel SHALL display an empty-state message and a "Generate" button instead of a chapter list
- **RU:** Когда в проекте есть треки, но главы ещё не сгенерированы, панель глав ДОЛЖНА отображать сообщение о пустом состоянии и кнопку «Сгенерировать» вместо списка глав.
