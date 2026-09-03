## Context

`vitest.config.ts` currently targets a Node environment with a 30s timeout, tuned for the existing `tests/ffmpeg.smoke.test.ts` (spawns real FFmpeg processes). React components have no test coverage today, and there's no e2e harness. CI (`.github/workflows/build.yml`) currently runs install/lint/typecheck/test/build but "test" only covers the one smoke-test file today.

**RU:** `vitest.config.ts` сейчас нацелен на Node-окружение с таймаутом 30с, настроенное под существующий `tests/ffmpeg.smoke.test.ts` (запускает реальные процессы FFmpeg). React-компоненты сегодня не покрыты тестами, и нет e2e-инфраструктуры. CI (`.github/workflows/build.yml`) сейчас выполняет install/lint/typecheck/test/build, но «test» пока покрывает только один файл smoke-теста.

## Goals / Non-Goals

**Goals:**
- Establish three clearly separated test tiers (unit/component, integration, e2e) that can run independently and in CI.
- Keep the existing FFmpeg smoke test working unmodified; extend rather than replace.
- Make the "typecheck + test after AI edits" expectation explicit and durable (in rules files), not just a one-off conversational ask.

**RU (цели):** Установить три чётко разделённых уровня тестирования (юнит/компонентный, интеграционный, e2e), которые можно запускать независимо и в CI. Сохранить работоспособность существующего smoke-теста FFmpeg без изменений; расширять, а не заменять. Сделать требование «проверка типов + тесты после правок AI» явным и устойчивым (в файлах правил), а не разовой просьбой в диалоге.

**Non-Goals:**
- 100% test coverage — this change establishes the tiers and a meaningful starting set of tests, not exhaustive coverage of every component/branch.
- Visual regression testing (screenshot diffing) — out of scope for this change.

**RU (не цели):** 100% покрытие тестами — это изменение устанавливает уровни и осмысленный стартовый набор тестов, а не исчерпывающее покрытие каждого компонента/ветки. Визуальное регрессионное тестирование (сравнение скриншотов) — вне рамок этого изменения.

## Decisions

- **Split Vitest config by environment** rather than forcing everything into one environment: component tests need `jsdom`/`happy-dom` (DOM APIs), while the existing FFmpeg tests need real Node (child process spawning) and a long timeout. Use Vitest's workspace/projects feature (or `environmentMatchGlobs`) to run `tests/components/**` under `jsdom` and `tests/*.smoke.test.ts` / `tests/integration/**` under `node`.
  - *Alternative considered*: a single environment with per-file `@vitest-environment` pragma comments. Acceptable fallback if workspace/projects config proves awkward with the current single `vitest.config.ts`, but a workspace config is cleaner for keeping the two tiers' settings (timeouts, setup files) independent.
  - **RU:** Разделить конфигурацию Vitest по окружениям, а не помещать всё в одно: компонентным тестам нужен `jsdom`/`happy-dom` (DOM API), а существующим тестам FFmpeg нужен настоящий Node (запуск дочерних процессов) и долгий таймаут. Использовать возможность workspace/projects в Vitest (или `environmentMatchGlobs`), чтобы `tests/components/**` запускались под `jsdom`, а `tests/*.smoke.test.ts` / `tests/integration/**` — под `node`. *Рассмотренная альтернатива*: единое окружение с директивами `@vitest-environment` в каждом файле. Приемлемый запасной вариант, если конфигурация workspace/projects окажется неудобной с текущим единым `vitest.config.ts`, но workspace-конфигурация чище сохраняет независимость настроек (таймауты, setup-файлы) двух уровней.
- **Playwright for Electron e2e**, since it has first-class Electron support (`_electron.launch`) and is already a well-supported choice for this kind of app; avoids building a custom Spectron-style harness (Spectron itself is deprecated).
  - **RU:** Playwright для e2e Electron, поскольку у него полноценная поддержка Electron (`_electron.launch`) и это уже хорошо поддерживаемый выбор для такого рода приложений; избегает создания собственной Spectron-подобной инфраструктуры (сам Spectron устарел).
