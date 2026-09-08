## 1. Main process: split flush vs. repack

- [ ] 1.1 In `electron/main/project.ts`, extract `flushWorkingDir()` from the current `writeContainerAndZip`: writes the dirty book(s)' `index.json` (via existing `writeBookIndex`) plus the root `index.json`, without calling `zipDirectory`
- [ ] 1.2 Extract `repackContainer()`: the existing `zipDirectory(workingDir, projectPath)` call, callable independently of `flushWorkingDir()`
- [ ] 1.3 Update `saveProjectToFile`/`writeContainerAndZip` call sites (`project.new`, book import/extract, etc.) to call `flushWorkingDir()` then `repackContainer()` in sequence where a full save is still needed (e.g. explicit export, initial creation)
- [ ] 1.4 Add an in-memory "dirty since last repack" flag (or reuse book-level dirty tracking) so `repackContainer()` calls can be skipped when nothing changed

## 2. Main process: IPC surface

- [ ] 2.1 Add `project.flush()` IPC handler calling `flushWorkingDir()`
- [ ] 2.2 Add `project.repack()` IPC handler calling `repackContainer()`, returning success/failure so the renderer can update save status
- [ ] 2.3 Add `project.exportCopy(destPath)` IPC handler: `flushWorkingDir()` then `zipDirectory(workingDir, destPath)` without mutating the in-memory `projectPath`
- [ ] 2.4 Add `project.confirmLegacyMigration()` IPC handler (or reuse existing legacy-upgrade code path) that performs the one-time copy-into-working-directory step for a project opened from legacy JSON, decoupled from any save action
- [ ] 2.5 Expose all four in `electron/preload/preload.ts` and update `AudioPieAPI` types in `electron/main/types.ts`

## 3. Renderer: autosave scheduler in AppContext

- [ ] 3.1 Add `saveStatus: 'saved' | 'saving' | 'error'` state to `src/context/AppContext.tsx`
- [ ] 3.2 Add an internal "notify edited" function called from every existing mutation method (`addTracksFromPaths`, track remove/reorder/rename, metadata setters, series/book operations, project-type switch): triggers `project.flush()` immediately, sets `saveStatus` to `'saving'`, and (re)schedules a debounced `project.repack()` call (~2-3s idle)
- [ ] 3.3 On successful `project.repack()`, set `saveStatus` to `'saved'`; on failure, set it to `'error'` and keep the pending repack retryable
- [ ] 3.4 Add a manual `retrySave()` method (calls `project.repack()` again) for the error-state indicator to invoke
- [ ] 3.5 Force an immediate (non-debounced) `project.repack()` call when `activeSection` changes away from an editor section, when `closeProject` is invoked, and skip it if `saveStatus` is already `'saved'`

## 4. Renderer: legacy migration confirmation

- [ ] 4.1 Detect "opened from legacy JSON, not yet upgraded this session" state (reuse/expose the main process's existing `isLegacyPending` flag via IPC)
- [ ] 4.2 On the first "notify edited" call for such a project, show a confirmation dialog (file count/approximate size) before calling `project.flush()`/scheduling autosave for the first time
- [ ] 4.3 On confirm, call `project.confirmLegacyMigration()` (performing the existing copy-into-working-directory upgrade), then proceed with normal flush/repack scheduling
- [ ] 4.4 On decline, leave the project editable but do not schedule any flush/repack; re-show the same confirmation on the next edit

## 5. Renderer: UI changes

- [ ] 5.1 Remove the "Save" FAB button and `handleSaveProject` from `src/App.tsx`
- [ ] 5.2 Add a save-status indicator component, placed where the Save FAB was (next to Build), rendering the three `saveStatus` states with distinct icon/text per state
- [ ] 5.3 Make the indicator clickable only in the `'error'` state, calling `retrySave()`
- [ ] 5.4 Add an "Export a copy…" action to `src/components/SettingsPage.tsx` (native save dialog + `window.audioPie.project.exportCopy(path)`), with a success/error toast or inline message

## 6. Main process: quit/close lifecycle

- [ ] 6.1 Update `electron/main/main.ts`'s `before-quit` handler to await any pending/in-flight `repackContainer()` before `cleanupOnQuit`/`cleanupWorkingDir` runs
- [ ] 6.2 Ensure closing a project (opening a different one, or returning to the project manager) also awaits a pending repack before the working directory is cleaned up

## 7. Localization

- [ ] 7.1 Add i18n keys for the save-status indicator's three states (`saved`/`saving`/`error` labels and tooltips) to `src/i18n/locales/en.json`
- [ ] 7.2 Add i18n keys for the legacy-migration confirmation dialog and the "Export a copy…" action/dialog to `src/i18n/locales/en.json`
- [ ] 7.3 Add matching Russian translations for all of the above to `src/i18n/locales/ru.json`
- [ ] 7.4 Remove now-unused `header.save` key usages if no longer referenced anywhere, or repurpose it for the status indicator's "saved" label

## 8. Tests

- [ ] 8.1 Unit test: `flushWorkingDir()` writes updated `index.json` files without invoking `zipDirectory`
- [ ] 8.2 Unit test: `repackContainer()` produces a valid ZIP reflecting the current working directory state
- [ ] 8.3 Unit test: `project.exportCopy(destPath)` writes a valid container to `destPath` and does not change the active `projectPath` used for subsequent autosaves
- [ ] 8.4 Unit test: a rapid burst of simulated edits results in exactly one `repackContainer()` call after the debounce window (mock timers)
- [ ] 8.5 Unit test: forced repack checkpoint is a no-op when `saveStatus` is already `'saved'`
- [ ] 8.6 Unit test: a failed `repackContainer()` sets `saveStatus` to `'error'` and a subsequent manual retry re-attempts it
- [ ] 8.7 Unit test: legacy-project autosave is gated behind `confirmLegacyMigration()` — declining does not call `flushWorkingDir()`/`repackContainer()`
- [ ] 8.8 Manual test: edit a project, quit the app during the debounce window, relaunch, and confirm the edit was persisted (checkpoint flush on quit worked)
- [ ] 8.9 Manual test: simulate a repack failure (e.g., point the project path at a read-only location) and confirm the error indicator appears and retry works once the condition is fixed

## 9. Documentation

- [ ] 9.1 Update `CLAUDE.md`'s IPC API section and any "Save" references to describe automatic persistence instead of a manual save action
- [ ] 9.2 Add a CHANGELOG entry describing the removal of the manual "Save" button in favor of autosave, and the new "Export a copy…" action
