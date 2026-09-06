## MODIFIED Requirements

### Requirement: Persistent application settings
The system SHALL persist application settings including FFmpeg/FFprobe paths, default bitrate, default output directory, FFmpeg thread count, theme, language, auto-update preference, last update check timestamp, and sidebar mode (`expanded` | `minimal`, default `expanded`) across app restarts using `electron-store`.

**RU:** Система ДОЛЖНА сохранять настройки, включая `sidebarMode` (`expanded` | `minimal`, по умолчанию `expanded`), через `electron-store`.

#### Scenario: Sidebar mode survives restart
- **WHEN** the user sets sidebar mode to `minimal` and later restarts the app
- **THEN** the system SHALL restore `minimal` from settings and render the compact sidebar
- **RU:** Когда пользователь включает минимальный сайдбар и перезапускает приложение, система ДОЛЖНА восстановить `minimal` из настроек.

### Requirement: Settings workspace page
The system SHALL present settings as a workspace section/page reachable from the sidebar, not as a modal dialog. Changing sidebar mode from that page SHALL persist immediately. Other settings SHALL apply when the user saves the settings form.

**RU:** Система ДОЛЖНА показывать настройки страницей раздела сайдбара, не модалкой. Смена вида сайдбара сохраняется сразу; остальные поля — по сохранению формы.

#### Scenario: Open settings
- **WHEN** the user selects Settings in the sidebar
- **THEN** the system SHALL render the settings form in the main content area and SHALL query `settings/getMaxCpuCores` to cap the FFmpeg threads input
- **RU:** Когда пользователь открывает Настройки в сайдбаре, система ДОЛЖНА показать форму в основной области и запросить `settings/getMaxCpuCores` для ограничения потоков FFmpeg.
