## 1. Asset preparation

- [ ] 1.1 Re-export `assets/audiopie.svg` as a square PNG at 1024x1024 (or another standard high resolution) with no padding/cropping, saved as e.g. `assets/audiopie-linux.png` (RU: заново экспортировать `assets/audiopie.svg` в квадратный PNG 1024x1024 (или другого стандартного высокого разрешения) без отступов/обрезки, сохранив, например, как `assets/audiopie-linux.png`)
- [ ] 1.2 Visually inspect the exported PNG (dimensions, transparency, centering) before wiring it into the build (RU: визуально проверить экспортированный PNG (размеры, прозрачность, центрирование) перед подключением в сборку)

## 2. Build configuration

- [ ] 2.1 Update `electron-builder.json`'s `linux.icon` to reference the new asset (RU: обновить `linux.icon` в `electron-builder.json`, указав на новый файл)
- [ ] 2.2 Build the AppImage locally (`npm run build`, Linux target) and confirm the artifact is produced without errors (RU: собрать AppImage локально (`npm run build`, таргет Linux) и убедиться, что артефакт создаётся без ошибок)

## 3. Verification

- [ ] 3.1 Extract the built AppImage (e.g. `--appimage-extract`) and inspect the resulting icon file(s) for correct dimensions/aspect ratio (RU: извлечь собранный AppImage (например, через `--appimage-extract`) и проверить итоговый файл(ы) иконки на корректные размеры/соотношение сторон)
- [ ] 3.2 If possible, visually confirm the icon renders correctly in a Linux file manager/launcher (matching the maintainer's follow-up screenshot on issue #31) (RU: по возможности визуально подтвердить, что иконка корректно отображается в файловом менеджере/лаунчере Linux (соответствует скриншоту мейнтейнера из issue #31))
- [ ] 3.3 If a single-resolution PNG proves insufficient, switch to a multi-resolution icon directory per `electron-builder`'s Linux icon docs and re-verify (RU: если одноразрешённого PNG окажется недостаточно, перейти на директорию иконок нескольких разрешений согласно документации `electron-builder` для Linux и повторно проверить)
