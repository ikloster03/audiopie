## 1. Unzip progress in main

- [ ] 1.1 Add `ProjectIoProgress` (`{ phase: 'open'; percent: number; transferred: number; total: number }`) to `electron/main/types.ts` and `src/types.ts`
- [ ] 1.2 Extend `unzipToDirectory` in `electron/main/projectFile.ts` with an optional `onProgress({ transferred, total })` callback: pass 1 sums `entry.uncompressedSize` without extracting; pass 2 extracts as today and counts read-stream chunk bytes; omit callback → current behavior
- [ ] 1.3 Always invoke `onProgress` at the start of pass 2 (`transferred: 0`, known `total`) and once at completion (`transferred === total`); throttle intermediate chunk updates to ~100–200 ms
- [ ] 1.4 Keep `zipDirectory` unchanged (Save progress is out of scope)

## 2. IPC: split open dialog from extract

- [ ] 2.1 Add `project.selectOpenPath` IPC handler that only shows the native open dialog and returns the chosen path or `undefined` on cancel (extract today's dialog out of `openProjectFromFile`)
- [ ] 2.2 Keep `openProjectAtPath` as the extract/parse implementation; add `project.openPath(filePath)` IPC that calls it
- [ ] 2.3 During container extract in `openProjectAtPath` / `loadContainerAt`, forward throttled `unzipToDirectory` progress to the renderer as `project/onProgress` (`ProjectIoProgress` with `phase: 'open'`). Do not emit progress for legacy JSON
- [ ] 2.4 Remove or stop using the fused `project/open` handler from the renderer (dialog + extract in one call). Leave a thin wrapper only if other main-process call sites still need it
- [ ] 2.5 Expose `project.selectOpenPath`, `project.openPath`, and `project.onProgress` (subscribe/unsubscribe, same pattern as `build.onProgress`) in `electron/preload/preload.ts`

## 3. Renderer overlay

- [ ] 3.1 Add open-progress state to `AppContext` (`openProgress`, overlay visible flag); subscribe to `project.onProgress`; clear both when `openPath` settles
- [ ] 3.2 Rewrite `openProjectFromDialog`: `selectOpenPath` → if no path, return false without overlay → if `detect` is not needed in renderer, call `openPath` after showing overlay → apply snapshot / completeness check in `finally` hide overlay. On `openPath` throw, hide overlay, do not enter the editor, surface an error
- [ ] 3.3 Create `OpenProgressOverlay` (BEM block, e.g. `open-progress`): spinner, title, preparing copy when `total === 0`, otherwise `Progress` bar + percent + human-readable `transferred / total`. No cancel/close. Prevent backdrop click and Escape. Reuse `Progress` primitive; do not reuse `ProgressModal`
- [ ] 3.4 Add `src/styles/components/open-progress.scss` and `@import` it from `globals.scss`
- [ ] 3.5 Mount `OpenProgressOverlay` from `App.tsx` **outside** the `isProjectOpen` early return so it works on the project-manager screen
- [ ] 3.6 Add en/ru i18n keys for overlay title, description, preparing state, and size/percent labels

## 4. Tests

- [ ] 4.1 Unit-test `unzipToDirectory` progress: last callback has `transferred === total` and `percent` 100; at least one callback during a multi-chunk file has `0 < transferred < total`; omitting `onProgress` still extracts correctly
- [ ] 4.2 Confirm existing `tests/projectFile.smoke.test.ts` unpack still streams (no whole-archive buffer) with the two-pass implementation
- [ ] 4.3 Extend `tests/projectContainer.test.ts` (or equivalent) so opening a container via `openProjectAtPath` still returns a valid snapshot after the unzip callback wiring
