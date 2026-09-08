## ADDED Requirements

### Requirement: Two-tier automatic persistence
The system SHALL persist edits to an open project automatically, without requiring the user to invoke a save action, using two tiers: a cheap "flush" that writes the affected book's `index.json` and the root `index.json` to the project's working directory on essentially every discrete edit, and a more expensive "repack" that rewrites the actual `.audiopie` ZIP at the project's known path, run less frequently (debounced idle period after the last edit, plus forced at section-navigation, project-close, and app-quit checkpoints).

**RU:** Система ДОЛЖНА автоматически сохранять правки открытого проекта, без явного действия пользователя, в два этапа: дешёвый «flush», записывающий `index.json` затронутой книги и корневой `index.json` в рабочую директорию почти на каждую отдельную правку, и более дорогой «repack», перезаписывающий сам ZIP-файл `.audiopie` по известному пути проекта, реже (по простою после правок, а также принудительно при смене раздела, закрытии проекта и выходе из приложения).

#### Scenario: Edit is flushed to the working directory immediately
- **WHEN** the user makes any edit to an open project (adding/removing/reordering/renaming a track, editing metadata, editing series/book data)
- **THEN** the system SHALL write that book's `index.json` and the root `index.json` to the working directory without waiting for a debounce period or user action
- **RU:** Когда пользователь вносит любую правку в открытый проект (добавление/удаление/перестановка/переименование трека, редактирование метаданных, изменение данных серии/книги), система ДОЛЖНА записать `index.json` этой книги и корневой `index.json` в рабочую директорию, не дожидаясь периода debounce или действия пользователя.

#### Scenario: Repack runs after an idle period following edits
- **WHEN** at least one edit has been flushed and no further edit occurs for a short idle period (on the order of a few seconds)
- **THEN** the system SHALL repack the working directory into the project's `.audiopie` file at its known path
- **RU:** Когда хотя бы одна правка была сброшена в рабочую директорию и в течение короткого периода простоя (порядка нескольких секунд) не происходит новых правок, система ДОЛЖНА перепаковать рабочую директорию в файл `.audiopie` проекта по его известному пути.

#### Scenario: Repack is forced at navigation, close, and quit checkpoints
- **WHEN** the user navigates away from the active editor section, closes the open project, or quits the application, and there are edits not yet reflected in the last repack
- **THEN** the system SHALL perform an immediate repack (bypassing the idle debounce) before completing that navigation, close, or quit
- **RU:** Когда пользователь уходит из активного раздела редактора, закрывает открытый проект или выходит из приложения, а есть правки, не отражённые в последней перепаковке, система ДОЛЖНА выполнить немедленную перепаковку (в обход задержки простоя) перед завершением этого перехода, закрытия или выхода.

#### Scenario: Repack is skipped when nothing changed
- **WHEN** a forced repack checkpoint (navigation, close, or quit) occurs while the save status is already "saved" (no edits since the last successful repack)
- **THEN** the system SHALL NOT perform a redundant repack
- **RU:** Когда наступает точка принудительной перепаковки (смена раздела, закрытие, выход), а статус сохранения уже «сохранено» (нет правок с последней успешной перепаковки), система НЕ ДОЛЖНА выполнять избыточную перепаковку.

### Requirement: No manual "Save" action for the current project
The system SHALL NOT present a "Save" button or equivalent user-invoked action whose purpose is to write the currently open project to its already-known path, since this now happens automatically.

**RU:** Система НЕ ДОЛЖНА показывать кнопку «Сохранить» или эквивалентное действие, вызываемое пользователем, назначение которого — записать текущий открытый проект по уже известному пути, поскольку это теперь происходит автоматически.

#### Scenario: Save button is absent from the editor
- **WHEN** the user views the open-project editor or build view
- **THEN** the UI SHALL NOT display a "Save" button or icon action
- **RU:** Когда пользователь просматривает экран редактора открытого проекта или экран сборки, UI НЕ ДОЛЖЕН отображать кнопку или иконку-действие «Сохранить».

### Requirement: Save-status indicator
The system SHALL display a passive save-status indicator, in the position previously occupied by the "Save" button, reflecting one of three states: saved (no pending edits), saving (a flush or repack is scheduled or in progress), or error (the most recent repack attempt failed). Only the error state SHALL be interactive, allowing the user to manually retry the pending repack.

