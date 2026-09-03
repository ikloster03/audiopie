## ADDED Requirements

### Requirement: Component-level unit test coverage
The system SHALL have unit tests for key renderer-side logic: chapter list rendering/editing behavior, track list rendering/editing behavior, metadata form field handling, and `AppContext` state transitions (project open/new/close, tracks/chapters/metadata updates). Tests SHALL run under a DOM-capable test environment.

**RU:** Система ДОЛЖНА иметь юнит-тесты для ключевой логики рендерер-части: отображение/редактирование списка глав, отображение/редактирование списка треков, обработка полей формы метаданных и переходы состояния `AppContext` (открытие/создание/закрытие проекта, обновление треков/глав/метаданных). Тесты ДОЛЖНЫ выполняться в тестовом окружении с поддержкой DOM.

#### Scenario: Run component tests
- **WHEN** a developer runs `npm test` (or the component-test-specific script)
- **THEN** the test runner SHALL execute all component/unit test files under a DOM-capable environment and report pass/fail per test
- **RU:** Когда разработчик запускает `npm test` (или скрипт, специфичный для компонентных тестов), тестовый раннер ДОЛЖЕН выполнить все файлы компонентных/юнит-тестов в окружении с поддержкой DOM и сообщить результат по каждому тесту.

### Requirement: Integration test coverage for the Node.js + FFmpeg pipeline
In addition to the existing FFmpeg smoke test, the system SHALL have integration tests covering: multi-track probing with a mix of valid and invalid files, chapter/metadata/cover embedding correctness in the finalized output, build cancellation cleanup, and error surfacing when FFmpeg/FFprobe binaries cannot be resolved.

**RU:** В дополнение к существующему smoke-тесту FFmpeg система ДОЛЖНА иметь интеграционные тесты, покрывающие: определение длительности нескольких треков со смесью валидных и невалидных файлов, корректность встраивания глав/метаданных/обложки в финальный файл, очистку при отмене сборки и сообщение об ошибке, когда бинарники FFmpeg/FFprobe не удаётся определить.

#### Scenario: Run integration tests
- **WHEN** the integration test suite runs (locally or in CI)
- **THEN** it SHALL generate any required temporary audio fixtures on the fly (not committed binary files), exercise the build pipeline through `electron/main/ffmpeg.ts`, and clean up temporary files afterward regardless of pass/fail
- **RU:** Когда выполняется набор интеграционных тестов (локально или в CI), он ДОЛЖЕН генерировать необходимые временные аудиофикстуры на лету (не закоммиченные бинарные файлы), прогонять сборку через `electron/main/ffmpeg.ts` и удалять временные файлы по завершении независимо от результата.

### Requirement: End-to-end test coverage for the desktop app
The system SHALL have at least one end-to-end test that drives the Electron app through a realistic user flow: create a new project, add tracks, generate chapters, edit metadata, start a build, and verify the output file is produced.

**RU:** Система ДОЛЖНА иметь как минимум один сквозной (e2e) тест, который управляет Electron-приложением через реалистичный пользовательский сценарий: создать новый проект, добавить треки, сгенерировать главы, отредактировать метаданные, запустить сборку и проверить, что выходной файл создан.

#### Scenario: Run the e2e suite
- **WHEN** the e2e test suite runs against a built or dev instance of the app
- **THEN** it SHALL launch the actual Electron app process, drive it via UI automation, and assert that the final `.m4b` output file exists and is non-empty at the end of the flow
- **RU:** Когда набор e2e-тестов запускается на собранном или dev-экземпляре приложения, он ДОЛЖЕН запустить реальный процесс Electron-приложения, управлять им через UI-автоматизацию и проверить, что итоговый `.m4b`-файл существует и не пуст в конце сценария.

### Requirement: CI runs all test tiers
The system's CI pipeline SHALL run unit/component tests, integration tests, and e2e tests on every push and pull request targeting the main branch, and SHALL fail the workflow if any tier fails.

**RU:** CI-конвейер системы ДОЛЖЕН запускать юнит/компонентные тесты, интеграционные тесты и e2e-тесты при каждом push и pull request в основную ветку, и ДОЛЖЕН завершать workflow с ошибкой, если какой-либо уровень тестов не проходит.

#### Scenario: A test fails in CI
- **WHEN** any test in any of the three tiers fails during a CI run
- **THEN** the CI workflow SHALL report a failed status on the commit/PR, blocking merge per the project's branch protection expectations
- **RU:** Когда любой тест в любом из трёх уровней падает во время прогона CI, workflow ДОЛЖЕН сообщить о неуспешном статусе на коммите/PR, блокируя слияние согласно ожиданиям защиты ветки проекта.
