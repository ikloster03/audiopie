## 1. Container format foundation

- [x] 1.1 Spike/evaluate ZIP libraries for streaming pack/unpack in Electron (`yazl`/`yauzl` vs. `adm-zip` vs. `archiver`/`node-stream-zip`); confirm no native/prebuilt-binary dependency and cross-platform (macOS/Windows/Linux) behavior; record the choice in `design.md`
- [x] 1.2 Add the chosen ZIP dependency to `package.json`
- [x] 1.3 Create `electron/main/projectFile.ts`: `zipDirectory(sourceDir, destPath)` and `unzipToDirectory(zipPath, destDir)` using streaming APIs, both using the `STORE` (uncompressed) method
- [x] 1.4 Create `electron/main/projectFile.ts`: `detectFormat(filePath)` sniffing the first bytes (`PK\x03\x04` vs. JSON-looking `{`) to distinguish container vs. legacy JSON, independent of file extension
- [x] 1.5 Create working-directory helpers: `createWorkingDir()` (under `app.getPath('temp')`, unique per session), `cleanupWorkingDir(dir)`, and a startup sweep that removes orphaned `audiopie-*` temp directories left behind by a crash

## 2. Data model

- [x] 2.1 Define `ProjectType = 'audiobook' | 'series'`, `SeriesMetadata` (`{ title, author?, narrator?, description? }` — no cover), the root manifest shape (`{ version: 2, type, series: SeriesMetadata | null, bookOrder: string[] }`), and the per-book `index.json` shape (`{ metadata: BookMetadata, tracks: TrackInfo[] }`, `BookMetadata` gaining an optional `coverFile`) in `src/types.ts` and `electron/main/types.ts`
- [x] 2.2 Keep the legacy flat shape (`{ version: 1, tracks, chapters, metadata }`) as a distinct type for reading old files only
- [x] 2.3 Add a chapter-derivation helper that computes a book's chapter list (title, sequential `startMs`/`endMs`) from its own `tracks` array, replacing any code path that read a separately-stored `chapters` array for container-format projects
- [x] 2.4 Add a helper to read/write a single book's `books/<bookId>/index.json` in isolation (used by per-book edits, extract, and import — never requires touching the root manifest or any other book)

## 3. Main process: container read/write

- [x] 3.1 Rewrite `electron/main/project.ts`'s `openProjectFromFile` to: detect format via `detectFormat`; for a container, extract to a new working directory via `unzipToDirectory`, parse the root `index.json`, and lazily read each referenced book's own `index.json`; for legacy JSON, parse as today (tracks keep external paths, no copying, no working directory yet)
- [x] 3.2 Rewrite `saveProjectToFile` to: if the in-memory project has a working directory (container-format or already-upgraded-this-session legacy project), write the root `index.json` and every dirty book's own `index.json` into it, then call `zipDirectory` to the target path; if the in-memory project is still legacy-JSON-only (never yet saved this session), first create a working directory, copy every track's external file into `books/<bookId>/`, write that book's `index.json` plus a root `index.json` (`bookOrder: [bookId]`), then zip
- [x] 3.3 Add `project.new(type, savePath)`: create a working directory, write a minimal root `index.json` for the chosen type (`bookOrder: [oneEmptyBookId]` for `audiobook`; `bookOrder: []`, `series: {...}` for `series`) plus that book's own `index.json` if one was created, zip it to `savePath` immediately, and set it as the active project
- [x] 3.4 Track a `workingDir` alongside the existing `projectPath`/`projectData` module state in `project.ts`; clean it up via `cleanupWorkingDir` on `closeProject`, on opening a different project, and on app quit (`before-quit`)
- [x] 3.5 Update `tracks.addFromPaths` to copy each source file into the active book's `books/<bookId>/` folder within the working directory before probing duration, and to remove the copy if probing fails
- [x] 3.6 Update track removal to delete the corresponding file from the working directory in addition to removing the `tracks` entry from that book's own `index.json`
- [x] 3.7 Update `electron/main/ffmpeg.ts`'s build pipeline call sites to resolve chapter file paths from the working directory instead of `tracks[].path` pointing at arbitrary external locations (no-op for still-legacy-and-unsaved projects, which keep working the old way until their first save)

