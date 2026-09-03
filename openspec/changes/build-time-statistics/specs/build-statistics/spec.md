## ADDED Requirements

### Requirement: Record a build history entry on completion
The system SHALL record a build history entry each time a build finishes, whether successfully, with an error, or via cancellation. A successful entry SHALL include: timestamp, duration (ms), output file size (bytes), bitrate (kbps), and FFmpeg thread count used. A failed or cancelled entry SHALL include timestamp, duration up to the failure point, and an outcome marker (`error` or `cancelled`) instead of output size.

**RU:** Система ДОЛЖНА записывать запись истории сборки каждый раз, когда сборка завершается — успешно, с ошибкой или отменой. Успешная запись ДОЛЖНА включать: временную метку, длительность (мс), размер выходного файла (байты), битрейт (kbps) и использованное количество потоков FFmpeg. Запись о неудачной или отменённой сборке ДОЛЖНА включать временную метку, длительность до момента сбоя и маркер результата (`error` или `cancelled`) вместо размера выходного файла.

#### Scenario: Successful build
- **WHEN** a build completes successfully (per the existing `audiobook-build` completion checks)
- **THEN** the system SHALL append a history entry with outcome `success`, its duration, output file size, and the bitrate/thread settings used for that build to the current project's `buildHistory`
- **RU:** Когда сборка успешно завершается (согласно существующим проверкам завершения из `audiobook-build`), система ДОЛЖНА добавить запись истории с результатом `success`, её длительностью, размером выходного файла и использованными настройками битрейта/потоков в `buildHistory` текущего проекта.

#### Scenario: Failed or cancelled build
- **WHEN** a build errors out or is cancelled by the user
- **THEN** the system SHALL still append a history entry marked `error` or `cancelled` respectively, with the elapsed duration up to that point
- **RU:** Когда сборка завершается ошибкой или отменяется пользователем, система ДОЛЖНА всё равно добавить запись истории с пометкой `error` или `cancelled` соответственно, с длительностью, прошедшей до этого момента.

### Requirement: Cap build history size
The system SHALL retain at most the 20 most recent build history entries per project, discarding the oldest entries beyond that cap.

**RU:** Система ДОЛЖНА хранить не более 20 самых последних записей истории сборки на проект, отбрасывая самые старые записи сверх этого предела.

#### Scenario: History exceeds the cap
- **WHEN** appending a new build history entry would make the project's `buildHistory` exceed 20 entries
- **THEN** the system SHALL drop the oldest entry so the list never exceeds 20
- **RU:** Когда добавление новой записи истории сборки привело бы к превышению `buildHistory` проекта 20 записей, система ДОЛЖНА удалить самую старую запись, чтобы список никогда не превышал 20.

### Requirement: Display build statistics
The system SHALL provide a view listing the current project's build history, most recent first, showing at minimum the date/time, duration, outcome, output size (when successful), and the bitrate/thread settings used for each entry.

**RU:** Система ДОЛЖНА предоставлять экран со списком истории сборок текущего проекта, начиная с самой последней, показывающий как минимум дату/время, длительность, результат, размер выходного файла (при успехе) и использованные настройки битрейта/потоков для каждой записи.

#### Scenario: View statistics with history present
- **WHEN** the user opens the Build Statistics view for a project that has at least one build history entry
- **THEN** the system SHALL render each entry as a row/card showing its date/time, duration (formatted `MM:SS` or `HH:MM:SS`), outcome, output size (if successful), and settings used
- **RU:** Когда пользователь открывает экран статистики сборки для проекта, у которого есть хотя бы одна запись истории сборки, система ДОЛЖНА отобразить каждую запись в виде строки/карточки с датой/временем, длительностью (в формате `MM:SS` или `HH:MM:SS`), результатом, размером выходного файла (если успешно) и использованными настройками.

#### Scenario: View statistics with no history
- **WHEN** the user opens the Build Statistics view for a project that has never been built
- **THEN** the system SHALL show an empty-state message instead of an empty list
- **RU:** Когда пользователь открывает экран статистики сборки для проекта, который ещё ни разу не собирался, система ДОЛЖНА показать сообщение о пустом состоянии вместо пустого списка.
