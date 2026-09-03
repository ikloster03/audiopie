## 1. Test infrastructure

- [ ] 1.1 Split `vitest.config.ts` into a workspace/projects config with a `node` environment (existing FFmpeg tests) and a `jsdom`/`happy-dom` environment (new component tests) (RU: разделить `vitest.config.ts` на workspace/projects-конфигурацию с окружением `node` (существующие тесты FFmpeg) и окружением `jsdom`/`happy-dom` (новые компонентные тесты))
- [ ] 1.2 Add `@testing-library/react` (and `@testing-library/jest-dom` if desired) as dev dependencies (RU: добавить `@testing-library/react` (и при желании `@testing-library/jest-dom`) в dev-зависимости)
- [ ] 1.3 Verify `tests/ffmpeg.smoke.test.ts` still passes unmodified after the config split (RU: проверить, что `tests/ffmpeg.smoke.test.ts` по-прежнему проходит без изменений после разделения конфигурации)

## 2. Component/unit tests

- [ ] 2.1 Add tests for `src/components/ChapterList.tsx`: empty state, generate/regenerate, title edit + debounce persistence (RU: добавить тесты для `src/components/ChapterList.tsx`: пустое состояние, генерация/перегенерация, редактирование названия + сохранение с debounce)
- [ ] 2.2 Add tests for `src/components/TrackList.tsx`: add/remove/rename/reorder behavior (RU: добавить тесты для `src/components/TrackList.tsx`: добавление/удаление/переименование/изменение порядка)
- [ ] 2.3 Add tests for `src/components/MetadataForm.tsx`: field edit persistence, clearing a field persists `undefined` (RU: добавить тесты для `src/components/MetadataForm.tsx`: сохранение изменений полей, очистка поля сохраняет `undefined`)
- [ ] 2.4 Add tests for `src/context/AppContext.tsx` state transitions: new/open/close project, tracks/chapters/metadata setters (RU: добавить тесты для переходов состояния `src/context/AppContext.tsx`: создание/открытие/закрытие проекта, сеттеры треков/глав/метаданных)

## 3. Integration tests

- [ ] 3.1 Add integration test: probing a mix of valid/invalid MP3 fixtures reports partial success correctly (RU: добавить интеграционный тест: определение длительности смеси валидных/невалидных MP3-фикстур корректно сообщает о частичном успехе)
- [ ] 3.2 Add integration test: built output embeds correct chapter markers and metadata (parse the output with ffprobe and assert) (RU: добавить интеграционный тест: собранный файл содержит корректные метки глав и метаданные (разобрать результат через ffprobe и проверить))
- [ ] 3.3 Add integration test: cancelling mid-build terminates FFmpeg processes and cleans up temp files (RU: добавить интеграционный тест: отмена сборки в процессе завершает процессы FFmpeg и удаляет временные файлы)
- [ ] 3.4 Add integration test: unresolved FFmpeg/FFprobe binary path surfaces a clear error (RU: добавить интеграционный тест: неразрешённый путь к бинарнику FFmpeg/FFprobe выдаёт понятную ошибку)

## 4. End-to-end tests

- [ ] 4.1 Add `@playwright/test` as a dev dependency and set up an Electron e2e config (RU: добавить `@playwright/test` в dev-зависимости и настроить конфигурацию e2e для Electron)
- [ ] 4.2 Write one happy-path e2e spec: new project → add tracks → generate chapters → edit metadata → build → assert output file exists (RU: написать один e2e-сценарий «счастливого пути»: новый проект → добавление треков → генерация глав → редактирование метаданных → сборка → проверка наличия выходного файла)

## 5. CI

- [ ] 5.1 Update `.github/workflows/build.yml` to run unit/component tests, integration tests, and the e2e suite (as separate jobs/steps) (RU: обновить `.github/workflows/build.yml` для запуска юнит/компонентных тестов, интеграционных тестов и e2e-набора (отдельными задачами/шагами))
- [ ] 5.2 Confirm CI fails the workflow when any tier fails (verify with an intentionally broken test in a draft PR, then revert) (RU: убедиться, что CI завершает workflow с ошибкой при падении любого уровня (проверить намеренно сломанным тестом в черновом PR, затем откатить))

## 6. AI workflow rules

- [ ] 6.1 Update `.cursor/rules/*.mdc` (or add a new rule file) documenting the "run typecheck + relevant tests after AI-assisted edits" expectation (RU: обновить `.cursor/rules/*.mdc` (или добавить новый файл правил), задокументировав требование «запускать typecheck + соответствующие тесты после правок AI»)
- [ ] 6.2 Update `CLAUDE.md`'s AI Assistant Guidelines section to reference the same expectation explicitly (RU: обновить раздел AI Assistant Guidelines в `CLAUDE.md`, явно сославшись на это же требование)
