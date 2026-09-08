## Context

Packaged AudioPie already ships an **application** icon (`assets/audiopie.png` / `audiopie-mac.png` / `audiopie.ico`) via `electron-builder.json` `mac.icon` / `win.icon` / `linux.icon`. It does **not** declare `fileAssociations`, so the OS does not treat `.audiopie` as an AudioPie document. `electron/main/main.ts` never handles `open-file`, first-launch argv, or `second-instance` document arguments.

`multi-window-projects` (in-flight, not yet implemented) is the prerequisite document model: per-window `ProjectSession`, `openPaths` canonical-path index, `{ kind: 'loaded' | 'focused-existing' }`, reusable `createWindow`, `requestSingleInstanceLock`. Its spec already says a second launch *without* document args focuses the last-focused window and does not create one. Document argv / `open-file` were explicit non-goals there, with a pointer that they should later reuse open-or-focus.

`project-open-progress` splits `project.selectOpenPath` from `project.openPath` and shows a blocking extract overlay only after a path is known. That `openPath` + overlay path is what OS-open should invoke, instead of a second extract pipeline.

**RU:** Иконка приложения есть, типа файла — нет. `main.ts` не принимает пути от ОС. Документная модель и lock придут из `multi-window-projects`; оверлей распаковки — из `project-open-progress` (`openPath`). Этот change — регистрация типа + проводка OS-пути в уже спроектированный open-or-focus.

## Goals / Non-Goals

**Goals:**
- Register `.audiopie` on macOS, Windows, and Linux so Finder/Explorer/file managers can show a document icon and offer AudioPie as the handler.
- Open that file when the OS supplies the path (cold start and while running), using **Rule A**.
- Reuse `openPaths` / `focused-existing` / `createWindow` / `project.openPath` + extract overlay. Do not add a parallel open stack.

**Non-Goals:**
- Implementing `multi-window-projects` or `project-open-progress` (dependencies).
- Distinct "document sheet" artwork; per-type icons for audiobook vs series; changing `appId`.
- Linux `.deb`/`.rpm`; guaranteeing MIME icons in every AppImage desktop environment.
- In-place File → Open that replaces an occupied editor (still welcome-only inside the app).
- Opening non-`.audiopie` paths the OS might pass.

**RU:** **Цели:** регистрация `.audiopie` + Rule A + переиспользование open-or-focus и `openPath`. **Не цели:** сами зависимости, отдельный document-арт, native Linux-пакеты, подмена занятого редактора, чужие расширения.

## Decisions

- **Rule A is a main-process function `openDocumentPath(filePath)`, applied to every OS-supplied `.audiopie` path.** After `canonicalizeProjectPath` (from multi-window):

  1. If `openPaths` already owns the key → `show`+`focus` that window; do not extract; do not notify another renderer to load.
  2. Else if there is at least one window whose session has no `projectPath` (welcome): pick the last-focused empty window if it is empty, otherwise any empty window → send that renderer the path to open (see below).
  3. Else `createWindow()` (cascade like New Window), wait until that renderer is ready, then send it the path.

  Occupied editors are never replaced. A second OS launch *with* a document is allowed to create a window; a second launch *without* one still must not (multi-window).

  *Alternative considered*: always create a new window (even when welcome is sitting empty). Rejected: stacking empty windows is sloppy; reuse welcome matches "the app was waiting for a document".
  *Alternative considered*: load in main then push a snapshot event. Rejected: `project-open-progress` already owns overlay + `openPath` in the renderer; duplicating extract/progress in a main-only path would fork that design.

  **RU:** `openDocumentPath` в main: focus / reuse welcome / новое окно. Occupied не трогаем. Extract делает рендерер через `openPath`.

- **Renderer opens via the existing `project.openPath` flow.** Main does **not** call `openProjectAtPath` for the OS-open load case itself (except the `openPaths` lookup which must happen in main *before* asking a renderer, so two windows cannot race into the same file). Sequence for cases 2–3:

  1. Main reserves the target window (and may create it).
  2. When `did-finish-load` (or the window already exists and is idle), `webContents.send('project/openFromOs', filePath)`.
  3. That renderer shows the extract overlay (container) and `invoke('project/openPath', filePath)` — same as after `selectOpenPath`. Completeness check, errors, overlay dismiss stay as in `project-open-progress`.

  `openPath` still registers `openPaths` on success. If between send and invoke another window somehow took the path, `openPath` returns `focused-existing` and this renderer stays on welcome.

  **RU:** Main выбирает окно и шлёт путь; рендерер открывает через `openPath` с тем же оверлеем.

- **Buffer OS paths until `app.whenReady` (and until the target window has loaded).** macOS `open-file` can fire before `ready`. Collect paths in a queue; `preventDefault()`. After ready + multi-window session wiring, drain the queue through `openDocumentPath`. Cold start with a document: the first `createWindow` in `whenReady` **is** the target (do not create an empty window *and* a document window). If the queue is empty, first window stays welcome as today.

  **RU:** Очередь путей до `ready` и до load окна. Холодный старт — одно окно, сразу с документом, без лишнего welcome.

