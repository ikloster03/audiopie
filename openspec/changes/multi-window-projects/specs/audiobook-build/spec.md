## MODIFIED Requirements

### Requirement: Prevent concurrent builds
The system SHALL reject a new build request while a build is already in progress, including when the in-progress build was started from a different application window.

**RU:** Система ДОЛЖНА отклонять новый запрос на сборку, пока предыдущая сборка ещё выполняется, в том числе если она была запущена из другого окна приложения.

#### Scenario: Start a build while one is running
- **WHEN** `build/start` is invoked while another build's FFmpeg processes are still active
- **THEN** the system SHALL throw an error and SHALL NOT start a second build
- **RU:** Когда `build/start` вызывается при активных процессах FFmpeg предыдущей сборки, система ДОЛЖНА выбросить ошибку и НЕ ДОЛЖНА запускать вторую сборку.

#### Scenario: Start a build in a second window
- **WHEN** window A has an in-progress build and window B invokes `build/start`
- **THEN** the system SHALL throw an error, SHALL NOT start a second build, and SHALL leave window A's build running
- **RU:** Когда `build/start` вызывается из окна B, пока в окне A идёт сборка, система ДОЛЖНА выбросить ошибку, НЕ ДОЛЖНА запускать вторую сборку и ДОЛЖНА оставить сборку окна A работающей.

### Requirement: Build progress reporting
The system SHALL report build progress to the renderer via progress events including `phase` (`probe` | `encode` | `chapters` | `finalize`), `percent`, `message`, `currentStep`, and `totalSteps`, throttled to at most once per 200ms during the encoding stage. Progress events SHALL be sent only to the window that started the in-progress build.

**RU:** Система ДОЛЖНА сообщать рендереру о прогрессе сборки через события прогресса, включающие `phase` (`probe` | `encode` | `chapters` | `finalize`), `percent`, `message`, `currentStep` и `totalSteps`, с ограничением частоты не чаще одного раза в 200 мс на этапе кодирования. События прогресса ДОЛЖНЫ отправляться только в окно, которое запустило текущую сборку.

#### Scenario: Encoding progress reflects all tracks
- **WHEN** multiple tracks are encoding in parallel
- **THEN** the reported percent for the encode phase SHALL be the average of each individual track's encode progress, scaled to the 0-40% portion of the overall build
- **RU:** Когда несколько треков кодируются параллельно, сообщаемый процент для этапа кодирования ДОЛЖЕН быть средним значением прогресса кодирования каждого трека, масштабированным на диапазон 0-40% от общей сборки.

#### Scenario: Other windows do not receive build progress
- **WHEN** a build started from window A emits progress events
- **THEN** the system SHALL send those events to window A and SHALL NOT send them to other open windows
- **RU:** Когда сборка, запущенная из окна A, генерирует события прогресса, система ДОЛЖНА отправлять их в окно A и НЕ ДОЛЖНА отправлять их в другие открытые окна.

### Requirement: Cancel an in-progress build
The system SHALL allow cancelling an in-progress build from the window that started it, terminating any active FFmpeg processes and cleaning up temporary files. A cancel invoked from a different window SHALL NOT terminate the in-progress build.

**RU:** Система ДОЛЖНА позволять отменять выполняющуюся сборку из окна, которое её запустило, завершая все активные процессы FFmpeg и удаляя временные файлы. Отмена, вызванная из другого окна, НЕ ДОЛЖНА завершать текущую сборку.

#### Scenario: User cancels during encoding
- **WHEN** the user triggers `build/cancel` from the window that started the build while tracks are encoding
- **THEN** the system SHALL send `SIGINT` to all active FFmpeg processes, cause the build promise to reject with a cancellation error, and clean up the temporary build directory unless a custom `tempDir` was supplied
- **RU:** Когда пользователь вызывает `build/cancel` из окна, запустившего сборку, во время кодирования треков, система ДОЛЖНА отправить `SIGINT` всем активным процессам FFmpeg, вызвать отклонение промиса сборки с ошибкой отмены и удалить временную директорию сборки, если не был указан пользовательский `tempDir`.

#### Scenario: Cancel from a different window is ignored
- **WHEN** window A has an in-progress build and window B triggers `build/cancel`
- **THEN** the system SHALL leave window A's FFmpeg processes running
- **RU:** Когда в окне A идёт сборка, а окно B вызывает `build/cancel`, система ДОЛЖНА оставить процессы FFmpeg окна A работающими.

## ADDED Requirements

### Requirement: Closing the building window cancels its build
The system SHALL cancel the in-progress build if the window that started it is closed before the build finishes.

**RU:** Система ДОЛЖНА отменить текущую сборку, если окно, которое её запустило, закрывается до завершения сборки.

#### Scenario: Owner window closed mid-build
- **WHEN** a build is in progress and the user closes the window that started it
- **THEN** the system SHALL cancel that build (terminate FFmpeg processes and clean up its temp files) and SHALL NOT leave the global build mutex busy for remaining windows
- **RU:** Когда идёт сборка и пользователь закрывает окно, которое её запустило, система ДОЛЖНА отменить эту сборку (завершить процессы FFmpeg и почистить временные файлы) и НЕ ДОЛЖНА оставлять глобальный мьютекс сборки занятым для оставшихся окон.
