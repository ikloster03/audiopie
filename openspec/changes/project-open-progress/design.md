## Context

`project-container-format` made opening a `.audiopie` file an extract: `openProjectAtPath` → `detectFormat` → `unzipToDirectory` into a per-session working directory. That I/O is proportional to audio size (STORE ZIP, streaming via `yauzl`), not to JSON parse time.

The renderer still treats open as an opaque `await window.audioPie.project.open()` that both shows the native file dialog *and* extracts. `ProjectManager.handleOpenProject` has no loading flag. `App.tsx` returns `<ProjectManager />` alone when `!isProjectOpen`, so `ProgressModal` (build) and `UpdateProgressModal` are not even mounted on the welcome screen. After the dialog closes, the user stares at the same cards with no feedback and can click Open again.

Legacy plain-JSON open remains a cheap `readFile` + parse and does not need a progress UI.

**RU:** Открытие контейнера — распаковка ZIP в рабочую директорию, время растёт с размером аудио. Рендерер ждёт один IPC `project.open()` (диалог + unpack) без флага загрузки; модалки прогресса живут только внутри редактора. Старый JSON открывается мгновенно и в прогрессе не нуждается.

## Goals / Non-Goals

**Goals:**
- Block the welcome-screen UI for the whole extract (no double-open, no incidental clicks).
- Show honest determinate progress from uncompressed ZIP bytes, including while a single large MP3 is streaming.
- Show the overlay only after a file path is chosen — never during the native dialog, never on cancel, never for legacy JSON.
- Keep unzip non-cancellable so a half-written working directory is not left behind by a UI Cancel.

**Non-Goals:**
- Progress/blocking for Save, autosave repack, import-book, extract-book, or copy-on-add. The progress type and overlay component SHOULD be reusable later, but those call sites are out of scope.
- Changing the audiobook completeness check (`Untitled Audiobook` / zero tracks refuses to enter the editor). Overlay MUST still dismiss if that check fails.
- Making unzip cancellable, or moving unpack to a worker thread.
- Changing ZIP library choice (`yauzl` stays).

**RU:** **Цели:** блокировать приветственный экран на время распаковки; честный прогресс по байтам; оверлей только после выбора файла; без отмены unzip. **Не цели:** Save/импорт/extract/copy-on-add; правка completeness check; отмена unzip; смена ZIP-библиотеки.

## Decisions

- **Byte-weighted progress, not file-count.** Almost all archive mass is a handful of MP3s; `index.json` / covers are noise. Stepping "file 3 of 22" freezes the bar for the entire large track. `yauzl` `entry.uncompressedSize` is the right total (STORE ≈ on-disk size). During an entry, count `data.length` on the read stream so the bar moves inside a 400 MB file, not only at entry boundaries.
  - *Alternative considered*: `currentEntry / entryCount`. Rejected: the bar would jump on tiny files and stall on audio.
  - **RU:** Прогресс по `uncompressedSize` и чанкам стрима, не по числу файлов.

- **Two-pass unzip in `unzipToDirectory`.** Pass 1 opens the ZIP, walks entries, sums `uncompressedSize`, does not extract (central-directory walk is cheap even on multi-GB files). Pass 2 reopens and extracts as today, reporting `transferred / total` on chunks. Optional `onProgress({ transferred, total })` callback; existing callers that omit it keep current behavior.
  - *Alternative considered*: single pass with unknown total until the end. Rejected: a determinate bar needs `total` up front. *Alternative*: parse the central directory without a second open. Rejected as a premature `yauzl` internals dependency; a second `yauzl.open` is milliseconds.
  - **RU:** Два прохода: сумма размеров, затем extract с колбэком прогресса. Без колбэка поведение как сейчас.