- **Fixture generation over committed binaries**: integration/e2e tests generate small synthetic MP3 fixtures on the fly (as the existing smoke test already does), keeping the repo free of binary test assets.
  - **RU:** Генерация фикстур вместо закоммиченных бинарников: интеграционные/e2e-тесты генерируют небольшие синтетические MP3-фикстуры на лету (как уже делает существующий smoke-тест), сохраняя репозиторий свободным от бинарных тестовых файлов.
- **Rules-file documentation, not a hook/CI gate, for the AI-workflow requirement.** Enforcing "AI ran typecheck+tests" mechanically (e.g. via a git hook that blocks commits without evidence) is out of scope; this change relies on documenting the expectation clearly in `.cursor/rules/*.mdc` and `CLAUDE.md` so it's consistently surfaced to the assistant, backed by the existing `pre-push` Husky hook and CI as the actual enforcement backstop.
  - **RU:** Требование к AI-процессу документируется в файлах правил, а не через хук/гейт CI. Механическое принуждение к «AI запустил typecheck+тесты» (например, через git-хук, блокирующий коммиты без подтверждения) вне рамок; это изменение полагается на явное документирование требования в `.cursor/rules/*.mdc` и `CLAUDE.md`, чтобы оно последовательно доводилось до ассистента, с существующим хуком `pre-push` Husky и CI как реальной страховкой соблюдения.

## Risks / Trade-offs

- [Risk] Adding Playwright + Electron e2e tests increases CI runtime and flakiness risk (real app launch, real windowing) → Mitigation: keep the e2e suite to a single, focused happy-path flow initially; run it as a separate CI job so a flaky e2e run doesn't block fast unit/integration feedback.
  - **RU:** [Риск] Добавление e2e-тестов Playwright + Electron увеличивает время CI и риск нестабильности (реальный запуск приложения, реальная работа с окнами) → Смягчение: изначально ограничить e2e-набор одним сфокусированным «счастливым путём»; запускать его отдельной задачей CI, чтобы нестабильный e2e-прогон не блокировал быструю обратную связь юнит/интеграционных тестов.
- [Risk] Splitting Vitest config could break the existing smoke test's timeout/environment assumptions if not carefully scoped → Mitigation: verify `tests/ffmpeg.smoke.test.ts` still passes unmodified after the config split, before adding new test tiers.
  - **RU:** [Риск] Разделение конфигурации Vitest может нарушить допущения существующего smoke-теста о таймауте/окружении, если сделано неаккуратно → Смягчение: убедиться, что `tests/ffmpeg.smoke.test.ts` по-прежнему проходит без изменений после разделения конфигурации, прежде чем добавлять новые уровни тестов.
- [Trade-off] Documenting the AI-workflow expectation in rules files is a soft enforcement mechanism (relies on the assistant following it), not a hard gate — accepted given the added enforcement from existing CI/Husky as a backstop.
  - **RU:** [Компромисс] Документирование требования к AI-процессу в файлах правил — это мягкий механизм соблюдения (полагается на то, что ассистент будет ему следовать), а не жёсткий гейт — принято с учётом дополнительной страховки со стороны существующих CI/Husky.

## Migration Plan

1. Split/extend `vitest.config.ts` for multi-environment support; confirm the existing smoke test still passes.
2. Add component tests incrementally (`ChapterList`, `TrackList`, `MetadataForm`, `AppContext`).
3. Add integration tests alongside the existing smoke test.
4. Add Playwright + a first e2e happy-path test.
5. Update `.github/workflows/build.yml` to run all tiers (as separate jobs/steps).
6. Update `.cursor/rules/*.mdc` / `CLAUDE.md` with the post-change verification expectation.

**RU (план внедрения):** 1. Разделить/расширить `vitest.config.ts` для поддержки нескольких окружений; убедиться, что существующий smoke-тест по-прежнему проходит. 2. Постепенно добавлять компонентные тесты (`ChapterList`, `TrackList`, `MetadataForm`, `AppContext`). 3. Добавить интеграционные тесты рядом с существующим smoke-тестом. 4. Добавить Playwright и первый e2e-тест по «счастливому пути». 5. Обновить `.github/workflows/build.yml`, чтобы запускать все уровни (отдельными задачами/шагами). 6. Обновить `.cursor/rules/*.mdc` / `CLAUDE.md` требованием о проверке после изменений.