**RU:** Система ДОЛЖНА отображать пассивный статус-индикатор сохранения на месте прежней кнопки «Сохранить», отражающий одно из трёх состояний: сохранено (нет ожидающих правок), сохранение (flush или repack запланированы или выполняются), ошибка (последняя попытка перепаковки не удалась). Только состояние ошибки ДОЛЖНО быть интерактивным, позволяя вручную повторить отложенную перепаковку.

#### Scenario: Indicator shows "saving" during a pending repack
- **WHEN** an edit has been flushed and a repack is scheduled or currently running
- **THEN** the indicator SHALL show the "saving" state until that repack completes
- **RU:** Когда правка сброшена и перепаковка запланирована либо выполняется, индикатор ДОЛЖЕН показывать состояние «сохранение» до завершения этой перепаковки.

#### Scenario: Indicator shows "error" and allows retry after a failed repack
- **WHEN** a repack attempt fails (for example, due to a full disk or a permissions error)
- **THEN** the indicator SHALL show the "error" state, and clicking it SHALL retry the repack
- **RU:** Когда попытка перепаковки завершается ошибкой (например, диск заполнен или ошибка прав доступа), индикатор ДОЛЖЕН показать состояние «ошибка», а клик по нему ДОЛЖЕН повторить попытку перепаковки.

### Requirement: Explicit confirmation before migrating a legacy project
The system SHALL continue to require an explicit user confirmation before performing the one-time copy of a legacy plain-JSON project's externally-referenced tracks into a new working directory (the container-format upgrade), rather than performing this migration silently as a side effect of ordinary autosave.

**RU:** Система ДОЛЖНА по-прежнему требовать явного подтверждения пользователя перед выполнением разового копирования внешних треков legacy-проекта в новую рабочую директорию (обновление до формата контейнера), а не выполнять эту миграцию молча как побочный эффект обычного автосохранения.

#### Scenario: First edit to a legacy project prompts for migration confirmation
- **WHEN** the user makes the first edit to a project that was opened from a legacy plain-JSON `.audiopie` file and has not yet been upgraded this session
- **THEN** the system SHALL show a confirmation dialog describing the upgrade (including an approximate file count/size) before copying any files, rather than upgrading automatically
- **RU:** Когда пользователь вносит первую правку в проект, открытый из старого plain-JSON файла `.audiopie` и ещё не обновлённый в этой сессии, система ДОЛЖНА показать диалог подтверждения с описанием обновления (включая приблизительное число/размер файлов), прежде чем копировать какие-либо файлы, вместо автоматического обновления.

#### Scenario: Declining migration leaves the project un-autosaved
- **WHEN** the user declines the migration confirmation dialog
- **THEN** the system SHALL leave the project editable in memory without enabling automatic persistence for it, and SHALL offer the same confirmation again on the next edit
- **RU:** Когда пользователь отклоняет диалог подтверждения миграции, система ДОЛЖНА оставить проект редактируемым в памяти без включения автоматического сохранения для него и ДОЛЖНА предложить то же подтверждение снова при следующей правке.

### Requirement: Export a copy to a different path
The system SHALL let the user explicitly write a copy of the currently open project to a different file path, without changing the path that automatic persistence targets for the currently open project.

**RU:** Система ДОЛЖНА позволять пользователю явно записать копию текущего открытого проекта по другому пути файла, не изменяя путь, в который автоматическое сохранение пишет для текущего открытого проекта.

#### Scenario: Exporting a copy does not change the autosave target
- **WHEN** the user chooses "Export a copy…" and selects a destination path different from the project's current path
- **THEN** the system SHALL write a complete, valid `.audiopie` file at that destination reflecting the project's current state, and SHALL continue automatically persisting subsequent edits to the original known path, not the export destination
- **RU:** Когда пользователь выбирает «Экспортировать копию…» и указывает путь назначения, отличный от текущего пути проекта, система ДОЛЖНА записать полный корректный файл `.audiopie` по этому пути, отражающий текущее состояние проекта, и ДОЛЖНА продолжать автоматически сохранять последующие правки в исходный известный путь, а не в путь экспорта.
