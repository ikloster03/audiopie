## Why

The current editing workspace exposes raw MP3 "tracks" as a first-class, user-facing concept (a separate tab with its own list, drag-and-drop, and rename controls) even though the audiobook the user actually cares about is expressed in **chapters**. This duplicates editing surfaces (tracks tab + chapters tab), forces users to rename tracks and then again reconcile with auto-generated chapter titles, and offers no fast way to fix naming across many chapters at once. The top-level tab navigation also doesn't scale well as more views (media player, statistics) get added. Consolidating around chapters as the single editable unit, adding bulk-rename-by-template, and moving to a sidebar-based navigation addresses GitHub issues [#25](https://github.com/ikloster03/audiopie/issues/25), [#26](https://github.com/ikloster03/audiopie/issues/26), and [#22](https://github.com/ikloster03/audiopie/issues/22).

**RU:** Сейчас исходные MP3-«треки» показываются пользователю как отдельная сущность (отдельная вкладка со своим списком, drag-and-drop и переименованием), хотя пользователя интересует именно структура **глав** аудиокниги. Это дублирует поверхности редактирования (вкладка треков + вкладка глав) и не даёт быстро поправить названия сразу у многих глав. Верхнеуровневая навигация по вкладкам также плохо масштабируется по мере добавления новых экранов (плеер, статистика). Переход к главам как единственной редактируемой единице, добавление массового переименования по шаблону и sidebar-навигация закрывают issues #25, #26 и #22.

## What Changes

- Remove the standalone "Tracks" tab and the workspace top header from the primary UI; MP3 tracks become an internal/technical concept. Source files are added/removed from the Chapters view. **BREAKING** (removes the `TrackList` tab, the header bar, and any direct track-rename/track-reorder UI entry points).
  - **RU:** Убрать отдельную вкладку «Треки» и верхнюю шапку рабочего пространства из основного UI; MP3-треки становятся внутренней/технической сущностью. Исходные файлы добавляются/удаляются из панели глав. **ЛОМАЮЩЕЕ ИЗМЕНЕНИЕ**.
- Promote the chapters view to the primary editing surface: users can reorder chapters via drag-and-drop and rename titles inline. Each row shows the paired track duration and a read-only start–end range; only the title is editable. The list header shows the audiobook cover thumbnail and title from metadata (with placeholders when missing), then chapter count and total audiobook duration (e.g. `15ч 54м`).
  - **RU:** Сделать панель глав основной поверхностью редактирования: пользователь меняет порядок глав перетаскиванием и редактирует названия. В строке показываются длительность исходного трека и диапазон начала/конца только для чтения; редактируется только название. В шапке списка — миниатюра обложки и название из метаданных (с заглушками, если их нет), затем число глав и суммарная длительность книги (например, `15ч 54м`).
- Add "rename chapters by template" bulk action: user supplies a template with a numeric placeholder (e.g. `Chapter {n}`) and the system renames all chapters sequentially in one operation.
  - **RU:** Добавить массовое действие «переименовать главы по шаблону».
- Replace the top-level tab bar (and header) with a persistent sidebar. Sections: Chapters, Metadata, Settings. Brand (logo ± title) sits at the top of the sidebar. Two persisted modes: expanded (labels) and minimal (Discord-like icon buttons with tooltips).
  - **RU:** Заменить вкладки и шапку постоянной боковой панелью. Разделы: Главы, Метаданные, Настройки. Бренд вверху сайдбара. Два сохраняемых режима: расширенный (с подписями) и минимальный (иконки в стиле Discord с тултипами).
- Settings open as a workspace page (not a modal). Save and Build are icon-only floating buttons on Chapters/Metadata (Save medium, Build large); they hide on scroll down and reappear on scroll up.
  - **RU:** Настройки — страница рабочего пространства, не модалка. «Сохранить» и «Собрать» — float-кнопки-иконки на страницах глав и метаданных; скрываются при скролле вниз и появляются при скролле вверх.
- Reordering chapters SHALL also reorder the underlying tracks, since chapter order drives build order.
  - **RU:** Изменение порядка глав ДОЛЖНО также менять порядок соответствующих треков.

## Capabilities

### New Capabilities
- `workspace-navigation`: Sidebar-based primary navigation between workspace sections (Chapters, Metadata, Settings), replacing the top tab bar and header; includes expanded/minimal sidebar modes and scroll-aware floating Save/Build actions.
  - **RU:** Основная навигация по разделам (Главы, Метаданные, Настройки) на основе боковой панели; режимы сайдбара и float-кнопки Сохранить/Собрать.

### Modified Capabilities
- `chapter-management`: Chapters are independently reorderable (drag-and-drop); titles are inline-editable; start/end and track duration are displayed read-only; bulk rename-by-template; identity header (cover + title from metadata, with placeholders) above count + total duration.
  - **RU:** Главы переупорядочиваются drag-and-drop; названия редактируются в списке; время и длительность трека только отображаются; массовое переименование по шаблону; шапка идентичности (обложка + название из метаданных, с заглушками) над сводкой «число глав + длительность».
- `track-management`: Track list is no longer a dedicated tab; add/remove happens from the Chapters view; track order follows chapter reorder.
  - **RU:** Отдельной вкладки треков нет; добавление/удаление из панели глав; порядок треков следует за порядком глав.
- `app-settings`: Settings are a sidebar page; persisted `sidebarMode` (`expanded` | `minimal`).
  - **RU:** Настройки — страница сайдбара; сохраняемый `sidebarMode` (`expanded` | `minimal`).

## Impact

- `src/App.tsx`: sidebar layout, no header/tab bar, FAB stack, scroll-hide.
- `src/components/TrackList.tsx`: deleted.
- `src/components/ChapterList.tsx`: drag-and-drop, title-only editing, duration/range display, rename-by-template, add/remove source files, identity header (cover + title) above count + total duration.
- `src/components/WorkspaceSidebar.tsx` + BEM styles; expanded/minimal modes.
- `src/components/SettingsPage.tsx` replaces `SettingsDialog`.
- `electron/main/ipc.ts` / `electron/preload/preload.ts`: `chapters/reorder`, `chapters/renameByTemplate`.
- `electron/main/settings.ts` / `AppSettings`: `sidebarMode`.
- `src/i18n/locales/en.json` and `ru.json`: sidebar, FABs, settings, duration strings.

**RU:** См. английский список Impact — те же файлы и контракты.