## 4. Series & book management (main + preload)

- [x] 4.1 Add IPC handlers: create a new book within an open series (`project.addBookToSeries()` — creates `books/<bookId>/index.json` seeded from `series.author`/`series.narrator`, appends id to `bookOrder`), remove a book (`project.removeBookFromSeries(bookId)` — removes id from `bookOrder`), reorder books (`project.reorderBooks(order: string[])` — rewrites `bookOrder`), update a book's `metadata.seriesIndex` (`project.updateBookSeriesIndex(bookId, seriesIndex)` — patches only that book's own `index.json`)
- [x] 4.2 Add IPC handler `project.importBookFromFile(filePath)`: open the given file (rejecting `type: 'series'`), copy its book folder (index.json, tracks, cover) into a new `books/<bookId>/` folder in the current series' working directory, append its id to `bookOrder`
- [x] 4.3 Add IPC handler `project.extractBook(bookId, savePath)`: write that single book folder out as a new `type: 'audiobook'` container at `savePath` (its own working directory, its own root `index.json` with `bookOrder: [bookId]`, its own zip), without removing it from the source series
- [x] 4.4 Add IPC handler `project.newFromTemplate(templatePath)`: read an existing `type: 'audiobook'` file's book metadata (rejecting `type: 'series'` templates) for use when creating a new audiobook
- [x] 4.5 Add IPC handler `project.setType(newType)` implementing the Settings danger zone switch: `audiobook → series` sets `type: 'series'` and initializes empty `series` metadata, no file changes to `books/`; `series → audiobook` with `bookOrder.length > 1` requires the caller to have already confirmed (see renderer task 7.3) and then deletes every `books/<id>/` folder except `bookOrder[0]`, sets `bookOrder` to that one id, sets `type: 'audiobook'`, clears `series` to `null`; `series → audiobook` with zero books first creates one empty book
- [x] 4.6 Expose all new `project.*` methods in `electron/preload/preload.ts` and update the `AudioPieAPI` types

## 5. Renderer: creation flow

- [x] 5.1 Update `src/components/ProjectManager.tsx`: "Create new" opens a sub-screen with "Audiobook"/"Series" tiles; either choice immediately opens a native save dialog (via `project.new(type, savePath)`) before entering the editor
- [x] 5.2 Add the "Start from existing project…" secondary option under "Audiobook", wired to `project.newFromTemplate`
- [x] 5.3 Remove the "cannot save empty project" guard/warning UI (superseded — every project now has a path from creation)
- [x] 5.4 Update the open-project UI-completeness check in `AppContext`/`ProjectManager.tsx` so `type: 'series'` files with zero books are accepted (the audiobook-specific "zero tracks" check no longer applies to a series)

## 6. Renderer: unified series page

- [x] 6.1 Build/rework the series management page component: left column renders the series metadata form (title, author, narrator, description — no cover field); right column renders the member book list
- [x] 6.2 Member book list: always-on drag handles (`sortablejs`, mirroring `ChapterList`'s pattern) persisting reorder via `project.reorderBooks`; clicking a row's body (not the handle) switches the active book; each row shows that book's own cover (from its `metadata.coverFile`), not a series cover
- [x] 6.3 Member book list: editable series-number input per row bound to `metadata.seriesIndex`, wired to `project.updateBookSeriesIndex`, visually distinct from a muted drag-order index
- [x] 6.4 Add the floating "Add book" action (replacing "Build" while the series page is active) with its two-item menu: "Create new book" (`project.addBookToSeries`) and "Import from existing project file" (native file dialog + `project.importBookFromFile`)
- [x] 6.5 Add "Remove from series" flow: confirmation dialog offering "Extract as standalone audiobook file" (`project.extractBook` + save dialog) before calling `project.removeBookFromSeries`
- [x] 6.6 Update `WorkspaceSidebar` so a `type: 'series'` project shows one entry for the unified page plus Settings (no separate Books/Metadata tabs, no rail)

## 7. Renderer: Settings danger zone (change project type)

- [x] 7.1 Add a "Danger zone" section to the project's Settings view (`WorkspaceSidebar`'s `settings` section) with an "Audiobook"/"Series" type switch control
- [x] 7.2 Wire `audiobook → series` to call `project.setType('series')` immediately, no confirmation, then navigate to the unified series page
- [x] 7.3 Wire `series → audiobook` to first check the current book count: if more than one, show a confirmation modal naming exactly how many books will be permanently deleted before calling `project.setType('audiobook')`; if the user cancels, make no IPC call and leave the UI state unchanged
- [x] 7.4 After a confirmed `series → audiobook` switch, update `AppContext` to reflect the single remaining book as the active book and navigate away from the series page

