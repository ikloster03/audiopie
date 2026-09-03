# audiobook-build Specification

## Purpose
TBD - created by archiving change baseline-capture-existing-capabilities. Update Purpose after archive.
## Requirements
### Requirement: Pre-build validation
The system SHALL block starting a build when there are no tracks in the project or when the book title is still the default "Untitled Audiobook" placeholder, and SHALL show a dismissible warning (auto-hidden after 5 seconds) explaining why the build cannot start.

**RU:** Система ДОЛЖНА блокировать запуск сборки, если в проекте нет треков или название книги всё ещё равно плейсхолдеру "Untitled Audiobook" по умолчанию, и показывать закрываемое предупреждение (скрывается автоматически через 5 секунд) с объяснением причины.

#### Scenario: Build blocked with no tracks or default title
- **WHEN** the user clicks "Build" while `tracks.length === 0` or the metadata title equals the untitled-audiobook placeholder
- **THEN** the system SHALL NOT invoke the build IPC call and SHALL display a "cannot build" alert for 5 seconds
- **RU:** Когда пользователь нажимает «Собрать» при `tracks.length === 0` или названии-плейсхолдере, система НЕ ДОЛЖНА вызывать IPC сборки и ДОЛЖНА показать предупреждение «невозможно собрать» на 5 секунд.

### Requirement: Select build output location
The system SHALL let the user choose the output `.m4b` file path via a native save dialog, pre-filled with the configured default output directory and a sanitized file name derived from the book title.

**RU:** Система ДОЛЖНА позволять выбирать путь к выходному `.m4b`-файлу через нативный диалог сохранения, предзаполненный настроенной директорией вывода по умолчанию и очищенным именем файла, полученным из названия книги.

#### Scenario: User cancels output selection
- **WHEN** the user cancels the output file dialog
- **THEN** the system SHALL abort the build attempt without starting FFmpeg processing
- **RU:** Когда пользователь отменяет диалог выбора выходного файла, система ДОЛЖНА прервать попытку сборки без запуска обработки FFmpeg.

### Requirement: Prevent concurrent builds
The system SHALL reject a new build request while a build is already in progress.

**RU:** Система ДОЛЖНА отклонять новый запрос на сборку, пока предыдущая сборка ещё выполняется.

#### Scenario: Start a build while one is running
- **WHEN** `build/start` is invoked while another build's FFmpeg processes are still active
- **THEN** the system SHALL throw an error and SHALL NOT start a second build
- **RU:** Когда `build/start` вызывается при активных процессах FFmpeg предыдущей сборки, система ДОЛЖНА выбросить ошибку и НЕ ДОЛЖНА запускать вторую сборку.

### Requirement: Build pipeline stages
The system SHALL build the M4B audiobook in three stages: (1) parallel per-track encoding to AAC (using `libfdk_aac` when available, otherwise standard `aac` at the configured bitrate), distributing configured FFmpeg thread count across concurrent encode processes; (2) stream-copy concatenation of encoded tracks into a single merged file; (3) finalization that attaches FFMETADATA (including chapter markers) and, if present, an embedded cover image, then writes the final `.m4b` with `faststart` enabled.

**RU:** Система ДОЛЖНА собирать M4B-аудиокнигу в три этапа: (1) параллельное покодовое кодирование в AAC (используя `libfdk_aac`, если доступен, иначе стандартный `aac` с настроенным битрейтом), распределяя настроенное количество потоков FFmpeg между параллельными процессами кодирования; (2) объединение закодированных треков потоковым копированием (concat) в один файл; (3) финализация, добавляющая FFMETADATA (включая метки глав) и, если есть, встроенную обложку, после чего записывается финальный `.m4b` с включённым `faststart`.

#### Scenario: Chapters missing at build time
- **WHEN** a build starts and the project's chapter list is empty
- **THEN** the system SHALL compute chapters from the current tracks before proceeding, the same way manual chapter generation would
- **RU:** Когда сборка начинается, а список глав проекта пуст, система ДОЛЖНА вычислить главы из текущих треков перед продолжением — так же, как при ручной генерации глав.

#### Scenario: Cover embedded when present
- **WHEN** the book metadata has a `coverPath` that exists on disk
- **THEN** the finalization stage SHALL embed it as an attached picture stream in the output file
- **RU:** Когда в метаданных книги указан `coverPath`, существующий на диске, этап финализации ДОЛЖЕН встроить его как прикреплённый видеопоток изображения в выходной файл.

#### Scenario: Cover skipped when absent or missing
- **WHEN** `coverPath` is unset or does not exist on disk
- **THEN** the finalization stage SHALL produce the output file without an embedded cover, using only the audio and metadata streams
- **RU:** Когда `coverPath` не задан или файл не существует на диске, этап финализации ДОЛЖЕН создать выходной файл без встроенной обложки, используя только аудио- и мета-потоки.

### Requirement: Build progress reporting
The system SHALL report build progress to the renderer via progress events including `phase` (`probe` | `encode` | `chapters` | `finalize`), `percent`, `message`, `currentStep`, and `totalSteps`, throttled to at most once per 200ms during the encoding stage.

**RU:** Система ДОЛЖНА сообщать рендереру о прогрессе сборки через события прогресса, включающие `phase` (`probe` | `encode` | `chapters` | `finalize`), `percent`, `message`, `currentStep` и `totalSteps`, с ограничением частоты не чаще одного раза в 200 мс на этапе кодирования.

#### Scenario: Encoding progress reflects all tracks
- **WHEN** multiple tracks are encoding in parallel
- **THEN** the reported percent for the encode phase SHALL be the average of each individual track's encode progress, scaled to the 0-40% portion of the overall build
- **RU:** Когда несколько треков кодируются параллельно, сообщаемый процент для этапа кодирования ДОЛЖЕН быть средним значением прогресса кодирования каждого трека, масштабированным на диапазон 0-40% от общей сборки.

### Requirement: Cancel an in-progress build
The system SHALL allow cancelling an in-progress build, terminating any active FFmpeg processes and cleaning up temporary files.

**RU:** Система ДОЛЖНА позволять отменять выполняющуюся сборку, завершая все активные процессы FFmpeg и удаляя временные файлы.

#### Scenario: User cancels during encoding
- **WHEN** the user triggers `build/cancel` while tracks are encoding
- **THEN** the system SHALL send `SIGINT` to all active FFmpeg processes, cause the build promise to reject with a cancellation error, and clean up the temporary build directory unless a custom `tempDir` was supplied
- **RU:** Когда пользователь вызывает `build/cancel` во время кодирования треков, система ДОЛЖНА отправить `SIGINT` всем активным процессам FFmpeg, вызвать отклонение промиса сборки с ошибкой отмены и удалить временную директорию сборки, если не был указан пользовательский `tempDir`.

### Requirement: Build completion
The system SHALL verify the output file exists and is non-empty after finalization, clean up temporary files (unless a custom `tempDir` was provided), and show a native OS notification summarizing the build duration and output file size.

**RU:** Система ДОЛЖНА проверять, что выходной файл существует и не пуст после финализации, удалять временные файлы (если не указан пользовательский `tempDir`) и показывать нативное системное уведомление с длительностью сборки и размером выходного файла.

#### Scenario: Output file missing or empty
- **WHEN** finalization completes but the output file is missing or has zero size
- **THEN** the system SHALL throw an error indicating the output was not created, instead of reporting success
- **RU:** Когда финализация завершена, но выходной файл отсутствует или имеет нулевой размер, система ДОЛЖНА выбросить ошибку о том, что файл не был создан, вместо сообщения об успехе.

