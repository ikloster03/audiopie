## Why

The current editing workspace exposes raw MP3 "tracks" as a first-class, user-facing concept (a separate tab with its own list, drag-and-drop, and rename controls) even though the audiobook the user actually cares about is expressed in **chapters**. This duplicates editing surfaces (tracks tab + chapters tab), forces users to rename tracks and then again reconcile with auto-generated chapter titles, and offers no fast way to fix naming across many chapters at once. The top-level tab navigation also doesn't scale well as more views (media player, statistics) get added. Consolidating around chapters as the single editable unit, adding bulk-rename-by-template, and moving to a sidebar-based navigation addresses GitHub issues [#25](https://github.com/ikloster03/audiopie/issues/25), [#26](https://github.com/ikloster03/audiopie/issues/26), and [#22](https://github.com/ikloster03/audiopie/issues/22).

**RU:** Сейчас исходные MP3-«треки» показываются пользователю как отдельная сущность (отдельная вкладка со своим списком, drag-and-drop и переименованием), хотя пользователя интересует именно структура **глав** аудиокниги. Это дублирует поверхности редактирования (вкладка треков + вкладка глав) и не даёт быстро поправить названия сразу у многих глав. Верхнеуровневая навигация по вкладкам также плохо масштабируется по мере добавления новых экранов (плеер, статистика). Переход к главам как единственной редактируемой единице, добавление массового переименования по шаблону и sidebar-навигация закрывают issues #25, #26 и #22.

## What Changes

- Remove the standalone "Tracks" tab from the primary workspace UI; MP3 tracks become an internal/technical concept, no longer directly editable by the user in the main workflow. **BREAKING** (removes the `TrackList` tab and any direct track-rename/track-reorder UI entry points).
  - **RU:** Убрать отдельную вкладку «Треки» из основного UI рабочего пространства; MP3-треки становятся внутренней/технической сущностью, больше не редактируемой пользователем напрямую в основном сценарии. **ЛОМАЮЩЕЕ ИЗМЕНЕНИЕ** (удаляет вкладку `TrackList` и любые точки входа для прямого переименования/переупорядочивания треков).
- Promote the chapters view to the primary editing surface for the audiobook structure: users can reorder chapters via drag-and-drop, rename chapter titles inline, and edit each chapter's start/end time range directly (previously time range was derived only from tracks and not independently editable).
  - **RU:** Сделать панель глав основной поверхностью редактирования структуры аудиокниги: пользователь может изменять порядок глав перетаскиванием, редактировать названия глав прямо в списке и напрямую редактировать время начала/конца каждой главы (раньше временной диапазон вычислялся только из треков и не редактировался отдельно).
- Add "rename chapters by template" bulk action: user supplies a template with a numeric placeholder (e.g. `Chapter {n}`) and the system renames all chapters sequentially in one operation.
  - **RU:** Добавить массовое действие «переименовать главы по шаблону»: пользователь задаёт шаблон с числовым плейсхолдером (например, `Chapter {n}`), и система переименовывает все главы последовательно за одну операцию.
- Replace the top-level tab navigation with a persistent sidebar (Discord-style) that lists the primary workspace sections (Chapters, Metadata, and future sections such as Player/Statistics), improving navigation scalability and affordance for active/selected state.
  - **RU:** Заменить верхнеуровневую навигацию по вкладкам постоянной боковой панелью (в стиле Discord) со списком основных разделов рабочего пространства (Главы, Метаданные и будущие разделы вроде Плеера/Статистики), что улучшает масштабируемость навигации и индикацию активного/выбранного раздела.
- Reordering chapters directly SHALL also reorder the underlying tracks, since chapter order still ultimately drives build order (chapters no longer strictly mirror 1:1 auto-generated tracks order without the ability to adjust it from the chapters UI).
  - **RU:** Изменение порядка глав напрямую ДОЛЖНО также менять порядок соответствующих треков, поскольку порядок глав в итоге определяет порядок при сборке (главы больше не строго зеркалят автоматически сгенерированный порядок треков без возможности его скорректировать из UI глав).

## Capabilities

### New Capabilities
- `workspace-navigation`: Sidebar-based primary navigation between workspace sections (Chapters, Metadata, and future sections), replacing top tab bar.
  - **RU:** Основная навигация между разделами рабочего пространства (Главы, Метаданные и будущие разделы) на основе боковой панели, заменяющая верхнюю панель вкладок.

### Modified Capabilities
- `chapter-management`: Chapters become independently reorderable (drag-and-drop) and their start/end time range becomes directly editable; adds bulk rename-by-template action.
  - **RU:** Главы становятся независимо переупорядочиваемыми (drag-and-drop), их временной диапазон начала/конца становится напрямую редактируемым; добавляется массовое действие переименования по шаблону.
- `track-management`: Track list is no longer directly exposed/editable in the primary UI; track order is now driven by chapter reordering rather than a separate track drag-and-drop UI.
  - **RU:** Список треков больше не отображается/не редактируется напрямую в основном UI; порядок треков теперь определяется переупорядочиванием глав, а не отдельным UI drag-and-drop для треков.

## Impact

- `src/App.tsx`: remove tab bar, wire up sidebar layout and routing between Chapters/Metadata sections.
- `src/components/TrackList.tsx`: removed from primary UI (component may be deleted or repurposed as an internal/debug view).
- `src/components/ChapterList.tsx`: extended with drag-and-drop (likely via existing `sortablejs` dependency), editable time-range inputs, and a "rename by template" action/dialog.
- New sidebar component (e.g. `src/components/WorkspaceSidebar.tsx`) + BEM styles.
- `electron/main/ipc.ts` / `electron/preload/preload.ts`: likely need a `chapters/reorder` IPC handler (analogous to existing `tracks/reorder`) and a `chapters/renameByTemplate` handler, since chapter reordering must persist to the underlying track order.
- `src/i18n/locales/en.json` and `ru.json`: new strings for sidebar navigation and rename-by-template UI.

**RU:** `src/App.tsx` — убрать панель вкладок, подключить sidebar-layout и переключение между разделами Главы/Метаданные. `src/components/TrackList.tsx` — убрать из основного UI (компонент можно удалить или превратить во внутренний/отладочный вид). `src/components/ChapterList.tsx` — добавить drag-and-drop (вероятно через уже имеющуюся зависимость `sortablejs`), редактируемые поля временного диапазона и действие/диалог «переименовать по шаблону». Новый компонент боковой панели (например, `src/components/WorkspaceSidebar.tsx`) + стили по BEM. `electron/main/ipc.ts` / `electron/preload/preload.ts` — вероятно потребуются обработчики `chapters/reorder` (по аналогии с существующим `tracks/reorder`) и `chapters/renameByTemplate`, так как переупорядочивание глав должно сохраняться и в порядке треков. `src/i18n/locales/en.json` и `ru.json` — новые строки для навигации по боковой панели и UI переименования по шаблону.
