## Context

Today the main process is a single-document runtime:

- `electron/main/project.ts` holds one `state` / `workingDir` / `projectPath`.
- `registerIpcHandlers(win)` is called from `createWindow` and **closes over** that window; `ipcMain.handle` can only be registered once, so a second window cannot even be wired correctly.
- `menu.ts`, `updater.ts` keep a single `mainWindowRef`.
- `ffmpeg.ts` tracks one global `currentCommands[]`; `cancelBuild` kills everything.

The renderer is already safe: each `BrowserWindow` has its own JS context and `AppContext`. `createWorkingDir()` already mints a unique `audiopie-<sessionId>` directory. The work is to stop treating "the app" as one project.

Adjacent in-flight changes (`project-autosave`, `project-open-progress`) assume per-renderer scheduling/overlays. They stay valid if sessions are per window.

**RU:** Main process — однодокументный синглтон (проект, IPC, меню, FFmpeg). Рендерер и working dir уже изолируемы. Нужно разрезать синглтон на сессии по окнам.

## Goals / Non-Goals

**Goals:**
- Multiple windows in one process, each optionally holding a different `.audiopie`.
- New Window always shows empty `ProjectManager`.
- Canonical-path uniqueness: never two sessions on the same file; a repeat open focuses the existing window.
- IPC, dialogs, and progress events address the requesting/originating window.
- Close-window cleans only that session; macOS `activate` / `window-all-closed` behavior stays as today.

**Non-Goals:**
- OS file associations, `.audiopie` icons, `open-file` / argv document opening.
- Tabs, split views, or in-place Open that replaces an occupied editor.
- Concurrent M4B builds (keep the existing process-wide mutex).
- Collaborative editing / merge of one file in two places.
- Unsaved-changes prompts (none exist today; `project-autosave` will later treat window-close as a repack checkpoint).

**RU:** **Цели:** много окон, пустой New Window, один файл — одно окно с focus, IPC на отправителя. **Не цели:** ассоциации ОС, вкладки, подмена проекта в редакторе, параллельные сборки, совместное редактирование.

## Decisions

- **Session map keyed by `webContents.id`, plus a path index.** Replace the module-level singleton with:

  ```
  sessions: Map<webContentsId, ProjectSession>
  openPaths: Map<canonicalPath, webContentsId>
  ```

  `ProjectSession` is today's fields (`state`, `activeBookId`, `workingDir`, `projectPath`, `isLegacyPending`). Every new window gets an empty session at creation (same `defaultState()` as today, no path). Open/create mutate **that** session. Close-project resets that session and deletes its `openPaths` entry. Window `closed` does the same then drops the map entry.

  *Alternative considered*: lazy session (create only on first Open). Rejected: every IPC handler would special-case "no session", and today's welcome-screen already conceptually has an empty in-memory project.

  *Alternative considered*: one session per `BrowserWindow.id`. Equivalent in practice; `webContents.id` is what `event.sender` gives for free.

  **RU:** Сессия на `webContents.id` с индексом канонического пути. Пустая сессия с создания окна.

