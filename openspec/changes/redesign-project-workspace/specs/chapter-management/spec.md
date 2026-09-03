## ADDED Requirements

### Requirement: Reorder chapters via drag-and-drop
The system SHALL allow the user to reorder chapters directly in the Chapters view via a drag handle. Reordering chapters SHALL update the underlying track order to match the new chapter order (since chapter order ultimately determines build/track order), and SHALL persist the new order for both chapters and tracks.

**RU:** Система ДОЛЖНА позволять пользователю изменять порядок глав прямо в панели глав, перетаскивая их за ручку. Изменение порядка глав ДОЛЖНО обновлять порядок соответствующих треков (поскольку порядок глав в итоге определяет порядок при сборке) и сохранять новый порядок как для глав, так и для треков.

#### Scenario: Drag a chapter to a new position
- **WHEN** the user drags a chapter item by its handle to a new position in the chapters list
- **THEN** the system SHALL compute the new chapter order, reorder the underlying tracks to match, persist both via the appropriate IPC calls, and update the renderer's chapter list state without re-deriving chapter titles from scratch
- **RU:** Когда пользователь перетаскивает элемент главы за ручку на новую позицию в списке глав, система ДОЛЖНА вычислить новый порядок глав, переупорядочить соответствующие треки, сохранить оба списка через соответствующие IPC-вызовы и обновить состояние списка глав в рендерере, не пересчитывая названия глав с нуля.

### Requirement: Edit chapter time range directly
The system SHALL allow the user to edit a chapter's start and end time directly in the Chapters view, in addition to editing its title. Edited time ranges SHALL be validated so a chapter's start time is less than its end time, and SHALL be persisted to the project.

**RU:** Система ДОЛЖНА позволять пользователю редактировать время начала и конца главы прямо в панели глав, в дополнение к редактированию названия. Отредактированные временные диапазоны ДОЛЖНЫ проверяться так, чтобы время начала главы было меньше времени конца, и ДОЛЖНЫ сохраняться в проекте.

#### Scenario: Edit a chapter's start or end time
- **WHEN** the user edits a chapter's start or end time field to a valid value where start is less than end
- **THEN** the system SHALL update the local chapter list immediately, persist the change via `chapters/update`, and SHALL NOT trigger a full auto-regeneration of chapters from tracks
- **RU:** Когда пользователь редактирует поле времени начала или конца главы на корректное значение, где начало меньше конца, система ДОЛЖНА немедленно обновить локальный список глав, сохранить изменение через `chapters/update` и НЕ ДОЛЖНА запускать полную автоматическую перегенерацию глав из треков.

#### Scenario: Reject an invalid time range
- **WHEN** the user edits a chapter's start or end time such that start would be greater than or equal to end
- **THEN** the system SHALL reject the edit, keep the previous valid values, and SHALL NOT persist the invalid range
- **RU:** Когда пользователь редактирует время начала или конца главы так, что начало становится больше или равно концу, система ДОЛЖНА отклонить изменение, сохранить предыдущие корректные значения и НЕ ДОЛЖНА сохранять некорректный диапазон.

### Requirement: Rename chapters by template
The system SHALL let the user rename all chapters in one bulk action using a text template containing a numeric placeholder (e.g. `Chapter {n}`), where `{n}` is replaced by the chapter's 1-based position in the list.

**RU:** Система ДОЛЖНА позволять пользователю переименовать все главы одним массовым действием с помощью текстового шаблона с числовым плейсхолдером (например, `Chapter {n}`), где `{n}` заменяется на позицию главы в списке (нумерация с 1).

#### Scenario: Apply a rename template
- **WHEN** the user opens the "Rename by template" action, enters a template containing `{n}`, and confirms
- **THEN** the system SHALL generate a new title for every chapter by substituting `{n}` with that chapter's 1-based index, update the chapter list, and persist it via `chapters/update`
- **RU:** Когда пользователь открывает действие «Переименовать по шаблону», вводит шаблон с `{n}` и подтверждает, система ДОЛЖНА сформировать новое название для каждой главы, подставив вместо `{n}` её порядковый номер (с 1), обновить список глав и сохранить его через `chapters/update`.

#### Scenario: Template without a placeholder
- **WHEN** the user submits a template that does not contain `{n}`
- **THEN** the system SHALL apply the literal template text to every chapter unchanged (all chapters receive the same title) rather than rejecting the action
- **RU:** Когда пользователь отправляет шаблон без `{n}`, система ДОЛЖНА применить буквальный текст шаблона ко всем главам без изменений (все главы получат одинаковое название), а не отклонять действие.
