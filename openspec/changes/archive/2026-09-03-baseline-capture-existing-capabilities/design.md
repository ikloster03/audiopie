## Context

AudioPie has been developed for several months without OpenSpec. This change is purely a documentation exercise: it reads the existing implementation (`electron/main/*`, `electron/preload/preload.ts`, `src/components/*`, `src/context/AppContext.tsx`) and transcribes current behavior into spec files. There is no new architecture, dependency, or migration involved.

## Goals / Non-Goals

**Goals:**
- Seed `openspec/specs/` with an accurate baseline of the seven capabilities that exist today.
- Preserve intentionally odd/legacy behaviors as-is (e.g. renaming a track silently discards manual chapter title edits; opening a project that fails the UI's completeness check loads data into the main process but never surfaces it in the renderer) so future changes can consciously decide whether to fix or keep them.

**Non-Goals:**
- No refactoring or bug-fixing of the documented behaviors.
- No new capability, IPC handler, or UI change.
- No exhaustive documentation of every UI component (styling, i18n keys, shadcn primitives) — specs focus on observable product behavior, not implementation detail.

## Decisions

### Decision: One capability per major feature area, not per file
Capabilities are grouped by user-facing feature (`track-management`, `chapter-management`, `metadata-management`, `audiobook-build`, `project-persistence`, `app-settings`, `auto-update`) rather than by source file, since a single IPC namespace (e.g. `ipc.ts`) spans multiple product concerns and a single product concern spans multiple files (main + preload + component).

### Decision: Capture quirks explicitly rather than "clean up" the spec
Where the code has surprising interactions (chapter regeneration on track rename, silent no-op on an incomplete opened project), the spec states them explicitly as scenarios instead of writing an idealized version, since the goal is an accurate baseline, not a redesign.

## Risks / Trade-offs

- [Risk] Specs may drift from code immediately after future unrelated changes if contributors forget to update them → Mitigation: treat every future PR touching `electron/main/*` or the related components as needing a spec delta, per the project's OpenSpec workflow.
- [Risk] Some `BookMetadata` fields (narrator, series, seriesIndex, year, publisher) are modeled but not yet exposed in the UI form → documented as current state in `metadata-management`; a future change can add UI for them as a `MODIFIED Requirements` delta.
