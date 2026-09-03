## ADDED Requirements

### Requirement: Post-change verification for AI-assisted edits
AI-assisted changes to the codebase SHALL be followed by running the TypeScript type check (`npm run typecheck`) and the relevant unit test(s) for the touched area before the change is considered complete, so type errors and regressions are caught immediately rather than at the next manual review or CI run.

**RU:** Изменения в кодовой базе, вносимые с помощью AI, ДОЛЖНЫ сопровождаться запуском проверки типов TypeScript (`npm run typecheck`) и соответствующих юнит-тестов для затронутой области перед тем, как изменение будет считаться завершённым, чтобы ошибки типов и регрессии обнаруживались сразу, а не только при следующем ручном ревью или прогоне CI.

#### Scenario: AI assistant completes a code edit
- **WHEN** an AI assistant (e.g. Cursor) finishes editing source files as part of a prompt
- **THEN** the assistant SHALL run `npm run typecheck` and, if unit tests exist for the touched module(s), run those tests before reporting the task as done
- **RU:** Когда AI-ассистент (например, Cursor) завершает редактирование исходных файлов в рамках промпта, ассистент ДОЛЖЕН запустить `npm run typecheck` и, если для затронутых модулей существуют юнит-тесты, запустить эти тесты перед тем, как сообщить о завершении задачи.

#### Scenario: Type check or tests fail after an AI-assisted edit
- **WHEN** `npm run typecheck` or the relevant unit tests fail immediately after an AI-assisted edit
- **THEN** the assistant SHALL attempt to fix the failure as part of the same task rather than leaving the codebase in a known-broken state
- **RU:** Когда `npm run typecheck` или соответствующие юнит-тесты завершаются с ошибкой сразу после изменения, внесённого AI, ассистент ДОЛЖЕН попытаться исправить сбой в рамках той же задачи, а не оставлять кодовую базу в заведомо неработающем состоянии.

### Requirement: Cursor rules encode this expectation
The project's Cursor rules configuration SHALL explicitly document the type-check-and-test expectation so it applies consistently across AI-assisted sessions, independent of any single conversation's memory.

**RU:** Конфигурация правил Cursor проекта ДОЛЖНА явно документировать требование о проверке типов и тестах, чтобы оно применялось последовательно во всех AI-сессиях, независимо от памяти отдельного диалога.

#### Scenario: New AI session starts
- **WHEN** a new AI-assisted session/conversation begins in this repository
- **THEN** the always-applied Cursor rules SHALL already state the post-change verification expectation, without requiring the user to repeat it
- **RU:** Когда в этом репозитории начинается новая AI-сессия/диалог, всегда применяемые правила Cursor ДОЛЖНЫ уже содержать требование о проверке после изменений, без необходимости для пользователя повторять его.
