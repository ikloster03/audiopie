## ADDED Requirements

### Requirement: Correctly sized Linux application icon
The Linux AppImage build SHALL ship an application icon that renders uncropped and at the correct aspect ratio/resolution in standard Linux file managers and application launchers.

**RU:** AppImage-сборка для Linux ДОЛЖНА содержать иконку приложения, которая отображается без обрезки и с корректным соотношением сторон/разрешением в стандартных файловых менеджерах и лаунчерах приложений Linux.

#### Scenario: View the app icon in a file manager
- **WHEN** a user views the built AppImage or its extracted `.desktop`/icon entry in a Linux file manager or application launcher
- **THEN** the icon SHALL display as a complete, uncropped square image consistent with the app's macOS and Windows icons, not a partially cropped or stretched fragment
- **RU:** Когда пользователь просматривает собранный AppImage или его извлечённую запись `.desktop`/иконки в файловом менеджере или лаунчере приложений Linux, иконка ДОЛЖНА отображаться как целостное, необрезанное квадратное изображение, соответствующее иконкам приложения для macOS и Windows, а не частично обрезанный или растянутый фрагмент.

#### Scenario: Build produces the icon from a valid source
- **WHEN** `electron-builder` packages the Linux target
- **THEN** it SHALL use an icon source (single square PNG at a standard high resolution, or a multi-resolution icon set) that meets `electron-builder`'s documented Linux icon requirements, avoiding the previous malformed/cropped source
- **RU:** Когда `electron-builder` упаковывает Linux-таргет, он ДОЛЖЕН использовать источник иконки (одиночный квадратный PNG стандартного высокого разрешения или набор иконок нескольких разрешений), соответствующий документированным требованиям `electron-builder` к иконкам для Linux, избегая прежнего некорректного/обрезанного источника.
