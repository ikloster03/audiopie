## Why

A `.audiopie` file currently looks like a generic document (or a ZIP) in Finder, Explorer, and Linux file managers, because the packaged app never registers the extension. Double-clicking it either does nothing useful or launches AudioPie onto the welcome screen, ignoring the path. Now that `multi-window-projects` defines a window as a document — one canonical path per window, `requestSingleInstanceLock`, open-or-focus — the OS can hand us a file without inventing a second document model.

**RU:** Файл `.audiopie` в Finder/Explorer/файловом менеджере выглядит как обычный документ (или ZIP): расширение не зарегистрировано. Двойной клик либо ничего не делает, либо открывает welcome и игнорирует путь. `multi-window-projects` уже задаёт «окно = документ», single-instance lock и open-or-focus — ОС может отдать файл в эту модель, не изобретая вторую.

## What Changes

- Register `.audiopie` as AudioPie's document type on macOS, Windows, and Linux (electron-builder `fileAssociations`, per-platform document icon, Linux MIME `application/x-audiopie`).
- Reuse the existing app-icon artwork for the document icon in v1 (no separate "piece of paper" document art). Distinct document artwork is out of scope.
- Open a project when the OS supplies a path: macOS `open-file`, Windows/Linux `process.argv` on first launch and `second-instance` argv thereafter.
- **Rule A (document launch):** if that canonical path is already open, focus its window (existing `focused-existing`). Else if any window is on welcome with no project, load into that window. Else create a **new** window and open the file there — never replace an occupied editor in-place, never ignore the file.
- Cold start by double-clicking a file: the first window loads that project (no welcome flash if avoidable). Buffer macOS `open-file` events that arrive before `ready`.
- OS-open of a container-format file SHALL use the same extract overlay as dialog-open (`project-open-progress`). Legacy JSON still has no overlay.
- Out of scope: changing `appId` (`com.example.audiopie`); Linux `.deb`/`.rpm` (AppImage only, MIME registration is best-effort); in-place File → Open in an occupied editor; distinct per-type icons (audiobook vs series); implementing `multi-window-projects` itself (this change depends on it).

**RU:** Регистрация `.audiopie` на трёх ОС с иконкой (в v1 — тот же арт, что у приложения). Открытие пути от ОС: `open-file` / argv / `second-instance`. Правило A: уже открыт → focus; есть пустой welcome → загрузить туда; иначе новое окно с документом, без подмены занятого редактора. Холодный старт по клику загружает файл в первое окно. Оверлей распаковки — как у диалога. Вне рамок: смена `appId`, native Linux-пакеты, отдельный document-арт, сам `multi-window-projects` (это зависимость).

## Capabilities

### New Capabilities
- `file-association`: OS registration of the `.audiopie` type (icons, MIME, file associations in the packaged app) and opening a project from an OS-supplied path using Rule A (focus-existing / reuse empty welcome / else new window).

### Modified Capabilities
- `project-persistence`: A project MAY be opened from an OS-supplied filesystem path, not only from the in-app open dialog. That path still goes through the same load/extract path (`openProjectAtPath` / open-or-focus) as a dialog-chosen file.
- `multi-window`: A second OS launch **with** a project file in the arguments (or a macOS `open-file` while running) SHALL open-or-focus that document per Rule A, including creating a new window when every existing window already holds a different project. This is the document-args counterpart of the already-specified "second launch with no document arguments focuses last-focused and does not create a window".
- `project-open-progress`: The extract overlay MAY appear when extract is started by an OS-supplied path, not only after the native open dialog. Cancelling a dialog still MUST NOT show it; `focused-existing` still MUST NOT.

## Impact

- `electron-builder.json`: top-level `fileAssociations` for `audiopie`; document icon paths per platform; Linux `mimeType`.
- `assets/`: document-icon derivatives from existing SVG/PNG/ICO (mac `.icns` or builder-converted PNG, win `.ico`, linux PNG). Existing `scripts/svg-to-ico.mjs` / `scripts/generate-mac-icon.mjs` / `sharp` / `png-to-ico` may be reused or extended.
- `electron/main/main.ts`: `open-file` (including pre-`ready` buffer), first-launch argv, `second-instance` document args routed through Rule A; `createWindow` may be created as a document window, not only empty welcome.
- `electron/main/project.ts` / `ipc.ts` / preload: a main-process entry that opens a path into a chosen or new window (session + `openPaths` + `{ kind: 'loaded' | 'focused-existing' }`), then tells that renderer to apply the snapshot / show overlay. OS-open has no requesting renderer until a window exists.
- Depends on `multi-window-projects` (sessions, `openPaths`, single-instance lock, reusable `createWindow`). Compatible with `project-autosave` (new window is another session) and `project-open-progress` (overlay on the window that extracts).
- `fix-linux-icon` remains a separate app-launcher icon fix; this change is the **file type** icon.

**RU:** `electron-builder.json` + ассеты иконок документа; `main.ts` маршрутизирует OS-пути по правилу A; открытие в сессию окна без диалога. Зависит от `multi-window-projects`. `fix-linux-icon` — про иконку приложения, не файла.
