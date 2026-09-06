## Context

The workspace originally rendered a horizontal tab bar with `TrackList` and `ChapterList`, plus a top header (add tracks, save, build, close, theme, language, settings). Implementation of this change removed that chrome. Chapters are 1:1 with tracks; `chapters/reorder` and `chapters/renameByTemplate` IPC handlers exist. After the first apply pass, UX iteration dropped inline time-range editing (titles only), moved settings to a sidebar page, and replaced header actions with icon FABs and a compact/expanded sidebar.

**RU:** Изначально рабочее пространство было с вкладками `TrackList`/`ChapterList` и верхней шапкой. Реализация убрала этот chrome. Главы 1:1 с треками; IPC `chapters/reorder` и `chapters/renameByTemplate` есть. После первой реализации UX-итерация убрала редактирование таймкодов (только название), перенесла настройки на страницу сайдбара и заменила шапку на float-кнопки и два режима сайдбара.

## Goals / Non-Goals

**Goals:**
- Make the Chapters view the single primary editing surface for audiobook structure (order and titles), with the book identity (cover + title) visible at the top.
- Keep the track/chapter parallel-array model; start/end remain derived from concatenated track duration and are shown, not edited, in the list.
- Sidebar navigation that can grow (player, statistics later) without another rewrite; Settings is a first-class section.
- Bulk rename-by-template.

**RU (цели):** Панель глав — основная поверхность (порядок и названия) с идентичностью книги (обложка + название) сверху. Модель параллельных массивов трек/глава сохраняется; start/end показываются, не редактируются. Сайдбар масштабируется; Настройки — полноценный раздел. Массовое переименование по шаблону.

**Non-Goals:**
- Splitting/merging chapters vs tracks (still 1:1).
- Independently editable chapter time ranges (reverted after UX review; helpers/tests may remain for a later change).
- Redesigning Metadata form internals.
- Player/Statistics section content (sidebar is ready for them later).

**RU (не цели):** Разбиение/объединение глав и треков. Отдельное редактирование таймкодов глав (откатили после UX). Редизайн формы метаданных. Контент Плеера/Статистики.

## Decisions

- **Chapters remain 1:1 with tracks.** Reordering a chapter reorders its paired track. FFmpeg still concatenates tracks in track order. `chapters/reorder` returns both arrays and recomputes contiguous start/end from track durations while keeping titles.
  - **RU:** Главы 1:1 с треками. Перестановка главы переставляет парный трек. Таймкоды пересчитываются по длительностям треков, названия сохраняются.
- **Only chapter titles are user-editable.** Each row shows track duration (`MM:SS` / `HH:MM:SS`) and a read-only start–end range. Time-range override UX was prototyped then removed; `start < end` validation remains in `src/lib/chapters.ts` for a possible follow-up.
  - **RU:** Редактируется только название. Длительность трека и диапазон — только чтение.
- **Add/remove source files from Chapters.** Toolbar icon adds tracks; per-row remove deletes the paired track and chapter, preserving remaining titles and recomputing times. Drop `.mp3` onto the workspace main area. Header "Add tracks" was removed as duplicate.
  - **RU:** Добавление/удаление исходников из панели глав. DnD MP3 на основную область.
- **Sidebar, not tabs or a top header.** Brand (logo; plus "AudioPie" in expanded mode) is the sidebar header. Sections: Chapters, Metadata, Settings. Close project is in the sidebar footer. `activeSection` is local React state and resets to Chapters when a project is opened — not persisted.
  - **RU:** Сайдбар вместо вкладок и шапки. `activeSection` не персистится, при открытии проекта сбрасывается на Главы.
- **Two sidebar modes**, persisted as `AppSettings.sidebarMode`: `expanded` (default, labels) and `minimal` (logo only, Discord-like round→squircle icon buttons, tooltips, no left active stripe). Switching in Settings applies immediately.
  - **RU:** `sidebarMode`: `expanded` (по умолчанию) и `minimal` (иконки Discord-like). Переключение в настройках сразу.
- **Settings is a page** (`SettingsPage`), not `SettingsDialog`. Theme/language remain on that page (removed from the old header).
  - **RU:** Настройки — страница, не модалка.
- **Save and Build are icon FABs** on Chapters and Metadata only (not Settings). Save is medium, stacked above the large Build button. Both have hover tooltips. The stack hides (slides down + fade) on scroll down and shows on scroll up; always shown near the top of the list.
  - **RU:** Float-кнопки Сохранить (средняя) над Собрать (большая). Скрытие при скролле вниз, показ при скролле вверх.
- **List identity + summary:** top of Chapters is a compact identity block, then the existing count/duration row. Cover thumbnail sits left of the title; both sit **above** chapter count and total duration. Toolbar actions stay on the right of that header (same row as count/duration, or aligned to the identity block — implementation may group them visually as one header).
  ```
  ┌────────┐  Title (or untitled placeholder)
  │ cover  │  12 chapters    15h 54m          [+] [Rename] [Regen]
  └────────┘
  ```
  Cover comes from `metadata.coverPath` via existing `metadata.getCoverDataUrl` (same IPC as Metadata). Missing/failed cover → muted rounded square with a book icon (not a drop target). Empty, whitespace, or default untitled title (`Untitled Audiobook` / localized `common.untitledAudiobook`) → muted placeholder using that untitled string. Real title is prominent, not muted. Header is display-only (no jump to Metadata, no cover picker). Shown in empty states too — placeholders matter most when the book is not filled in yet. Thumbnail ~56×56, `object-cover`, rounded; reserve the box while loading so the header does not jump.
  - **RU:** Сверху панели глав — миниатюра обложки и название из метаданных **над** числом глав и суммарной длительностью. Нет обложки/названия — заглушки. Только отображение, без перехода в Метаданные.
- **Reuse `sortablejs`** for chapter drag-and-drop.
- **No `react-router`:** `activeSection` in `App.tsx`.

## Risks / Trade-offs

- [Risk] No Tracks tab → Mitigation: add/remove from Chapters toolbar and row actions; drop MP3 on the workspace.
- [Risk] Read-only time ranges cannot fix a wrong marker without regenerate → accepted; regenerate still exists; independent edits deferred.
- [Risk] Chapter reorder also reorders tracks → Mitigation: atomic `chapters/reorder` + unit tests in `tests/chapters.test.ts`.
- [Trade-off] Rename-by-template overwrites all titles; no preview/undo.

**RU:** Риски те же, что в английской секции.

## Open Questions

Resolved in implementation:
- Add/remove tracks: yes — icon in Chapters toolbar, remove on each row, drag-and-drop on main.
- `activeSection` persistence: no — always reset to Chapters on project open. `sidebarMode` is persisted instead.
- Time-range overlap warnings: N/A while ranges are not user-editable.

Identity header (section 8):
- Click-through from cover/title to Metadata: no — display-only.
- Author line under the title: no — title only unless we reopen this.

**RU:** Открытые вопросы закрыты реализацией (см. английский список). Шапка идентичности: только отображение, без перехода в Метаданные и без автора.
