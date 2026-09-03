## Context

`electron/main/ffmpeg.ts` already computes build duration and output file size for the completion notification (per the existing `audiobook-build` "Build completion" requirement), and already reports `phase`/`percent`/`message` progress events. There is currently no persistence of this data beyond the one-time OS notification.

**RU:** `electron/main/ffmpeg.ts` уже вычисляет длительность сборки и размер выходного файла для уведомления о завершении (согласно существующему требованию «Завершение сборки» из `audiobook-build`) и уже сообщает события прогресса `phase`/`percent`/`message`. Сейчас эти данные нигде не сохраняются, кроме единоразового системного уведомления.

## Goals / Non-Goals

**Goals:**
- Capture build outcome data (duration, size, settings, outcome) for every build attempt without adding new user-facing settings.
- Keep the history scoped per-project (traveling with the `.audiopie` file) rather than global, since build time is heavily influenced by project size/content.

**RU (цели):** Фиксировать данные о результате сборки (длительность, размер, настройки, результат) для каждой попытки сборки без добавления новых пользовательских настроек. Хранить историю в рамках проекта (перемещаясь вместе с `.audiopie`-файлом), а не глобально, поскольку время сборки сильно зависит от размера/содержимого проекта.

**Non-Goals:**
- Cross-project aggregate analytics (e.g. "average build time across all your projects") — out of scope, could be a future change if useful.
- Charting/graphing the history (a simple list/table is sufficient for v1).

**RU (не цели):** Агрегированная аналитика между проектами (например, «среднее время сборки по всем вашим проектам») — вне рамок, может стать будущим изменением при необходимости. Построение графиков по истории (простого списка/таблицы достаточно для v1).

## Decisions

- **Store history in the project file, not a separate global store.** Build time is a function of the specific project's track count/length/bitrate, so per-project history (traveling with the `.audiopie` file, consistent with how `project-persistence` already models project-scoped data) is more useful than a global log. This also means history is naturally preserved when a project file is copied/shared/backed up.
  - *Alternative considered*: global `electron-store`-based history keyed by project path. Rejected because paths can change (rename/move) and would orphan history; embedding in the file itself avoids that.
  - **RU:** Хранить историю в файле проекта, а не в отдельном глобальном хранилище. Время сборки — функция от количества/длины треков и битрейта конкретного проекта, поэтому история на уровне проекта (перемещающаяся вместе с `.audiopie`-файлом, согласуется с тем, как `project-persistence` уже моделирует данные проекта) полезнее глобального журнала. Это также означает, что история естественным образом сохраняется при копировании/передаче/резервном копировании файла проекта. *Рассмотренная альтернатива*: глобальная история на основе `electron-store`, ключом к которой служит путь проекта. Отклонено, поскольку пути могут меняться (переименование/перемещение), что осиротит историю; встраивание в сам файл этого избегает.
- **History entry captured at build completion time in the main process** (where duration/size are already computed), then pushed to the renderer via the existing build-completion IPC event (extended with the new fields) rather than the renderer reconstructing it from separate signals.
  - **RU:** Запись истории фиксируется в момент завершения сборки в главном процессе (где длительность/размер уже вычислены), затем передаётся в рендерер через существующее событие IPC завершения сборки (расширенное новыми полями), а не восстанавливается рендерером из отдельных сигналов.
- **Persistence timing**: the new history entry is added to the in-memory project immediately on build completion (so the Build Statistics view can show it right away), but is only written to disk on the next explicit project save — consistent with how all other in-memory project mutations (tracks, chapters, metadata) already work.
  - **RU:** Момент сохранения: новая запись истории добавляется в проект в памяти сразу по завершении сборки (чтобы экран статистики мог сразу её показать), но записывается на диск только при следующем явном сохранении проекта — согласуется с тем, как уже работают все остальные изменения проекта в памяти (треки, главы, метаданные).

## Risks / Trade-offs

- [Risk] If the user builds several times without saving the project, unsaved build history entries are lost on app close → Mitigation: acceptable, consistent with existing behavior for all other unsaved project state (tracks/chapters/metadata edits are also lost without an explicit save).
  - **RU:** [Риск] Если пользователь несколько раз собирает проект без сохранения, несохранённые записи истории теряются при закрытии приложения → Смягчение: приемлемо, согласуется с существующим поведением для всех остальных несохранённых состояний проекта (изменения треков/глав/метаданных также теряются без явного сохранения).
- [Trade-off] Storing history in the project file grows file size slightly over time (capped at 20 entries × small JSON objects — negligible, a few KB at most).
  - **RU:** [Компромисс] Хранение истории в файле проекта немного увеличивает его размер со временем (ограничено 20 записями × небольшие JSON-объекты — незначительно, максимум несколько КБ).