## 8. Renderer: member book context

- [x] 8.1 Update `src/components/MetadataForm.tsx`: when the active book belongs to an open series container, show a "Part of series: `<title>`" callout with a "Back to series" action that switches the active view without closing the container
- [x] 8.2 Track "which book within the open container is currently active for editing" in `AppContext` (needed once a container can hold more than one book)

## 9. Localization

- [x] 9.1 Add new i18n keys (project type picker sub-screen, up-front save dialog copy, series page labels, "Add book" menu, manual series-number input, "part of series"/"back to series", remove/extract confirmation, Settings danger zone labels and the series→audiobook deletion-warning modal copy) to `src/i18n/locales/en.json`
- [x] 9.2 Add matching Russian translations to `src/i18n/locales/ru.json`

## 10. Tests

- [x] 10.1 Unit test: `detectFormat` correctly distinguishes a ZIP container from legacy JSON regardless of file extension
- [x] 10.2 Unit test: opening a legacy JSON `.audiopie` file loads tracks/chapters/metadata without copying any files or creating a working directory
- [x] 10.3 Unit test: saving a legacy-loaded project for the first time copies all referenced tracks into a new working directory and writes a valid `version: 2` root + per-book `index.json`; a second save does not re-copy from the original external paths
- [x] 10.4 Unit test: creating a new audiobook/series via `project.new` writes a valid minimal container to the chosen path immediately
- [x] 10.5 Unit test: adding a track copies the source file into the working directory and the original external file is untouched; removing a track deletes its working-directory copy
- [x] 10.6 Unit test: round-tripping a multi-book series (save, then reopen) preserves `bookOrder`, each book's `id`, and each book's `metadata.seriesIndex`
- [x] 10.7 Unit test: reordering books does not rename any `books/<id>/` folder; editing `metadata.seriesIndex` does not change `bookOrder`
- [x] 10.8 Unit test: `project.importBookFromFile` rejects a `type: 'series'` source file; `project.newFromTemplate` rejects a `type: 'series'` template
- [x] 10.9 Unit test: `project.setType('series')` on an audiobook does not touch `books/`; `project.setType('audiobook')` on a series with 3 books keeps only `bookOrder[0]`'s folder and deletes the other two; on a 0-book series it creates exactly one new empty book
- [x] 10.10 Smoke test: pack/unpack a large synthetic multi-hour audiobook working directory (streaming) and confirm memory usage stays bounded (doesn't buffer the whole book), to validate the ZIP library choice from task 1.1
- [ ] 10.11 Manual test: opening a container-format project, adding/removing tracks, reordering chapters, and saving round-trips correctly via the FFmpeg build pipeline
- [ ] 10.12 Manual test: extracting a book from a series produces an openable, standalone `type: 'audiobook'` file with that book's tracks, metadata, and cover intact
- [ ] 10.13 Manual test: Settings danger zone — switching a 3-book series to "Audiobook" shows the correct book count in the warning, cancelling leaves all 3 books intact, confirming leaves only the first

## 11. Documentation & migration housekeeping

- [x] 11.1 Update `CLAUDE.md`'s "Project file format" description and `BookMetadata`/`TrackInfo`/`BuildOptions` type snippets to reflect the container model (root manifest + per-book `index.json`, no series cover)
- [x] 11.2 Add a CHANGELOG entry calling out the breaking, one-directional format upgrade (new-format files are not openable by older AudioPie versions)
- [x] 11.3 Mark `openspec/changes/project-types-and-series/proposal.md` with a superseded notice pointing at this change; leave its artifacts in place for historical reference rather than archiving it as completed
