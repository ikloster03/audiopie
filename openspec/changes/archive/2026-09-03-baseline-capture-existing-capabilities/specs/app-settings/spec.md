## ADDED Requirements

### Requirement: Persistent application settings
The system SHALL persist application settings (FFmpeg/FFprobe binary paths, default bitrate, default output directory, FFmpeg thread count, theme, language, auto-update preference, last update check timestamp) across app restarts using `electron-store`, with defaults of: bitrate 128 kbps, 1 FFmpeg thread, light theme, English language, and auto-update checks enabled.

**RU:** Система ДОЛЖНА сохранять настройки приложения (пути к бинарникам FFmpeg/FFprobe, битрейт по умолчанию, директория вывода по умолчанию, количество потоков FFmpeg, тема, язык, настройка автообновления, время последней проверки обновлений) между перезапусками через `electron-store`, со значениями по умолчанию: битрейт 128 kbps, 1 поток FFmpeg, светлая тема, английский язык, автопроверка обновлений включена.

#### Scenario: Setting a value to undefined clears it
- **WHEN** `settings/set` is called with a field explicitly set to `undefined`
- **THEN** the system SHALL delete that key from the persisted store rather than storing `undefined`
- **RU:** Когда `settings/set` вызывается с полем, явно установленным в `undefined`, система ДОЛЖНА удалить этот ключ из хранилища, а не сохранять значение `undefined`.

### Requirement: Resolve FFmpeg/FFprobe binaries
The system SHALL resolve the FFmpeg and FFprobe executable paths in this priority order: (1) user-configured path in settings, if it exists on disk; (2) an executable found by searching the `PATH` environment variable; (3) a bundled `ffmpeg-static` binary, using the `asar.unpacked` path when the app is packaged; FFprobe additionally falls back to (4) a same-directory sibling of the resolved FFmpeg path, and packaged binaries also check `process.resourcesPath`.

**RU:** Система ДОЛЖНА определять пути к исполняемым файлам FFmpeg и FFprobe в следующем порядке приоритета: (1) путь, настроенный пользователем в настройках, если он существует на диске; (2) исполняемый файл, найденный поиском по переменной окружения `PATH`; (3) встроенный бинарник `ffmpeg-static`, используя путь `asar.unpacked`, когда приложение упаковано; для FFprobe дополнительно применяется резервный вариант (4) — файл рядом с найденным путём к FFmpeg, а для упакованных бинарников также проверяется `process.resourcesPath`.

#### Scenario: Configured path is stale
- **WHEN** the user-configured FFmpeg/FFprobe path in settings no longer exists on disk
- **THEN** the system SHALL fall back to the next resolution strategy (PATH search, then bundled/packaged binary) instead of failing immediately
- **RU:** Когда настроенный пользователем путь к FFmpeg/FFprobe больше не существует на диске, система ДОЛЖНА перейти к следующей стратегии определения пути (поиск в PATH, затем встроенный/упакованный бинарник) вместо немедленного сбоя.

### Requirement: Auto-detect binaries on startup
The system SHALL attempt to auto-detect and persist FFmpeg/FFprobe paths at startup only when no path is already configured in settings.

**RU:** Система ДОЛЖНА пытаться автоматически определить и сохранить пути к FFmpeg/FFprobe при запуске только в том случае, если путь ещё не настроен в настройках.

#### Scenario: Binaries already configured
- **WHEN** the app starts and `ffmpegPath`/`ffprobePath` are already set in settings
- **THEN** the system SHALL skip auto-detection for that binary and use the existing configured value
- **RU:** Когда приложение запускается и `ffmpegPath`/`ffprobePath` уже заданы в настройках, система ДОЛЖНА пропустить автоопределение для этого бинарника и использовать уже настроенное значение.

### Requirement: Report available CPU cores
The system SHALL expose the number of logical CPU cores available on the host, used by the settings UI to cap the maximum selectable FFmpeg thread count.

**RU:** Система ДОЛЖНА предоставлять количество логических ядер CPU хоста, используемое в UI настроек для ограничения максимального выбираемого количества потоков FFmpeg.

#### Scenario: Settings dialog opens
- **WHEN** the settings dialog is opened
- **THEN** the system SHALL query the host's logical CPU core count via `settings/getMaxCpuCores` and use it as the upper bound for the FFmpeg threads input
- **RU:** Когда открывается диалог настроек, система ДОЛЖНА запросить количество логических ядер CPU хоста через `settings/getMaxCpuCores` и использовать его как верхнюю границу для поля ввода потоков FFmpeg.

### Requirement: Theme and language persistence
The system SHALL persist the selected theme (`light`/`dark`) and language (`en`/`ru`) to settings, apply the theme to the document root immediately on change, and update the in-process i18n language and rebuild the application menu when the language changes via settings.

**RU:** Система ДОЛЖНА сохранять выбранную тему (`light`/`dark`) и язык (`en`/`ru`) в настройках, немедленно применять тему к корневому элементу документа при изменении и обновлять язык i18n в текущем процессе, пересобирая меню приложения при изменении языка через настройки.

#### Scenario: Change language via settings
- **WHEN** the user changes the language in settings and saves
- **THEN** the system SHALL persist the new language, update the renderer's active i18n language, mirror it to `localStorage`, and instruct the main process to switch its own translation locale and rebuild the native menu
- **RU:** Когда пользователь меняет язык в настройках и сохраняет, система ДОЛЖНА сохранить новый язык, обновить активный язык i18n в рендерере, продублировать его в `localStorage` и дать команду главному процессу переключить свою локаль перевода и пересобрать нативное меню.
