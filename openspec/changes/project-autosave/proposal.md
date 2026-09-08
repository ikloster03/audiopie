## Why

`project-container-format` (implemented, pending archive) gives every project a save path from the moment it's created — there is no more "untitled, unsaved" state to protect against. That removes the last reason a user ever *has* to click "Save" manually, and exposes a real gap in the current design: an edit (retitle a chapter, reorder tracks, edit metadata) only survives a crash once the user has explicitly clicked Save, because `writeContainerAndZip` (the only thing that writes a book's `index.json` to the working directory, and the only thing that repacks the `.audiopie` ZIP) only runs on that explicit action — `sweepOrphanedWorkingDirs` unconditionally deletes any working directory left over from a crash on next launch, so unsaved edits (even ones sitting in an already-populated working directory) are lost outright. Auto-saving removes both the now-pointless manual step and closes this loss window.

**RU:** `project-container-format` (реализован, ожидает архивации) даёт каждому проекту путь сохранения сразу при создании — больше нет состояния «не сохранено», от которого нужно защищаться. Это убирает последнюю причину, по которой пользователю вообще нужно нажимать «Сохранить» вручную, и обнажает реальный пробел: правка переживает краш только если пользователь успел явно нажать «Сохранить», а `sweepOrphanedWorkingDirs` безусловно удаляет рабочую директорию, оставшуюся после краша, при следующем запуске. Автосохранение убирает и бессмысленный ручной шаг, и это окно потери данных.

## What Changes

- **BREAKING (UI)**: Remove the "Save" FAB button from the main editor/build view (`src/App.tsx`). There is no more user-invoked "Save" action for the currently open project's primary path.
- Introduce automatic two-tier persistence, driven from every mutation to the open project (track add/remove/reorder/title edit, metadata edit, chapter derivation is automatic already, series book add/remove/reorder/seriesIndex edit, project-type switch):
  - **Tier 1 (cheap, frequent)**: flush the affected book's `index.json` plus the root `index.json` to the working directory on (almost) every discrete edit — no ZIP repack involved.
  - **Tier 2 (expensive, debounced)**: repack the working directory into the real `.audiopie` path (`zipDirectory`) after a short idle debounce following the last edit (~2-3s), and additionally at natural checkpoints: navigating away from the active editor section, closing the project, and app quit (`before-quit`), so a repack is never left pending indefinitely.
- Replace the removed Save button with a passive save-status indicator (next to the "Build" action) with three states: saved, saving, and error (clickable only in the error state, to retry the pending repack).
- Legacy plain-JSON `.audiopie` migration (copying all externally-referenced tracks into a fresh working directory) remains an explicit, user-confirmed one-time action — it is not folded into silent autosave, since it can copy several GB and is a one-directional format upgrade. Opening a legacy file still does not auto-trigger this; it now happens behind an explicit confirmation dialog ("Upgrade project format?") the first time autosave would otherwise need to persist a change, rather than firing silently.
- Add an explicit "Export a copy…" action (in the project's Settings) as the new home for "save to a different path" — since autosave always targets the project's original known path, this is now the only way to write a copy elsewhere. This replaces any implicit "Save As" concept.
- Out of scope for this change: crash recovery / resuming an orphaned working directory after a crash. Autosave shrinks the loss window to the last debounce interval, but does not guarantee full recovery of an interrupted session — `sweepOrphanedWorkingDirs` continues to unconditionally clean up on startup.

**RU:** **BREAKING (UI)**: кнопка «Сохранить» удаляется из основного экрана редактора. Вводится двухуровневое автосохранение: дешёвый и частый flush JSON в рабочую директорию на каждую правку, и дорогая, дебаунсированная перепаковка ZIP по простою и на границах (смена раздела, закрытие проекта, выход). Кнопка заменяется статус-индикатором (сохранено/сохраняется/ошибка). Миграция старого JSON-формата остаётся явным разовым подтверждением. Добавляется явное действие «Экспортировать копию…» в настройках проекта. Восстановление после краша — вне рамок этого change.

## Capabilities

### New Capabilities
- `project-autosave`: The two-tier autosave model itself — debounce/checkpoint strategy for the expensive ZIP repack, the immediate cheap working-directory JSON flush, the save-status indicator states, and the explicit "Export a copy…" action that replaces ad hoc Save-As.

### Modified Capabilities
- `project-persistence`: Remove the (already-planned-for-removal-by-`project-container-format`) manual "Save to the project's already-known path" user-invoked action as the *only* path to persistence — persistence now also happens automatically; the explicit save dialog for legacy-format migration becomes its own confirmed action rather than an implicit side effect of any save.

## Impact

- `src/App.tsx`: remove the "Save" FAB and `handleSaveProject`; add a save-status indicator component near the "Build" FAB.
- `src/context/AppContext.tsx`: track save status (`saved` / `saving` / `error`) in state; trigger Tier 1 flush on every mutation method it already exposes (add/remove/reorder tracks, metadata updates, series/book operations); trigger Tier 2 debounce scheduling; flush pending Tier 2 save on section navigation, project close, and before quitting.
- `electron/main/project.ts`: split `writeContainerAndZip` into a cheap `flushWorkingDir()` (per-book `index.json` + root `index.json`, no zip) and the existing expensive zip-repack step; expose both over IPC; add a debounce/coalescing scheduler (or host it in the renderer) so rapid edits don't trigger overlapping repacks.
- `electron/main/ipc.ts` / `electron/preload/preload.ts`: new `project.flush()` (Tier 1) and `project.requestAutosave()` (Tier 2, debounced) handlers, or a single `project.notifyEdited()` that internally schedules both tiers; new `project.exportCopy(path)` handler for the explicit copy-elsewhere action; the legacy-migration confirmation becomes its own IPC-exposed step, decoupled from a "Save" click.
- `electron/main/main.ts`: `before-quit` waits for any pending Tier 2 repack to finish before `cleanupWorkingDir` runs.
- Settings UI (`src/components/SettingsPage.tsx`): add "Export a copy…" action.
- `src/i18n/locales/en.json` / `ru.json`: new keys for save-status indicator states, the legacy-migration confirmation dialog, and "Export a copy…".
- Depends on `project-container-format` (working-directory model, per-book `index.json`, `zipDirectory`) being in place; this change assumes that change's design as its baseline even though it has not yet been archived.