- **Canonical path identity via `realpath` when the file exists.** Before open/create, compute a comparison key: `fs.promises.realpath` if the path exists, otherwise `path.resolve` + `path.normalize` (and case-fold on Windows). Always apply `ensureAudiopieExtension` first. Symlinks, `/tmp` vs `/private/tmp`, and `C:\` vs `c:\` then collide correctly.

  *Alternative considered*: string equality on dialog paths. Rejected: it would allow two sessions on the same inode.

  *Alternative considered*: file-lock (`flock` / Windows lock). Unnecessary if uniqueness is enforced inside one process **and** a second process is prevented (see single-instance lock).

  **RU:** Сравнение по `realpath` (или resolve+normalize, если файла ещё нет) после нормализации расширения.

- **Focus-existing is a first-class IPC result, not an error.** After the user has chosen a path and **before** `cleanupWorkingDir` / extract:

  ```ts
  type OpenOrCreateResult =
    | { kind: 'loaded'; snapshot: ProjectSnapshot }
    | { kind: 'focused-existing' }
  ```

  Main calls `existing.show()` + `focus()` (and `app.focus({ steal: true })` on macOS if needed). The requesting renderer MUST NOT apply a snapshot, MUST NOT start extract overlay, and stays on whatever screen it was (typically welcome). No toast in v1 — the other window coming forward is the signal.

  Create-at-path uses the same check so "Save" into an already-open path cannot overwrite a live session.

  `importBookFromFile` copies another container's contents into the **current** series; it does not open that path as a document and is **not** subject to the single-open rule.

  *Alternative considered*: refuse with an error dialog. Rejected: the user asked to behave as if they had switched to the already-open window.

  **RU:** Повторное открытие — `{ kind: 'focused-existing' }`, без extract. Импорт книги в серию — не открытие документа.

- **Register IPC once; resolve `win` from `event.sender`.** Move `registerIpcHandlers()` to `app.whenReady` (once). Every handler that currently uses the captured `win` uses `BrowserWindow.fromWebContents(event.sender)` (or `event.sender` for `webContents.send`). Creating a second window only loads a URL; it does not re-register channels.

  **RU:** IPC один раз на процесс; окно — из `event.sender`.

- **Take `requestSingleInstanceLock`.** Without it, a second OS launch on Windows/Linux is a second process with its own session map, and the uniqueness invariant is trivial to break. On `second-instance` with no document args: focus the last-focused window (do **not** spawn another empty window — that is File → New Window). Document argv / `open-file` remain out of scope; if present later they go through the same open-or-focus path.

  **RU:** `requestSingleInstanceLock`, чтобы второй процесс не открыл тот же файл. Второй запуск без аргументов — focus, не новое окно.

- **File → New Window; Open stays on welcome.** Occupied editors are not given an in-place Open. A second book is: New Window → Open, or Close Project → Open in the same window. On Windows/Linux the File menu currently is only Quit; add New Window **and** Close (window) **before** Exit so closing one document does not quit the app while others remain.

  New windows cascade (`x+24, y+24` from the focused window) so they are not pixel-stacked.

  **RU:** New Window в меню; Open только с welcome. На Win/Linux: New Window, Close, Exit.

- **Window title from snapshot, set in main.** Empty / closed project: `AudioPie`. Open `series`: `{series.title} — AudioPie`. Open `audiobook`: `{book.metadata.title} — AudioPie`. Update on open, create, close, metadata/series-title edits. Renderer may also set `document.title` for consistency; main `win.setTitle` is authoritative for the OS window list.

  **RU:** Заголовок окна = название серии или книги, иначе `AudioPie`.

- **FFmpeg stays process-global; ownership is per window.** Keep `isBusy()` / one `currentCommands[]`. Record `buildOwnerId` when `build/start` succeeds. Progress `webContents.send` goes only to that owner. `build/cancel` from a different window is a no-op. If the owner window closes mid-build, cancel that build (same as today's quit). A second window's `build/start` still throws (existing spec).

  *Alternative considered*: parallel encodes per window. Rejected for this change — disk and CPU contention on large books; can be revisited later.

  **RU:** Одна сборка на процесс; прогресс и cancel — только окну-владельцу.

- **Settings and updater stay process-global.** `settings/set` persists once; broadcast a `settings/changed` event to **all** windows so theme/language stay in sync (today each renderer only reads settings at mount). Language change still `rebuildMenu()` once. Updater has one state; progress UI can target the focused window; install-and-restart quits the whole app.

  **RU:** Настройки и апдейтер на процесс; смена темы/языка рассылается во все окна.

- **Close window = close that session's working dir, then destroy.** Same data loss window as today's `cleanupOnQuit` (working dir deleted; `.audiopie` only as of last explicit Save). When `project-autosave` ships, window `close` becomes another forced-repack checkpoint alongside project-close and `before-quit`. `before-quit` walks **all** remaining sessions.

  **RU:** Закрытие окна чистит только свою working dir. Autosave позже впишет сюда checkpoint.

## Risks / Trade-offs

- [Risk] Two windows + one FFmpeg mutex: user hits Build in window B and gets an error while A encodes for minutes → Mitigation: existing throw stays; later UX can say "a build is already running in another window". No extra UI required for v1.
- [Risk] `realpath` fails (broken symlink, permissions) → Mitigation: fall back to `path.resolve` + normalize; uniqueness may be weaker for that call, but open itself will still fail if the file cannot be read.
- [Risk] Closing the last window on macOS leaves the process with zero sessions; Dock click must `createWindow()` as today (`activate` when `getAllWindows().length === 0`).
- [Risk] `registerIpcHandlers` accidentally left inside `createWindow` → second window throws on duplicate `handle`. Mitigation: register in `whenReady` only; add a comment / guard.
- [Trade-off] Second OS launch focuses an existing window instead of opening another empty one — accepted; New Window is explicit.
- [Trade-off] No "already open" toast — accepted for v1.

**RU:** Риски: ошибка сборки во втором окне; сбой `realpath`; IPC зарегистрирован дважды. Компромисс: второй запуск ОС не создаёт окно.

## Migration Plan

- No file-format change. No data migration.
- Rollout is a main-process + menu behavior change; renderer `AppContext` stays per window with a small branch on `{ kind: 'focused-existing' }`.
- Rollback: restore singleton `project.ts` + captured `win` (high risk of partial revert — treat as one feature toggle in review, not a format unwind).

**RU:** Миграции данных нет. Откат — вернуть синглтон проекта.

## Open Questions

- Keyboard shortcut for New Window (`Cmd+Shift+N` vs `Cmd+N`) — not blocking; can match platform conventions at implementation time. `Cmd+N` currently has no "new project" menu binding (create lives on welcome).
- Whether Windows/Linux File menu should keep a single Exit vs Close+Exit — decided: Close + Exit.
- Broadcasting `settings/changed` vs polling — decided: broadcast.

**RU:** Открытый вопрос: точный шорткат New Window.
