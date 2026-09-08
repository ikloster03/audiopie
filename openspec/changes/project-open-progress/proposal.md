## Why

Opening a `.audiopie` container now extracts a ZIP into a working directory. For a real audiobook that is seconds to minutes of disk I/O, but the welcome screen stays fully interactive and silent until the editor suddenly appears. The user has no idea the app is working, can click Open again, and cannot tell how long is left.

**RU:** Открытие контейнера — это распаковка ZIP в рабочую директорию. На настоящей аудиокниге это секунды или минуты дискового I/O, а приветственный экран молчит и остаётся кликабельным. Нужны блокирующий оверлей и прогресс по байтам.

## What Changes

- While a container-format project is being extracted after the user has chosen a file, show a full-screen, non-dismissable overlay that blocks all interaction (no second Open, no theme/language clicks, no Escape/outside-click to dismiss).
- Drive a determinate progress bar from uncompressed ZIP bytes (`transferred / total`), not from file count, with a human-readable size readout (e.g. `1.2 GB / 3.4 GB`) and percent. Throttle progress events so the renderer is not flooded per stream chunk.
- Show the overlay only after the native open dialog returns a path. Cancelling the dialog MUST NOT flash the overlay. Opening a legacy plain-JSON `.audiopie` is effectively instant and MUST NOT show the overlay.
- Split the current single `project.open()` IPC (dialog + unpack) so the renderer can distinguish "dialog cancelled" from "extract in progress".
- Opening is not cancellable: no Cancel button. An interrupted unzip would leave a half-written working directory; the overlay stays until success or error, then dismisses.
- Out of scope: Save / autosave / import-book / extract-book / copy-on-add track I/O (same overlay pattern can be reused later). Out of scope: changing the audiobook completeness check that currently refuses to enter the editor for an empty/"Untitled" audiobook.

## Capabilities

### New Capabilities
- `project-open-progress`: Blocking overlay, byte-weighted unzip progress, overlay lifecycle relative to the native file dialog, and the IPC contract that reports open progress to the renderer.

### Modified Capabilities
- `project-persistence`: Opening a container-format project is a long-running extract. The open flow MUST surface progress and MUST NOT apply UI state until extract finishes (success, error, or dialog cancel). Legacy JSON open behavior is unchanged aside from not showing the overlay.

## Impact

- `electron/main/projectFile.ts`: `unzipToDirectory` gains a progress callback (two-pass: sum `uncompressedSize`, then extract with per-chunk byte counts).
- `electron/main/project.ts` / `ipc.ts` / `preload.ts`: split open-dialog from open-at-path; emit throttled `project/onProgress` events during extract.
- `src/context/AppContext.tsx`: subscribe to open progress; hold overlay state for the duration of extract.
- `src/App.tsx` / `src/components/ProjectManager.tsx`: mount the overlay above the welcome screen (today `ProgressModal` only exists inside the editor tree).
- New overlay component + BEM SCSS, reusing the existing `Progress` primitive and the visual language of `UpdateProgressModal` / `ProgressModal` (spinner + bar + percent; no cancel).
- `src/i18n/locales/en.json` / `ru.json`: overlay title, description, size labels.
- Depends on `project-container-format` (ZIP working-directory open) being in place.