- **Parse argv conservatively.** Treat a launch/second-instance argument as a document only if the path (after `path.resolve` against `cwd` when relative) has extension `.audiopie` (case-insensitive). Ignore the executable, Electron/helper flags (`--devtools`, `-d`, `--allow-file-access-from-files`, etc.), and any other files. Multiple `.audiopie` args: apply Rule A to each in order (several new windows if needed).

  **RU:** В argv/second-instance открывать только `*.audiopie`; несколько файлов — Rule A по очереди.

- **Reuse the app-icon artwork as the document icon.** `fileAssociations` in `electron-builder.json`:

  ```json
  "fileAssociations": [
    {
      "ext": "audiopie",
      "name": "AudioPie Project",
      "description": "AudioPie project",
      "mimeType": "application/x-audiopie",
      "role": "Editor"
    }
  ]
  ```

  Do not set a separate `icon` unless builder requires an explicit file; the app icon (`mac.icon` / `win.icon` / `linux.icon`) is the source. If builder needs a named `{ext}.icns`/`.ico` in `build/` or `assets/`, generate it from the existing SVG/PNG via the already-present `sharp` / `png-to-ico` / `scripts/svg-to-ico.mjs` / `scripts/generate-mac-icon.mjs` — same artwork, not new brand. Distinct folded-corner document art is a later change.

  *Alternative considered*: custom document ICNS from the start. Deferred so this change is packaging + routing, not illustration.

  **RU:** Тот же арт, что у приложения. `mimeType`: `application/x-audiopie`. Отдельный document-арт — позже.

- **Linux is best-effort.** Ship MIME + icon metadata on the AppImage. Do not add `.deb`/`.rpm` in this change. ZIP magic (`PK`) may still win over `*.audiopie` glob in some environments; acceptable for v1. `fix-linux-icon` stays about the **app** launcher icon, not this file type.

  **RU:** AppImage MIME без native-пакетов; конфликт с `application/zip` на Linux допустим в v1.

- **Depends on multi-window landing first (or in the same implementation train).** `openDocumentPath` needs `sessions`, `openPaths`, `createWindow`, and `requestSingleInstanceLock`. `second-instance` handler from multi-window currently focuses last-focused when there are no document args; this change **extends** that handler: if argv contains `.audiopie` paths, call `openDocumentPath` instead of the empty-launch focus-only behavior.

  **RU:** Сначала (или вместе) `multi-window-projects`. Этот change расширяет `second-instance`, не заменяет lock.

## Risks / Trade-offs

- [Risk] `open-file` before `ready` dropped → Mitigation: queue + `preventDefault` registered as early as the module loads, not inside `whenReady`.
- [Risk] New window not loaded when `openFromOs` is sent → Mitigation: wait for `did-finish-load` (or replay on `did-finish-load` if the renderer missed the first event).
- [Risk] Race: two OS opens of the same path into two empty windows → Mitigation: `openPaths` check and reservation stay in main inside `openDocumentPath` / `openPath`; serialize OS-open on a single queue.
- [Risk] AppImage never shows the custom icon → Mitigation: document as best-effort; macOS/Windows are the bar for v1.
- [Risk] Completeness check rejects an OS-opened file → Mitigation: same as dialog-open (`project-open-progress`): hide overlay, stay on that window's welcome, surface the error. Do not quit the app.
- [Trade-off] App icon as document icon looks like "the app, as a file" in Finder → accepted for v1 versus blocking on illustration.
- [Trade-off] Rule A can create many windows if the user opens ten files at once → accepted; it is what a document app does.

**RU:** Риски: потеря pre-ready `open-file`; гонка двух окон на один путь; AppImage без иконки. Компромисс: арт приложения как иконка файла.

## Migration Plan

- No on-disk format change. Existing `.audiopie` files gain an OS type only after the user installs a build that includes `fileAssociations`.
- Older AudioPie versions ignore the association (they never claimed the type).
- Rollback: revert packaging + `openDocumentPath` wiring; files remain valid.
- Implementation order: `multi-window-projects` (and ideally `project-open-progress`) before or with this change. Do not ship file associations on the current single-window singleton — a double-click would skip the path or violate single-open.

**RU:** Миграции формата нет. Не шипить ассоциации до multi-window.

## Open Questions

- Whether electron-builder on macOS needs an explicit `audiopie.icns` in `build/` or converts from `mac.icon` automatically — resolve at implementation by inspecting a local/CI pack.
- Keyboard/Open Recent is `add-recent-projects` (separate); OS-open should still work if that change has not landed.

**RU:** Нужен ли явный `.icns` — проверить на сборке. Recent projects — другой change.
