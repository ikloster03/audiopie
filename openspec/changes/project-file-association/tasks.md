## 1. Packaging

- [ ] 1.1 Add top-level `fileAssociations` in `electron-builder.json` for `ext: audiopie`, name `AudioPie Project`, `description`, `mimeType: application/x-audiopie`, `role: Editor` (RU: добавить `fileAssociations` для `.audiopie`)
- [ ] 1.2 Point the association at the existing app-icon artwork (omit a separate `icon` if electron-builder inherits `mac.icon` / `win.icon` / `linux.icon`; otherwise generate `{ext}.icns` / `.ico` from `assets/audiopie.svg` via existing `sharp` / `png-to-ico` / `scripts/*` — same logo, no new illustration) (RU: иконка документа из существующего арта приложения)
- [ ] 1.3 After a pack (or `--dir` inspect), confirm macOS `Info.plist` / Windows association metadata / Linux MIME XML mention `.audiopie` and `application/x-audiopie` (RU: проверить, что сборка реально объявляет тип файла)

## 2. Path helpers

- [ ] 2.1 Add `collectAudiopiePathsFromArgv(argv, cwd)` that returns only resolved paths whose extension is `.audiopie` (case-insensitive), ignoring the executable, Electron flags (`--devtools`, `-d`, etc.), and other files (RU: вытащить из argv только пути `.audiopie`)
- [ ] 2.2 Export that helper from a unit-testable module (not only inline in `main.ts`) (RU: хелпер должен быть тестируемым без Electron)

## 3. Rule A (`openDocumentPath`)

- [ ] 3.1 Implement `openDocumentPath(filePath)` in main on top of multi-window `canonicalizeProjectPath` / `openPaths` / sessions: (1) already open → show+focus, return; (2) else reuse last-focused empty window if empty, else any welcome window; (3) else `createWindow()` (cascade) and wait for `did-finish-load` (RU: Rule A в main)
- [ ] 3.2 For cases (2) and (3), `webContents.send('project/openFromOs', filePath)` to the target window only; do not call `openProjectAtPath` in this function (renderer drives `openPath`) (RU: слать путь в рендерер, не открывать в main)
- [ ] 3.3 Serialize OS-open through a single queue so two rapid opens of the same path cannot create two sessions (RU: очередь, без гонки на один путь)
- [ ] 3.4 Multiple `.audiopie` paths: call `openDocumentPath` for each in order (RU: несколько файлов — по очереди)

## 4. OS event wiring

- [ ] 4.1 Register `app.on('open-file')` at module load (not inside `whenReady`): `preventDefault()`, push path onto a pre-ready queue (RU: буфер `open-file` до `ready`)
- [ ] 4.2 After `whenReady` (and after multi-window sessions/IPC are up): drain the queue through `openDocumentPath`. If the queue was non-empty, the first `createWindow` is the document window — do not also create a spare empty welcome (RU: холодный старт — одно окно с документом)
- [ ] 4.3 On first launch, parse `process.argv` with `collectAudiopiePathsFromArgv` and feed those paths through the same drain (RU: argv первого запуска)
- [ ] 4.4 Extend multi-window's `second-instance` handler: if argv contains `.audiopie` paths, `openDocumentPath` each; if not, keep focus-last-focused and do not create a window (RU: `second-instance` с файлом vs без)

## 5. Renderer

- [ ] 5.1 Preload: subscribe to `project/openFromOs` (path string) (RU: канал в preload)
- [ ] 5.2 In `AppContext`, on `openFromOs`: show extract overlay, `project.openPath(path)`, apply snapshot / completeness check / errors, always hide overlay in `finally` — same sequence as after `selectOpenPath` (RU: тот же поток, что у диалога)
- [ ] 5.3 If `openPath` returns `focused-existing`, do not apply a snapshot and do not keep the overlay (RU: чужое окно уже открыло файл)

## 6. Tests

- [ ] 6.1 Unit-test `collectAudiopiePathsFromArgv`: flags ignored, relative paths resolved against cwd, case-insensitive `.audiopie`, mixed argv with one project and noise (RU: тесты парсера argv)
- [ ] 6.2 Unit-test Rule A target selection as a pure function if extracted (already-open → existing id; empty window present → that id; none empty → `create`) (RU: тесты выбора окна)
- [ ] 6.3 Existing project container / open-path tests still pass (OS-open must not bypass `openPath`) (RU: старые тесты открытия не ломаются)
