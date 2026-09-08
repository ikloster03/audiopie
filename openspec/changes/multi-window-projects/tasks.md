## 1. Project sessions in main

- [ ] 1.1 Extract today's module-level `state` / `activeBookId` / `workingDir` / `projectPath` / `isLegacyPending` into a `ProjectSession` type in `electron/main/project.ts`
- [ ] 1.2 Replace the singleton with `sessions: Map<webContentsId, ProjectSession>` and `openPaths: Map<canonicalPath, webContentsId>`; create an empty session (`defaultState()`, no path) when a window is created
- [ ] 1.3 Change every exported project function that mutates the singleton to take a session key (or look it up from `webContents.id`) so open/create/save/close/tracks/metadata/series only touch that session
- [ ] 1.4 `closeProject` for a window resets only that session, cleans only that `workingDir`, and deletes its `openPaths` entry
- [ ] 1.5 `cleanupOnQuit` walks all remaining sessions; add `disposeWindow(webContentsId)` for window `closed` that does the same for one session

## 2. Canonical path + focus-existing

- [ ] 2.1 Add a `canonicalizeProjectPath(filePath)` helper: `ensureAudiopieExtension`, then `realpath` if the file exists, else `path.resolve` + `path.normalize` (case-fold on Windows)
- [ ] 2.2 Before `openProjectAtPath` / `createNewProjectAtPath` extract or overwrite, look up `openPaths`; if owned by another window, `show`+`focus` that window and return `{ kind: 'focused-existing' }` without `cleanupWorkingDir` or unzip
- [ ] 2.3 On successful open/create, register the canonical path in `openPaths` for that window (replacing any previous path that window owned)
- [ ] 2.4 Leave `importBookFromFile` unbound by `openPaths` (it copies contents, it does not open the source as a document)

## 3. IPC registration and window targeting

- [ ] 3.1 Move `registerIpcHandlers()` to `app.whenReady` (once); stop calling it from `createWindow`
- [ ] 3.2 Resolve `BrowserWindow.fromWebContents(event.sender)` in every handler that currently closes over `win` (file dialogs, `webContents.send` progress)
- [ ] 3.3 Change `project.open` / `project.openPath` / `project.new` return types (preload + `AudioPieAPI`) to `OpenOrCreateResult` (`loaded` + snapshot vs `focused-existing`)
- [ ] 3.4 Broadcast `settings/changed` to all windows on `settings/set`; keep a single `rebuildMenu()` on language change

## 4. Windows, menu, single instance

- [ ] 4.1 Make `createWindow` reusable: optional `x`/`y` cascade from the focused window; create an empty session; do not re-register IPC or the updater
- [ ] 4.2 Call `app.requestSingleInstanceLock()`; if not acquired, quit. On `second-instance` with no document args, focus the last-focused window and do not create a new window
- [ ] 4.3 Add File → New Window (en/ru `menu.newWindow`); on Windows/Linux add Close (window) before Exit so closing one window does not quit while others remain
- [ ] 4.4 Drop single `mainWindowRef` for window-scoped actions (About, Help): use `BrowserWindow.getFocusedWindow()`
- [ ] 4.5 Keep macOS `activate` (create if zero windows) and `window-all-closed` (quit except darwin); on each window `closed`, `disposeWindow`

## 5. Window titles

- [ ] 5.1 Set `win.setTitle('AudioPie')` for empty sessions
- [ ] 5.2 After open/create/metadata/series-title changes, set title to `{series.title} — AudioPie` or `{book title} — AudioPie`
- [ ] 5.3 Reset title to `AudioPie` on `closeProject` for that window

## 6. FFmpeg ownership

- [ ] 6.1 Record `buildOwnerId` (`webContents.id`) when `build/start` succeeds; send `build/onProgress` only to that owner
- [ ] 6.2 Keep process-wide `isBusy()`; `build/start` from any other window still throws
- [ ] 6.3 `build/cancel` from a non-owner window is a no-op; from the owner, existing `cancelBuild` behavior
- [ ] 6.4 Closing the owner window mid-build calls `cancelBuild` and clears the mutex so remaining windows can build

## 7. Renderer

- [ ] 7.1 In `openProjectFromDialog` / `createNewProject`, handle `{ kind: 'focused-existing' }`: return without `applySnapshot` or entering the editor; do not show the extract overlay (or hide it immediately if `project-open-progress` already showed it)
- [ ] 7.2 Subscribe to `settings/changed` in `AppContext` so theme/language updates apply in every open window
- [ ] 7.3 Keep welcome-only Open (no in-place Open in the occupied editor)

## 8. Tests

- [ ] 8.1 Unit-test `canonicalizeProjectPath`: extension append, `..` normalization, Windows case-fold (if testable), symlink → same key when `realpath` is available
- [ ] 8.2 Unit-test session isolation: two sessions, mutate A, snapshot of B unchanged; close A does not clean B's working dir
- [ ] 8.3 Unit-test `openPaths`: opening a path owned by session A returns focused-existing and does not replace A's state; closing A then opening from B loads normally
- [ ] 8.4 Existing project container/smoke tests still pass against a session-aware `openProjectAtPath` (pass a fake/test session id or keep a test helper)
