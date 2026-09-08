## Why

AudioPie is a single-document app: one `BrowserWindow`, one global `ProjectState` in `electron/main/project.ts`, IPC handlers closed over that window. A user who is assembling a series and also finishing a standalone audiobook — or comparing two books — has to close one project to open the other. Working directories are already per-session; the renderer is already isolated per window. The missing piece is treating a window as a document.

**RU:** Сейчас AudioPie — однодокументное приложение: одно окно, один глобальный проект в main process. Нельзя держать две разные `.audiopie` сразу. Рабочие директории и рендерер уже изолируемы по окнам; не хватает модели «окно = документ».

## What Changes

- Allow multiple application windows in one process. **New Window** always opens an empty welcome screen (`ProjectManager`), not a copy of the current project.
- Each window owns its own project session (in-memory state, working directory, project path). Open / create / close / save / build in one window MUST NOT mutate another window's session.
- A given `.audiopie` path MAY be open in at most one window. If the user tries to open or create at a path that is already open, the system SHALL bring that existing window to the front (show + focus) and SHALL NOT start a second session, extract, or overwrite. Closing a project (or closing its window) releases the path so it can be opened again.
- Window title reflects the document: empty windows stay `AudioPie`; an open project uses the series title or active book title.
- Open stays on the welcome screen (as today). An occupied editor is not replaced in-place; a second book is opened via New Window (or by closing the current project back to welcome). No File → Open-that-replaces in this change.
- Out of scope: OS file-type association / `.audiopie` icons / double-click-to-open from Finder/Explorer; tabs instead of windows; concurrent M4B builds across windows (keep the existing process-wide one-build-at-a-time mutex); collaborative editing of one file in two places.

**RU:** Несколько окон в одном процессе. Новое окно — всегда пустой welcome. Сессия проекта — на окно. Один канонический путь `.audiopie` — максимум одно окно; повторное открытие фокусирует уже открытое. Заголовок окна отражает документ. Ассоциации файлов ОС, вкладки, параллельные сборки M4B и совместное редактирование — вне рамок.

## Capabilities

### New Capabilities
- `multi-window`: Window lifecycle (create empty window, close window vs quit, titles), the single-open-file rule (canonical-path identity, focus-existing), and routing IPC/dialogs to the requesting window.

### Modified Capabilities
- `project-persistence`: Open, create, close, and save are per-window sessions. Opening or creating at a path already owned by another window focuses that window and leaves the requester unchanged. Close-project in one window MUST NOT destroy another window's working directory.
- `audiobook-build`: Builds remain process-wide one-at-a-time. Progress events and cancel MUST target the window that started the build; cancel in window B MUST NOT kill window A's build.

## Impact

- `electron/main/project.ts`: replace module-level singleton with a session keyed by window (or `webContents.id`); `cleanupOnQuit` walks all sessions.
- `electron/main/ipc.ts`: register handlers once (not per `createWindow`); resolve the session from `event.sender`; native dialogs parented to the requesting window.
- `electron/main/main.ts`: `createWindow` becomes reusable; New Window; close-window cleanup of that session only; existing macOS `activate` / `window-all-closed` behavior preserved.
- `electron/main/menu.ts`: File → New Window; drop the single `mainWindowRef` for window-scoped actions; About/Help target the focused window.
- `electron/main/ffmpeg.ts` / `updater.ts`: keep process-global build mutex and one updater; send progress to the originating window.
- `src/App.tsx` / window title via IPC or `document.title` from snapshot metadata.
- `src/i18n/locales/en.json` / `ru.json`: New Window menu item (and any focus-already-open copy if we surface it).
- Depends on `project-container-format`'s per-session working directories. Compatible with in-flight `project-autosave` (debounce lives in the renderer, already per window) and `project-open-progress` (overlay is per renderer).
