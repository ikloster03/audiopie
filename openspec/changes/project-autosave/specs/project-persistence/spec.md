## MODIFIED Requirements

### Requirement: Save to the project's already-known path
The system SHALL keep an open project's `.audiopie` file at its already-known path up to date automatically, since every open project has a path assigned either at creation (see `project-types` capability) or by having been opened from an existing file. There is no explicit user-invoked "Save" action for this path — persistence is driven by the automatic two-tier mechanism defined in the `project-autosave` capability. An explicit "Export a copy…" action (see `project-autosave`) SHALL write a snapshot to a different path without altering the currently open project's own remembered (autosave-targeted) path.

**RU:** Система ДОЛЖНА автоматически поддерживать файл `.audiopie` открытого проекта по его уже известному пути в актуальном состоянии, поскольку у каждого открытого проекта путь назначен либо при создании (см. capability `project-types`), либо получен при открытии существующего файла. Явного пользовательского действия «Сохранить» для этого пути больше нет — сохранение управляется автоматическим двухуровневым механизмом, определённым в capability `project-autosave`. Явное действие «Экспортировать копию…» (см. `project-autosave`) ДОЛЖНО записывать снимок по другому пути, не изменяя запомненный (целевой для автосохранения) путь текущего открытого проекта.

#### Scenario: An open project's file stays current without user action
- **WHEN** the user edits a project that is currently open (created moments ago or opened from a file)
- **THEN** the system SHALL eventually write those edits to that project's known `.audiopie` path automatically, without the user invoking a save action
- **RU:** Когда пользователь редактирует открытый проект (только что созданный или открытый из файла), система ДОЛЖНА в конечном счёте автоматически записать эти правки по известному пути `.audiopie` этого проекта, без вызова пользователем действия сохранения.

#### Scenario: Exporting a copy does not change the remembered path
- **WHEN** the user explicitly exports a copy of the project to a different path (see `project-autosave`'s "Export a copy" requirement)
- **THEN** the system SHALL write the container to that new path and SHALL leave the originally open project's own remembered (autosave-targeted) path unchanged
- **RU:** Когда пользователь явно экспортирует копию проекта по другому пути (см. требование «Export a copy» в `project-autosave`), система ДОЛЖНА записать контейнер по новому пути и оставить запомненный (целевой для автосохранения) путь исходно открытого проекта без изменений.

## REMOVED Requirements

### Requirement: Guard against saving an empty project
**Reason**: Already superseded by `project-container-format` (every project has a save path assigned up front at creation, so there is no untitled/unsaved state to guard against). Restated here for completeness now that saving itself is automatic: there is no user-invoked save action left for this guard to block in the first place.
**Migration**: No user-facing migration needed; this requirement was already removed by `project-container-format` and remains removed.

**RU:** **Причина**: уже заменено в `project-container-format` (у каждого проекта путь сохранения назначается заранее при создании, поэтому защищать не от чего). Указано здесь для полноты, поскольку теперь и само сохранение автоматическое — блокировать просто нечего, так как пользовательского действия сохранения больше не существует. **Миграция**: не требуется; это требование уже было удалено в `project-container-format` и остаётся удалённым.
