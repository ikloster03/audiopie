## Context

`electron-builder.json` currently points `linux.icon` at `assets/audiopie.png` (a single 21KB PNG). The macOS build uses a dedicated `assets/audiopie-mac.png`, and Windows uses `assets/audiopie.ico`, suggesting the Linux icon was never given the same per-platform care. The maintainer's own follow-up comment on the issue shows a corrected icon render, indicating the fix is primarily an asset-preparation problem rather than a config wiring problem.

**RU:** Сейчас `electron-builder.json` указывает `linux.icon` на `assets/audiopie.png` (один PNG размером 21КБ). Сборка macOS использует отдельный `assets/audiopie-mac.png`, а Windows — `assets/audiopie.ico`, что говорит о том, что иконке для Linux никогда не уделялось такое же внимание, как для других платформ. Собственный комментарий мейнтейнера в issue с исправленным рендером иконки указывает на то, что проблема в основном в подготовке ассета, а не в настройке конфигурации.

## Goals / Non-Goals

**Goals:**
- Produce a Linux icon asset that displays correctly across common file managers/launchers.
- Keep the fix scoped to packaging assets/config — no application code changes.

**RU (цели):** Подготовить файл иконки для Linux, который корректно отображается в распространённых файловых менеджерах/лаунчерах. Ограничить исправление ассетами/конфигурацией упаковки — без изменений кода приложения.

**Non-Goals:**
- Redesigning the app icon/logo itself (only fixing how the existing logo is exported/packaged for Linux).
- Auto-generating platform icons from a single master source via a build script — a manual, verified asset swap is sufficient to close this bug; tooling for that could be a separate future improvement.

**RU (не цели):** Редизайн самой иконки/логотипа приложения (только исправление того, как существующий логотип экспортируется/упаковывается для Linux). Автоматическая генерация иконок для всех платформ из единого мастер-источника через build-скрипт — для закрытия этого бага достаточно ручной, проверенной замены ассета; соответствующая автоматизация может стать отдельным будущим улучшением.

## Decisions

- **Start with a single square high-resolution PNG** (matching `electron-builder`'s simplest supported Linux icon input), re-exported from the existing source artwork (`assets/audiopie.svg`) at e.g. 1024x1024 with no padding/cropping, before reaching for a full multi-resolution icon directory.
  - *Alternative considered*: multi-resolution icon set (`16`–`512` px directory) from the start. Deferred unless the single-PNG approach is verified insufficient, to keep the fix minimal and easy to verify.
  - **RU:** Начать с одного квадратного PNG высокого разрешения (соответствующего простейшему поддерживаемому `electron-builder` варианту Linux-иконки), заново экспортированного из существующего исходника (`assets/audiopie.svg`), например, в 1024x1024 без отступов/обрезки, прежде чем переходить к полной директории иконок нескольких разрешений. *Рассмотренная альтернатива*: набор иконок нескольких разрешений (директория `16`–`512` px) сразу. Отложено, если не будет подтверждено, что одиночного PNG недостаточно, чтобы сохранить исправление минимальным и легко проверяемым.
- **Re-derive from the existing SVG source** (`assets/audiopie.svg`) rather than re-cropping the existing flawed PNG, since the SVG is vector and avoids compounding whatever export issue produced the current cropped PNG.
  - **RU:** Заново получить иконку из существующего SVG-исходника (`assets/audiopie.svg`), а не обрезать существующий некорректный PNG, поскольку SVG векторный и позволяет избежать наложения той же проблемы экспорта, которая привела к текущему обрезанному PNG.

## Risks / Trade-offs

- [Risk] Without access to a Linux desktop environment for manual verification, the fix could be re-exported but still visually wrong in some launcher/theme → Mitigation: verify by extracting the built AppImage locally and inspecting the icon file directly (e.g. via `appimagetool`/`--appimage-extract` or checking the generated `.desktop`/icon files), and cross-check dimensions/aspect ratio programmatically even without a full Linux desktop session.
  - **RU:** [Риск] Без доступа к окружению рабочего стола Linux для ручной проверки исправленная иконка может быть заново экспортирована, но всё равно отображаться неверно в каком-то лаунчере/теме → Смягчение: проверить, извлекая собранный AppImage локально и осматривая файл иконки напрямую (например, через `appimagetool`/`--appimage-extract` или проверив сгенерированные файлы `.desktop`/иконки), а также программно сверить размеры/соотношение сторон даже без полноценной сессии рабочего стола Linux.
- [Trade-off] Fixing this with a manual asset swap (vs. an automated multi-size icon generation pipeline) means future logo updates require the same manual re-export step for Linux — acceptable given how infrequently the app icon changes.
  - **RU:** [Компромисс] Исправление через ручную замену ассета (вместо автоматизированного конвейера генерации иконок нескольких размеров) означает, что будущие обновления логотипа потребуют такого же ручного повторного экспорта для Linux — приемлемо с учётом того, как редко меняется иконка приложения.
