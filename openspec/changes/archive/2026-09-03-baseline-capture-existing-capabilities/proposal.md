## Why

OpenSpec was just initialized in this repository (`openspec/config.yaml` + tooling), but `openspec/specs/` is empty. AudioPie already has substantial shipped functionality (v0.6.15) spanning track management, chapters, metadata, M4B building, project persistence, settings, and auto-update. Without baseline specs, there is no source of truth to diff future changes against, and AI agents/humans have to re-derive behavior from code on every task. This change captures the **current, already-implemented** behavior as OpenSpec capabilities so future changes can be expressed as deltas against a known baseline.

## What Changes

- Document seven existing capabilities as spec files, each reflecting behavior currently implemented in `electron/main/*`, `electron/preload/preload.ts`, and the corresponding `src/components/*` / `src/context/AppContext.tsx` UI.
- No code changes. This is a documentation-only change (spec-writing), intended to be archived immediately to seed `openspec/specs/`.

## Capabilities

### New Capabilities
- `track-management`: Selecting/importing MP3 files (dialog + drag-and-drop), probing duration via FFprobe, reordering via drag handle, inline rename, and removal.
- `chapter-management`: Auto-generating chapters from track boundaries and manually editing chapter titles (chapter time ranges are derived from tracks, not independently editable).
- `metadata-management`: Editing book metadata fields (title, author, genre, description, etc.) and managing cover art (file dialog and drag-and-drop of image files).
- `audiobook-build`: The FFmpeg-based M4B build pipeline (parallel per-track encoding, concat merge, metadata/chapter/cover finalization), progress reporting, cancellation, output path selection, and completion notification. Includes pre-build validation in the UI.
- `project-persistence`: Saving/loading `.audiopie` project files (JSON) and creating new projects, including the "untitled project" guard before save.
- `app-settings`: FFmpeg/FFprobe binary resolution strategy, default bitrate/output directory/thread count, CPU core detection, and theme/language persistence.
- `auto-update`: electron-updater integration — startup/periodic update checks with debounce, manual check, download, install & restart, and enabling/disabling auto-check.

### Modified Capabilities
- None (this is the first set of specs; nothing exists yet to modify).

## Impact

- No source files are touched. This only adds `openspec/specs/<capability>/spec.md` files once archived.
- Establishes the baseline that future feature/fix proposals (e.g. changes to `electron/main/ffmpeg.ts`, `src/components/TrackList.tsx`, etc.) should express as `MODIFIED`/`ADDED`/`REMOVED` deltas against these specs.
