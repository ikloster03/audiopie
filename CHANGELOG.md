# Changelog

## Unreleased

### ⚠️ Breaking Changes

- **project:** `.audiopie` files are now ZIP containers instead of plain JSON, supporting both single audiobooks and multi-book series in one file. Opening old plain-JSON `.audiopie` files still works and they are transparently upgraded to the new container format the first time they're saved, but **this upgrade is one-directional** — once saved in the new format, a file can no longer be opened by older versions of AudioPie.

### 🚀 Enhancements

- **project:** Add series support — a single `.audiopie` file can now contain multiple books, with a dedicated Series page for managing series metadata, member book order, and adding/removing/extracting books.
- **settings:** Add a "danger zone" to switch a project's type between Audiobook and Series after creation.

## v0.7.0

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.15...v0.7.0)

### 🚀 Enhancements

- **opsx:** Add new experimental commands for workflow management including apply, archive, bulk archive, continue, explore, fast forward, new, and onboarding ([75a0c9c](https://github.com/ikloster03/audiopie/commit/75a0c9c))
- **openspec:** Initialize OpenSpec configuration and document existing capabilities for AudioPie project ([a0c0e17](https://github.com/ikloster03/audiopie/commit/a0c0e17))
- **redesign-project-workspace:** Add discord-like sidebar + tg-like float button ([ea42e6c](https://github.com/ikloster03/audiopie/commit/ea42e6c))

### 📖 Documentation

- Add new changes ([3e934da](https://github.com/ikloster03/audiopie/commit/3e934da))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.15

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.14...v0.6.15)

### 🏡 Chore

- **dependencies:** Update package versions and improve configuration files ([6c9d744](https://github.com/ikloster03/audiopie/commit/6c9d744))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.14

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.13...v0.6.14)

### 🚀 Enhancements

- **icon:** Update macOS icon handling and add icon generation script ([e9ab9ec](https://github.com/ikloster03/audiopie/commit/e9ab9ec))

### 🩹 Fixes

- **dependencies:** Update electron to v32.3.3 and cross-env to v10.1.0 ([b7bd149](https://github.com/ikloster03/audiopie/commit/b7bd149))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.13

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.12...v0.6.13)

### 🚀 Enhancements

- **i18n:** Add translation for menu ([55de971](https://github.com/ikloster03/audiopie/commit/55de971))
- **electron-builder:** Add support for zip files in release artifacts ([80fa59c](https://github.com/ikloster03/audiopie/commit/80fa59c))

### 🩹 Fixes

- **build:** Include zip files in artifact upload process ([6bc4417](https://github.com/ikloster03/audiopie/commit/6bc4417))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.12

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.11...v0.6.12)

### 🚀 Enhancements

- **UpdateNotificationDialog:** Add HTML parsing for release notes ([28b0877](https://github.com/ikloster03/audiopie/commit/28b0877))
- **electron-builder:** Add zip target for macOS builds ([0f99038](https://github.com/ikloster03/audiopie/commit/0f99038))
- **updater:** Enhance update progress handling and localization ([fc7ddba](https://github.com/ikloster03/audiopie/commit/fc7ddba))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.11

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.10...v0.6.11)

### 🩹 Fixes

- **ffmpeg:** Enforce minimum of 1 for FFmpeg threads and update related settings ([f3e173d](https://github.com/ikloster03/audiopie/commit/f3e173d))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.10

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.9...v0.6.10)

### 🚀 Enhancements

- **electron:** Add support for DevTools in production mode and update build script ([6f4f9b2](https://github.com/ikloster03/audiopie/commit/6f4f9b2))
- **electron-builder:** Configure GitHub as the publishing provider ([cecb40a](https://github.com/ikloster03/audiopie/commit/cecb40a))

### 🩹 Fixes

- **build:** Update build command to prevent automatic publishing ([c0281ad](https://github.com/ikloster03/audiopie/commit/c0281ad))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.9

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.8...v0.6.9)

### 📖 Documentation

- Add security warnings and installation notes for macOS and Windows ([1ac657e](https://github.com/ikloster03/audiopie/commit/1ac657e))
- Update tab references from "Metadata" to "Basic" ([ba14747](https://github.com/ikloster03/audiopie/commit/ba14747))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.8

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.7...v0.6.8)

### 🚀 Enhancements

- **electron:** Set application name and update icon path for macOS ([f09d0e6](https://github.com/ikloster03/audiopie/commit/f09d0e6))
- **branding:** Update logo and icons to new color scheme and design ([8c818c0](https://github.com/ikloster03/audiopie/commit/8c818c0))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.7

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.6...v0.6.7)

### 🚀 Enhancements

- **scripts:** Add ico generation ([bde950b](https://github.com/ikloster03/audiopie/commit/bde950b))
- **docs:** Update README and logo for improved branding ([871d0f9](https://github.com/ikloster03/audiopie/commit/871d0f9))

### 💅 Refactors

- **electron-builder:** Add new icons ([4259001](https://github.com/ikloster03/audiopie/commit/4259001))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.6

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.5...v0.6.6)

### 🩹 Fixes

- Remove GitHub publish configuration from electron-builder.json ([3311d08](https://github.com/ikloster03/audiopie/commit/3311d08))
- **husky:** Add NVM loading for macOS in commit-msg and pre-push hooks ([109f0e1](https://github.com/ikloster03/audiopie/commit/109f0e1))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.5

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.4...v0.6.5)

### 🚀 Enhancements

- Add initial configuration and documentation files for AudioPie project ([f354195](https://github.com/ikloster03/audiopie/commit/f354195))
- **update:** Implement automatic update functionality ([12de29e](https://github.com/ikloster03/audiopie/commit/12de29e))

### 🩹 Fixes

- ⚠️  Package lock version ([2dd7775](https://github.com/ikloster03/audiopie/commit/2dd7775))
- **menu:** Enhance macOS menu with application-specific options and improve edit menu functionality ([b82b80c](https://github.com/ikloster03/audiopie/commit/b82b80c))
- **tests:** Address code review feedback ([1fd7d4e](https://github.com/ikloster03/audiopie/commit/1fd7d4e))
- **update:** Address code review feedback ([794ff2e](https://github.com/ikloster03/audiopie/commit/794ff2e))

### 📖 Documentation

- Add comprehensive CLAUDE.md guide for AI assistants ([aadd49d](https://github.com/ikloster03/audiopie/commit/aadd49d))
- Fix technical inaccuracies in CLAUDE.md ([ca74fa7](https://github.com/ikloster03/audiopie/commit/ca74fa7))

### ✅ Tests

- **ffmpeg:** Add smoke e2e tests for FFmpeg integration ([4db3f16](https://github.com/ikloster03/audiopie/commit/4db3f16))

#### ⚠️ Breaking Changes

- ⚠️  Package lock version ([2dd7775](https://github.com/ikloster03/audiopie/commit/2dd7775))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>
- Claude <noreply@anthropic.com>

## v0.6.4

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.3...v0.6.4)

### 🚀 Enhancements

- **menu:** Implement dynamic menu rebuilding and add "About" dialog functionality ([acb6648](https://github.com/ikloster03/audiopie/commit/acb6648))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.3

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.2...v0.6.3)

### 🚀 Enhancements

- Initialize Docusaurus documentation with configuration, structure, and localization support ([ce3cc3b](https://github.com/ikloster03/audiopie/commit/ce3cc3b))
- Add Russian localization to README and create README_RU.md for multilingual support ([4094d1c](https://github.com/ikloster03/audiopie/commit/4094d1c))
- Conditionally enable DevTools in development mode ([f3de5f8](https://github.com/ikloster03/audiopie/commit/f3de5f8))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.2

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.1...v0.6.2)

### 🚀 Enhancements

- **i18n:** Enhance localization loading with improved path resolution and logging ([ab98a81](https://github.com/ikloster03/audiopie/commit/ab98a81))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.1

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.6.0...v0.6.1)

### 🚀 Enhancements

- Update versioning scripts to use changelogen for releases ([85ad811](https://github.com/ikloster03/audiopie/commit/85ad811))

### 📖 Documentation

- Add CHANGELOG.md for version history and updates ([059b6ee](https://github.com/ikloster03/audiopie/commit/059b6ee))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.6.0

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.5.5...v0.6.0)

### 🚀 Enhancements

- Enhance audiobook build process with detailed logging and notification support ([02b372e](https://github.com/ikloster03/audiopie/commit/02b372e))

### 🩹 Fixes

- Add drag-and-drop functionality for cover image ([d38f4d3](https://github.com/ikloster03/audiopie/commit/d38f4d3))
- Ts errors ([15d870d](https://github.com/ikloster03/audiopie/commit/15d870d))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.5.5

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.5.4...v0.5.5)

### 🚀 Enhancements

- Add FFmpeg localization strings for English and Russian ([ff2a24f](https://github.com/ikloster03/audiopie/commit/ff2a24f))
- Implement i18n support for English and Russian languages in main process ([5f3904c](https://github.com/ikloster03/audiopie/commit/5f3904c))

### 💅 Refactors

- Enhance error handling and progress messages with i18n support in FFmpeg module ([bb2fdc8](https://github.com/ikloster03/audiopie/commit/bb2fdc8))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.5.4

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.5.3...v0.5.4)

### 🩹 Fixes

- Update project file extension handling in save and open dialogs ([a52138f](https://github.com/ikloster03/audiopie/commit/a52138f))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.5.3

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.5.2...v0.5.3)

### 🩹 Fixes

- Add application icon to electron-builder configuration ([f8127b5](https://github.com/ikloster03/audiopie/commit/f8127b5))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.5.2

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.5.1...v0.5.2)

### 🚀 Enhancements

- Update logo to use new SVG asset and adjust styles for better image handling ([2a18ce5](https://github.com/ikloster03/audiopie/commit/2a18ce5))

### 🩹 Fixes

- Add PostCSS configuration and SCSS preprocessor options in Vite config ([df359ce](https://github.com/ikloster03/audiopie/commit/df359ce))
- Update dialog component styles to use new background and text color variables ([05c1feb](https://github.com/ikloster03/audiopie/commit/05c1feb))

### 💅 Refactors

- Implement BEM styling for Button component and add SCSS styles ([5a6eee6](https://github.com/ikloster03/audiopie/commit/5a6eee6))
- Implement BEM styling for Alert component and add SCSS styles ([dd9a60e](https://github.com/ikloster03/audiopie/commit/dd9a60e))
- Implement BEM styling for UI components and add corresponding SCSS styles ([2fbdfb2](https://github.com/ikloster03/audiopie/commit/2fbdfb2))
- Reorganize BEM component style imports in globals.scss and streamline button styles ([eaf8617](https://github.com/ikloster03/audiopie/commit/eaf8617))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.5.1

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.5.0...v0.5.1)

### 🚀 Enhancements

- Update Tailwind CSS configuration and dependencies ([9dfa5f3](https://github.com/ikloster03/audiopie/commit/9dfa5f3))

### 💅 Refactors

- Migrate styles to SCSS and implement BEM methodology across components ([8b07125](https://github.com/ikloster03/audiopie/commit/8b07125))

### 📖 Documentation

- Add BEM implementation guide ([ac1270f](https://github.com/ikloster03/audiopie/commit/ac1270f))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.5.0

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.4.4...v0.5.0)

### 🚀 Enhancements

- Add commitlint and husky for improved commit message validation ([f2e3ff6](https://github.com/ikloster03/audiopie/commit/f2e3ff6))
- Enhance commit message guidelines with automated validation details ([f1441a5](https://github.com/ikloster03/audiopie/commit/f1441a5))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.4.4

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.4.3...v0.4.4)

## v0.4.3

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.4.2...v0.4.3)

## v0.4.2

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.4.1...v0.4.2)

## v0.4.1

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.4.0...v0.4.1)

## v0.4.0

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.3.2...v0.4.0)

## v0.3.2

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.3.1...v0.3.2)

### 🩹 Fixes

- Improve artifact upload process in GitHub Actions workflow ([02bc3cf](https://github.com/ikloster03/audiopie/commit/02bc3cf))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.3.1

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.3.0...v0.3.1)

### 🩹 Fixes

- Update release job dependencies and upload step in GitHub Actions workflow ([f329048](https://github.com/ikloster03/audiopie/commit/f329048))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.3.0

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.2.3...v0.3.0)

## v0.2.3

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.2.2...v0.2.3)

### 🩹 Fixes

- Update Button variant in App component for consistent styling ([a4fa96b](https://github.com/ikloster03/audiopie/commit/a4fa96b))
- Update key prop in ChapterRow and refactor handleChange in MetadataForm for improved performance ([3f68947](https://github.com/ikloster03/audiopie/commit/3f68947))
- Update GitHub Actions workflow to grant write permissions for release job ([8fd918f](https://github.com/ikloster03/audiopie/commit/8fd918f))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.2.2

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.2.1...v0.2.2)

### 🚀 Enhancements

- Enhance GitHub Actions workflow for release automation ([49e0b3d](https://github.com/ikloster03/audiopie/commit/49e0b3d))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.2.1

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.2.0...v0.2.1)

### 🚀 Enhancements

- Integrate shadcn/ui components and Tailwind CSS for enhanced UI ([9b5d7c9](https://github.com/ikloster03/audiopie/commit/9b5d7c9))

### 🏡 Chore

- Update GitHub Actions workflow for multi-OS support ([193699c](https://github.com/ikloster03/audiopie/commit/193699c))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.2.0

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.1.4...v0.2.0)

### 🚀 Enhancements

- Enhance FFmpeg integration with dynamic path resolution ([46854a4](https://github.com/ikloster03/audiopie/commit/46854a4))
- Enhance audiobook build progress tracking with detailed steps ([44b27b8](https://github.com/ikloster03/audiopie/commit/44b27b8))
- Implement parallel processing for audiobook encoding ([21ef85a](https://github.com/ikloster03/audiopie/commit/21ef85a))
- Update version and enhance cover image handling in MetadataForm ([c7fd443](https://github.com/ikloster03/audiopie/commit/c7fd443))
- Add setMetadata function to context in App component ([17c78df](https://github.com/ikloster03/audiopie/commit/17c78df))
- Update body text color in app.css for improved readability ([5541a16](https://github.com/ikloster03/audiopie/commit/5541a16))

### 🏡 Chore

- Update audio processing to use fluent-ffmpeg and ffmpeg-static ([5d815de](https://github.com/ikloster03/audiopie/commit/5d815de))
- Refine GitHub Actions workflow for artifact handling ([73ba853](https://github.com/ikloster03/audiopie/commit/73ba853))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.1.4

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.1.3...v0.1.4)

### 🏡 Chore

- Update GitHub Actions workflow permissions ([02bc726](https://github.com/ikloster03/audiopie/commit/02bc726))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.1.3

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.1.2...v0.1.3)

### 🏡 Chore

- Update configuration for Electron build and GitHub Actions workflow ([7b052f3](https://github.com/ikloster03/audiopie/commit/7b052f3))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.1.2

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.1.1...v0.1.2)

### 🏡 Chore

- Simplify GitHub Actions workflow to target only Windows environment ([e08afb1](https://github.com/ikloster03/audiopie/commit/e08afb1))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.1.1

[compare changes](https://github.com/ikloster03/audiopie/compare/v0.1.0...v0.1.1)

### 🚀 Enhancements

- Implement core functionality for AudioPie application ([ed88533](https://github.com/ikloster03/audiopie/commit/ed88533))

### 🏡 Chore

- Update GitHub Actions workflow to trigger on version tags only ([cf14e84](https://github.com/ikloster03/audiopie/commit/cf14e84))
- Update package.json for improved script management and dependency organization ([929f873](https://github.com/ikloster03/audiopie/commit/929f873))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

## v0.1.0

[compare changes](https://github.com/ikloster03/audiopie/compare/d5d954e59353cc7a700678d1c2019f4dcd075348...v0.1.0)

### 🚀 Enhancements

- Integrate electron-vite for improved development experience ([f7bb502](https://github.com/ikloster03/audiopie/commit/f7bb502))
- Add comprehensive documentation rules for project context, development, and security ([934115b](https://github.com/ikloster03/audiopie/commit/934115b))
- Enhance FFmpeg and FFprobe integration with error handling and automatic path resolution ([c3b357f](https://github.com/ikloster03/audiopie/commit/c3b357f))

### 🩹 Fixes

- Execa ([5bd56ef](https://github.com/ikloster03/audiopie/commit/5bd56ef))

### 💅 Refactors

- Update asset handling and improve UI elements ([9b3ca59](https://github.com/ikloster03/audiopie/commit/9b3ca59))

### 🎨 Styles

- Update text colors for improved UI consistency ([f58e7ea](https://github.com/ikloster03/audiopie/commit/f58e7ea))

### ❤️ Contributors

- Ivan Monastyrev <ikloster@yandex.ru>

