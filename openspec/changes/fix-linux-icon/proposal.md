## Why

The Linux AppImage build's application icon renders cropped/incorrectly sized in file managers and app launchers (see the screenshot attached to the issue), unlike the macOS and Windows builds. This is a visible polish bug affecting first impressions on Linux. Addresses GitHub issue [#31](https://github.com/ikloster03/audiopie/issues/31) (bug).

**RU:** Иконка приложения в AppImage-сборке для Linux отображается обрезанной/некорректного размера в файловых менеджерах и лаунчерах приложений (см. скриншот в issue), в отличие от сборок для macOS и Windows. Это заметный визуальный баг, влияющий на первое впечатление на Linux. Закрывает issue #31 (bug).

## What Changes

- Provide a properly prepared Linux icon source: a square PNG at a standard high resolution (e.g. 512x512 or 1024x1024) with no unintended padding/cropping, following `electron-builder`'s Linux icon guidance (either a single large square PNG, from which electron-builder generates the icon set, or a directory of standard-sized PNGs).
  - **RU:** Подготовить корректный исходник иконки для Linux: квадратный PNG стандартного высокого разрешения (например, 512x512 или 1024x1024) без нежелательных отступов/обрезки, по рекомендациям `electron-builder` для Linux-иконок (либо один большой квадратный PNG, из которого electron-builder сгенерирует набор иконок, либо директория PNG стандартных размеров).
- Update `electron-builder.json`'s `linux.icon` to point at the corrected asset.
  - **RU:** Обновить `linux.icon` в `electron-builder.json`, указав на исправленный файл.
- If a single-resolution PNG proves insufficient across different desktop environments/icon themes, provide a multi-resolution icon set instead (a directory of `16x16`, `32x32`, `48x48`, `64x64`, `128x128`, `256x256`, `512x512` PNGs, as `electron-builder` supports).
  - **RU:** Если одноразрешённого PNG окажется недостаточно для разных окружений рабочего стола/тем иконок, предоставить набор иконок нескольких разрешений (директорию PNG размеров `16x16`, `32x32`, `48x48`, `64x64`, `128x128`, `256x256`, `512x512`, как поддерживает `electron-builder`).
- Verify the fix by building the AppImage locally (or in CI) and inspecting the icon in a Linux file manager/launcher.
  - **RU:** Проверить исправление, собрав AppImage локально (или в CI) и осмотрев иконку в файловом менеджере/лаунчере Linux.

## Capabilities

### New Capabilities
- `linux-packaging`: Defines the requirement that the Linux AppImage build SHALL ship a correctly sized, uncropped application icon.
  - **RU:** Определяет требование о том, что сборка AppImage для Linux ДОЛЖНА содержать иконку приложения корректного размера, без обрезки.

## Impact

- `assets/`: add/replace a corrected Linux icon asset (e.g. `assets/audiopie-linux.png` or an `assets/icons/` directory with multiple sizes).
- `electron-builder.json`: update `linux.icon`.
- No renderer/main process code changes expected — this is a packaging/build-config-only fix.

**RU:** `assets/` — добавить/заменить исправленный файл иконки для Linux (например, `assets/audiopie-linux.png` или директория `assets/icons/` с несколькими размерами). `electron-builder.json` — обновить `linux.icon`. Изменений в коде рендерера/главного процесса не ожидается — это исправление только на уровне упаковки/конфигурации сборки.