- **Split dialog from extract at the IPC boundary.** Replace the fused `project.open()` with:
  - `project.selectOpenPath(): Promise<string | undefined>` — native dialog only; `undefined` on cancel.
  - `project.openPath(path): Promise<ProjectSnapshot>` — detect format, extract if container, return snapshot (today's `openProjectAtPath`).
  - `project.onProgress(listener)` — subscribe to throttled progress during `openPath` extract.
  Renderer sequence: select → if no path, return → set overlay visible → `openPath` → apply snapshot / completeness check → always hide overlay. Future "recent projects" can call `openPath` directly and get the same overlay.
  - *Alternative considered*: keep one `project.open()` and have main emit a `project:extracting` event after the dialog. Works, but the renderer still cannot start the overlay *before* the first event, and recent-files open would want `openPath` anyway.
  - **RU:** Разделить диалог и распаковку. Рендерер включает оверлей только между успешным `selectOpenPath` и завершением `openPath`.

- **Throttle progress IPC in the main process (~100–200 ms, plus first and last event).** Stream `data` can fire thousands of times per second. Mirror the existing `build/onProgress` send pattern (`webContents.send`) on a distinct channel `project/onProgress` so it cannot be confused with a build. Payload:

  ```ts
  type ProjectIoProgress = {
    phase: 'open';
    percent: number;       // 0–100, transferred/total
    transferred: number;   // bytes
    total: number;         // bytes; 0 during pass 1
  };
  ```

  `phase: 'open'` is the only value this change emits; the field exists so Save/import can reuse the type later.
  - **RU:** Троттлинг 100–200 мс в main; канал `project/onProgress`, не `build/onProgress`.

- **New overlay component mounted at the App root, always.** Do not reuse `ProgressModal` (build-specific copy, Cancel button, only rendered when a project is open). New BEM block (e.g. `open-progress`) using the existing `Progress` primitive and the same visual language as `UpdateProgressModal`: spinner + title + bar + percent + `transferred / total` (human-readable sizes). Dialog: no close button, `onInteractOutside` prevented, Escape prevented. During pass 1 (`total === 0`) show a preparing/indeterminate message, not a lying 0% bar that looks stuck.
  - **RU:** Отдельный оверлей в корне `App` (и на welcome, и на случай `openPath` из редактора позже). Не переиспользовать `ProgressModal`. Без Cancel/Escape.

- **Errors dismiss the overlay and stay on the project manager.** If `openPath` throws, hide overlay, do not enter the editor, surface the error with the same pattern already used for build failures (`alert` today is acceptable; a dedicated toast is out of scope). If the completeness check rejects the snapshot, hide overlay and stay on the manager (existing behavior, just no longer "invisible wait then nothing").
  - **RU:** Ошибка или провал completeness — оверлей снимается, редактор не открывается.

## Risks / Trade-offs

- [Risk] Two-pass open adds a second `yauzl.open` → Mitigation: pass 1 only reads the central directory; cost is negligible next to copying GB of MP3s. Validate with the existing large-archive smoke test plus a unit test that the progress callback reaches 100 and that `transferred === total`.
  - **RU:** Второй open ZIP дешёвый (только CD); проверить смоук-тестом и колбэком до 100%.
- [Risk] Throttle makes the last chunks look "stuck" at 99% → Mitigation: always emit a final event at 100% when unzip resolves, regardless of throttle window.
  - **RU:** Финальное событие на 100% всегда, вне троттлинга.
- [Risk] Overlay behind the native dialog if someone wires `setVisible(true)` before `selectOpenPath` → Mitigation: spec and tasks require visible=true only after a path is returned; `ProjectManager` is the only current call site.
  - **RU:** Оверлей включать только после возврата пути.
- [Trade-off] No Cancel means a mistaken 8 GB open must be waited out or the app quit → accepted for v1; unclean cancel is worse than a long wait.
  - **RU:** Без отмены в v1 — прерванный unzip хуже долгого ожидания.
- [Trade-off] Save/import remain silent after this change → accepted; overlay + `ProjectIoProgress` are shaped for reuse, not wired yet.
  - **RU:** Save/импорт по-прежнему без оверлея; контракт прогресса рассчитан на повторное использование.

## Migration Plan

None. No on-disk format change, no settings migration. Older AudioPie versions are unaffected. Roll back by reverting the change; project files are untouched.

**RU:** Миграции нет — только UI/IPC поверх существующего контейнера.

## Open Questions

- Exact throttle interval (100 vs 200 ms) is an implementation-time tuning choice, not a product decision.
- Whether a failed `openPath` uses `alert()` or a non-blocking `Alert` on the project manager is left to implementation; either is fine as long as the overlay is gone and the editor is not shown.

**RU:** Интервал троттлинга и точный вид сообщения об ошибке — на этапе реализации.
