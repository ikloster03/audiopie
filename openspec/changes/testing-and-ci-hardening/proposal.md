## Why

AudioPie's automated test suite currently consists solely of FFmpeg smoke tests (`tests/ffmpeg.smoke.test.ts`) — there are no component-level unit tests for React components or IPC/context logic, no integration tests exercising the Node.js + FFmpeg pipeline beyond that smoke test, and no end-to-end tests driving the packaged desktop app. This makes regressions in UI logic (chapter generation, metadata handling, settings) and cross-process behavior easy to miss. Additionally, the AI-assisted development workflow (Cursor rules) doesn't yet enforce running type checks and tests after each change, so regressions can slip through even when a human isn't reviewing every diff. Addresses GitHub issues [#39](https://github.com/ikloster03/audiopie/issues/39) and [#40](https://github.com/ikloster03/audiopie/issues/40).

**RU:** Автоматические тесты AudioPie сейчас состоят только из smoke-тестов FFmpeg (`tests/ffmpeg.smoke.test.ts`) — нет юнит-тестов компонентов React или логики IPC/контекста, нет интеграционных тестов, проверяющих связку Node.js + FFmpeg за пределами этого smoke-теста, и нет e2e-тестов, управляющих собранным desktop-приложением. Это делает регрессии в логике UI (генерация глав, обработка метаданных, настройки) и в межпроцессном взаимодействии легко пропускаемыми. Кроме того, процесс разработки с помощью AI (правила Cursor) пока не требует прогонять проверку типов и тесты после каждого изменения. Закрывает issues #39 и #40.

## What Changes

- Add component-level unit tests for key React components/hooks: `ChapterList`, `TrackList`, `MetadataForm`, `AppContext` reducers/state transitions.
  - **RU:** Добавить компонентные юнит-тесты для ключевых React-компонентов/хуков: `ChapterList`, `TrackList`, `MetadataForm`, переходы состояния `AppContext`.
- Add integration tests exercising the Node.js main-process + FFmpeg pipeline beyond the existing smoke test: probing, encoding, chapter/metadata embedding, cancellation, error paths (building on the pattern already established in `tests/ffmpeg.smoke.test.ts`).
  - **RU:** Добавить интеграционные тесты, проверяющие связку главного процесса Node.js + FFmpeg за пределами существующего smoke-теста: определение длительности, кодирование, встраивание глав/метаданных, отмену, сценарии ошибок (на основе паттерна, уже заданного в `tests/ffmpeg.smoke.test.ts`).
- Add end-to-end tests driving the packaged/dev Electron app (e.g. via Playwright's Electron support) covering at least: create project → add tracks → generate chapters → edit metadata → build → verify output exists.
  - **RU:** Добавить e2e-тесты, управляющие собранным/dev-приложением Electron (например, через поддержку Electron в Playwright), покрывающие как минимум: создание проекта → добавление треков → генерация глав → редактирование метаданных → сборка → проверка наличия результата.
- Wire all three test tiers into `.github/workflows/build.yml` (or a dedicated workflow) so they run in CI on push/PR.
  - **RU:** Подключить все три уровня тестов в `.github/workflows/build.yml` (или отдельный workflow), чтобы они запускались в CI при push/PR.
- Update `.cursor/rules` (and/or `CLAUDE.md`) so AI-assisted changes are expected to run `npm run typecheck` and relevant unit tests after each prompt/change, catching regressions before they're committed.
  - **RU:** Обновить `.cursor/rules` (и/или `CLAUDE.md`), чтобы изменения, вносимые с помощью AI, требовали запуска `npm run typecheck` и соответствующих юнит-тестов после каждого промпта/изменения, отлавливая регрессии до коммита.

## Capabilities

### New Capabilities
- `testing-strategy`: Defines the three testing tiers (unit/component, integration, e2e), what each SHALL cover, and how they run in CI.
  - **RU:** Определяет три уровня тестирования (юнит/компонентный, интеграционный, e2e), что каждый из них ДОЛЖЕН покрывать и как они запускаются в CI.
- `ai-assisted-dev-workflow`: Defines the expectation that AI-assisted edits SHALL be followed by a type check and relevant test run before being considered complete.
  - **RU:** Определяет требование, что изменения, вносимые с помощью AI, ДОЛЖНЫ сопровождаться проверкой типов и запуском соответствующих тестов, прежде чем считаться завершёнными.

## Impact

- `tests/` directory: new subfolders/files for component and e2e tests (e.g. `tests/components/*.test.tsx`, `tests/e2e/*.spec.ts`).
- `vitest.config.ts`: extend environment/config to support component testing (e.g. `jsdom`/`happy-dom` environment for React component tests, alongside the existing Node environment for FFmpeg tests) — likely via a second Vitest project/config or `environmentMatchGlobs`.
- New dependency: an Electron-aware e2e runner (e.g. `@playwright/test` with Electron support) and, for component tests, `@testing-library/react`.
- `.github/workflows/build.yml`: add/extend steps to run all test tiers.
- `.cursor/rules/*.mdc` and/or `CLAUDE.md`: add explicit post-change verification guidance.

**RU:** Директория `tests/` — новые подпапки/файлы для компонентных и e2e-тестов (например, `tests/components/*.test.tsx`, `tests/e2e/*.spec.ts`). `vitest.config.ts` — расширить окружение/конфигурацию для поддержки компонентного тестирования (например, окружение `jsdom`/`happy-dom` для тестов React-компонентов наряду с существующим Node-окружением для тестов FFmpeg) — вероятно через второй проект/конфиг Vitest или `environmentMatchGlobs`. Новая зависимость: e2e-раннер с поддержкой Electron (например, `@playwright/test`) и, для компонентных тестов, `@testing-library/react`. `.github/workflows/build.yml` — добавить/расширить шаги для запуска всех уровней тестов. `.cursor/rules/*.mdc` и/или `CLAUDE.md` — добавить явные указания по проверке после изменений.
