## ADDED Requirements

### Requirement: Auto-update disabled in development
The system SHALL disable all auto-update behavior (listeners, startup checks, periodic checks, manual checks) when the app is running unpackaged (development mode).

**RU:** Система ДОЛЖНА отключать всё поведение автообновления (слушатели, проверки при запуске, периодические проверки, ручные проверки), когда приложение запущено неупакованным (в режиме разработки).

#### Scenario: Manual check attempted in development
- **WHEN** `update/checkNow` is invoked while `app.isPackaged` is false
- **THEN** the system SHALL report an error state ("Auto-update is disabled in development mode") instead of contacting the update server
- **RU:** Когда `update/checkNow` вызывается при `app.isPackaged === false`, система ДОЛЖНА сообщить состояние ошибки («Автообновление отключено в режиме разработки») вместо обращения к серверу обновлений.

### Requirement: Startup update check with debounce
The system SHALL check for updates automatically shortly after app start (with a 10 second delay) when auto-check is enabled in settings, but SHALL skip the check if the last check occurred less than 24 hours ago.

**RU:** Система ДОЛЖНА автоматически проверять обновления вскоре после запуска приложения (с задержкой 10 секунд), если автопроверка включена в настройках, но ДОЛЖНА пропустить проверку, если последняя проверка была менее 24 часов назад.

#### Scenario: Recently checked
- **WHEN** the app starts and `lastUpdateCheck` is less than 24 hours in the past
- **THEN** the system SHALL skip the startup check without contacting the update server
- **RU:** Когда приложение запускается, а `lastUpdateCheck` был менее 24 часов назад, система ДОЛЖНА пропустить проверку при запуске без обращения к серверу обновлений.

### Requirement: Periodic update checks
The system SHALL re-check for updates automatically every 6 hours while auto-check is enabled, and SHALL stop/restart this periodic timer whenever the auto-check setting is toggled off/on.

**RU:** Система ДОЛЖНА автоматически повторно проверять обновления каждые 6 часов, пока включена автопроверка, и ДОЛЖНА останавливать/перезапускать этот периодический таймер при выключении/включении настройки автопроверки.

#### Scenario: User disables auto-check
- **WHEN** the user turns off "auto check for updates" in settings
- **THEN** the system SHALL clear the periodic 6-hour check interval so no further automatic checks occur until re-enabled
- **RU:** Когда пользователь выключает «автопроверку обновлений» в настройках, система ДОЛЖНА очистить периодический 6-часовой интервал проверки, чтобы автоматические проверки не выполнялись до повторного включения.

### Requirement: Manual and concurrent-safe update checks
The system SHALL allow the user to trigger a manual update check, SHALL ignore a new check request while one is already in flight, and SHALL always record the check timestamp (`lastUpdateCheck`) when a check is attempted.

**RU:** Система ДОЛЖНА позволять пользователю вручную запускать проверку обновлений, ДОЛЖНА игнорировать новый запрос проверки, пока предыдущий ещё выполняется, и ДОЛЖНА всегда фиксировать время проверки (`lastUpdateCheck`) при попытке проверки.

#### Scenario: Check already in progress
- **WHEN** `update/checkNow` is called while a previous check has not yet resolved
- **THEN** the system SHALL no-op the new request instead of starting a second concurrent check
- **RU:** Когда `update/checkNow` вызывается, пока предыдущая проверка ещё не завершена, система ДОЛЖНА проигнорировать новый запрос вместо запуска второй параллельной проверки.

### Requirement: Download and install updates
The system SHALL let the user download an available update (guarded against concurrent downloads, immediately reporting a 0% "downloading" state before real progress arrives) and then install it and restart the app on demand.

**RU:** Система ДОЛЖНА позволять пользователю скачивать доступное обновление (с защитой от параллельных загрузок, немедленно сообщая состояние «загрузка» с 0% до появления реального прогресса), а затем устанавливать его и перезапускать приложение по запросу.

#### Scenario: Install and restart
- **WHEN** the user confirms installing a downloaded update
- **THEN** the system SHALL quit the app and install the update, relaunching automatically afterward
- **RU:** Когда пользователь подтверждает установку загруженного обновления, система ДОЛЖНА закрыть приложение и установить обновление, автоматически перезапустив его после этого.

### Requirement: Update state broadcast
The system SHALL broadcast update lifecycle state (`checking`, `available`, `not-available`, `downloading`, `downloaded`, `error`) to the renderer whenever it changes, including version info and download progress where applicable.

**RU:** Система ДОЛЖНА транслировать рендереру состояние жизненного цикла обновления (`checking`, `available`, `not-available`, `downloading`, `downloaded`, `error`) при каждом изменении, включая информацию о версии и прогресс загрузки, если применимо.

#### Scenario: Update becomes available
- **WHEN** `electron-updater` reports an available update
- **THEN** the system SHALL broadcast an `available` state including the update's version, release date, and release notes to the renderer via `update:stateChanged`
- **RU:** Когда `electron-updater` сообщает о доступном обновлении, система ДОЛЖНА транслировать рендереру состояние `available`, включающее версию обновления, дату релиза и заметки о релизе, через `update:stateChanged`.
