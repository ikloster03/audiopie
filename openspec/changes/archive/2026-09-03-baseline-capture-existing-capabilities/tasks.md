## 1. Spec authoring (documentation only — no code changes)

- [x] 1.1 Write `track-management` baseline spec from `electron/main/ipc.ts`, `electron/main/ffmpeg.ts` (`probeDuration`), and `src/components/TrackList.tsx`
- [x] 1.2 Write `chapter-management` baseline spec from `computeChaptersFromTracks` in `electron/main/ipc.ts` and `src/components/ChapterList.tsx`
- [x] 1.3 Write `metadata-management` baseline spec from the `metadata/*` handlers in `electron/main/ipc.ts` and `src/components/MetadataForm.tsx`
- [x] 1.4 Write `audiobook-build` baseline spec from `electron/main/ffmpeg.ts` (`buildAudiobook`) and the `build/*` handlers plus `App.tsx`'s pre-build validation
- [x] 1.5 Write `project-persistence` baseline spec from `electron/main/project.ts` and `src/components/ProjectManager.tsx`
- [x] 1.6 Write `app-settings` baseline spec from `electron/main/settings.ts` and `src/components/SettingsDialog.tsx`
- [x] 1.7 Write `auto-update` baseline spec from `electron/main/updater.ts`

## 2. Bilingual translation

- [x] 2.1 Add Russian (`**RU:**`) translation to every requirement description and every scenario across all 7 spec files
- [x] 2.2 Codify the bilingual EN/RU spec convention as a `rules.specs` entry in `openspec/config.yaml` so future `openspec instructions specs` calls surface it automatically

## 3. Verify

- [x] 3.1 Run `openspec validate baseline-capture-existing-capabilities --strict` and fix any missing scenarios
- [x] 3.2 Archive the change so specs land in `openspec/specs/`
