## Context

`project-container-format` (implemented, not yet archived) turned `.audiopie` into a ZIP container: opening extracts to a per-session working directory, all editing happens against real files there, and `saveProjectToFile` → `writeContainerAndZip` (in `electron/main/project.ts`) is the only thing that (a) writes each dirty book's `books/<bookId>/index.json` plus the root `index.json` via `writeBookIndex`, and (b) repacks the whole working directory into the target `.audiopie` path via `zipDirectory` (in `electron/main/projectFile.ts`). Both only run today when the user clicks the "Save" FAB in `src/App.tsx`.

Two properties of the current implementation matter a lot for this design:
1. `zipDirectory` is **not incremental** — it `walkFiles`s the entire working directory and `addFile`s every entry again on every call, including every already-copied MP3. A full repack costs I/O proportional to total audio size, not to the size of the edit.
2. Per-book `index.json` is **only written at Save time**, even though copied audio files land in the working directory immediately (copy-on-add). So today, edits to titles/order/metadata are not durable until an explicit Save, even though the audio bytes they refer to already are.

**RU:** `project-container-format` сделал `.audiopie` ZIP-контейнером; сегодня и дешёвая запись per-book `index.json`, и дорогая перепаковка ZIP происходят только по явному клику «Сохранить». `zipDirectory` не инкрементальна — она перечитывает и переписывает все файлы рабочей директории на каждый вызов, включая уже скопированные MP3. Поэтому наивное «сохранять на каждую правку» означает переписывать гигабайты аудио при каждом изменении.

## Goals / Non-Goals

**Goals:**
- Make every edit durable to the working directory (Tier 1) essentially immediately, without requiring the expensive ZIP repack to run that often.
- Repack the actual `.audiopie` file (Tier 2) automatically, without the user ever needing to think about it, while bounding how often the expensive `zipDirectory` walk runs.
- Remove the "Save" FAB and replace it with a passive, honest status indicator (saved / saving / error) so the user always knows whether their `.audiopie` file on disk reflects their latest edits.
- Keep the legacy-JSON-to-container migration (which can copy several GB) as an explicit, user-confirmed action, decoupled from ordinary autosave.
- Give the user an explicit way to write a copy of the project to a different path ("Export a copy…"), since autosave removes the old implicit "Save As on first save" behavior.

**Non-Goals:**
- Crash recovery / resuming an orphaned working directory after an unclean shutdown. `sweepOrphanedWorkingDirs` continues to unconditionally delete leftover `audiopie-*` directories at startup; autosave only shrinks the window of loss to roughly one debounce interval, it does not eliminate it.
- Making `zipDirectory`/ZIP repacking itself incremental (e.g., only rewriting changed entries). Out of scope here — if repack latency turns out to be a problem in practice even with debouncing, that's a follow-up to `project-container-format`'s own "Trade-offs" section, not this change.
- Real-time collaborative editing / conflict resolution for a project open in two places — unchanged non-goal from `project-container-format`.
- Autosaving legacy-JSON projects' *initial* migration silently — that one-time, potentially multi-GB copy stays an explicit confirmation (see Decisions).

**RU:** **Цели**: сделать каждую правку durable в рабочей директории почти мгновенно; автоматически перепаковывать реальный `.audiopie`, ограничивая частоту дорогого шага; убрать кнопку «Сохранить», заменить статус-индикатором; оставить миграцию legacy JSON явным подтверждением; дать явный способ экспортировать копию. **Не цели**: восстановление после краша; инкрементальная перепаковка ZIP; совместное редактирование; молчаливая миграция legacy JSON.

## Decisions

- **Two-tier persistence: cheap "flush" vs. expensive "repack".** Split today's single `writeContainerAndZip` into:
  - `flushWorkingDir()`: writes only the dirty book(s)' `index.json` plus the root `index.json`, via the existing `writeBookIndex`/manifest-write code — no `zipDirectory` call. Runs on (almost) every discrete edit, synchronously enough that the renderer can treat it as "already safe on disk (in the working directory)".
  - `repackContainer()`: the existing `zipDirectory(workingDir, projectPath)` call — unchanged internally, just invoked less often and from a scheduler instead of directly from a button handler.
  - *Alternative considered*: keep them fused and just debounce the fused operation. Rejected — this would mean a debounce window where an edit is durable *nowhere but renderer memory* (worse than today, where at least the audio files are already copied), and it throws away the cheap win of "small JSON write is basically free" by always paying the full zip cost on the same cadence as flush.
  - **RU:** Разделение сегодняшнего `writeContainerAndZip` на дешёвый `flushWorkingDir()` (только JSON, без zip, почти на каждую правку) и дорогой `repackContainer()` (существующий `zipDirectory`, реже, по расписанию).

- **Debounce + checkpoint scheduling for Tier 2, hosted in the renderer's `AppContext`.** After `flushWorkingDir()` succeeds, schedule `repackContainer()` after ~2-3s of edit inactivity (reset the timer on each new edit); additionally force an immediate (non-debounced) `repackContainer()` call at: switching `activeSection` away from an editor section, closing the project, and app `before-quit`. `before-quit` awaits any in-flight or pending repack before `cleanupWorkingDir` runs.
  - *Why the renderer, not the main process*: `AppContext` already owns all the mutation call sites (`addTracksFromPaths`, metadata setters, reorder handlers, series operations) and already tracks `activeSection`/`isProjectOpen` lifecycle — hosting the debounce timer here avoids duplicating "what counts as an edit" knowledge in the main process. The main process exposes simple `project.flush()` / `project.repack()` IPC calls; scheduling policy lives in one place (the renderer).
  - *Alternative considered*: a fixed periodic timer (e.g. every 30s) instead of edit-driven debounce. Rejected: wastes I/O on an idle project with no changes, and still has a worse worst-case loss window than a short debounce for a burst of edits followed by an immediate crash.
  - **RU:** Debounce (~2-3с простоя) + принудительные точки (смена раздела, закрытие проекта, выход) для дорогого repack, планирование живёт в `AppContext` рендерера, т.к. он уже знает обо всех точках правок.

- **Save-status indicator with three states, replacing the Save FAB.** `AppContext` exposes `saveStatus: 'saved' | 'saving' | 'error'`. `saved` after a successful `repackContainer()` with no edits since; `saving` from the moment a debounce timer is scheduled/an immediate repack starts until it resolves; `error` if `repackContainer()` throws (e.g. disk full, permissions), staying `error` until either a successful retry or a new edit reschedules a fresh attempt. Only the `error` state is clickable (manually retries the pending repack); `saved`/`saving` are purely informational, placed where the old Save FAB was, next to Build.
  - *Why surface errors at all instead of silently retrying forever*: without a Save button, silent repeated failure (e.g. the disk is full, or the target path's drive was unmounted) would otherwise be invisible until the user tries to reopen the file later and finds it's stale or missing — a worse outcome than today's model where a failed Save at least errors in the moment of a deliberate click.
  - **RU:** Статус-индикатор из трёх состояний (сохранено/сохраняется/ошибка) вместо кнопки; кликабелен только в состоянии ошибки для ручного повтора.

- **Legacy-JSON migration stays an explicit confirmation, triggered on first edit rather than first Save-click.** Since there's no more Save click to hang the migration off of, the first time `flushWorkingDir()`/`repackContainer()` would need to run for a project that's still `isLegacyPending` (opened from an old plain-JSON file, not yet upgraded this session), the system shows a confirmation dialog ("Upgrade project format? This will copy N files, Y MB total.") before proceeding with the one-time copy-into-working-directory step described in `project-container-format`. Declining leaves the project editable in memory but not autosaved (falls back to prompting again on the next edit, or offering a manual "Save now" affordance scoped just to this one case) — this is the one place a manual, explicit action is unavoidable, given the multi-GB, one-directional nature of the upgrade.
  - **RU:** Миграция legacy JSON остаётся явным подтверждением, но триггерится первой правкой, а не кликом «Сохранить» (которого больше нет). Отказ оставляет проект редактируемым в памяти, но не автосохраняемым, с повторным предложением при следующей правке.

- **"Export a copy…" is a new, separate action — not a repurposed "Save As".** Exposed from the project's Settings page, it calls a new `project.exportCopy(destPath)` that runs `flushWorkingDir()` then `zipDirectory(workingDir, destPath)` **without** changing the in-memory `projectPath` — the currently open project keeps autosaving to its original path. This is a deliberate one-shot "make a copy over there", not a "switch what I'm editing" operation (unlike the removed ad hoc Save-As implied by the old design).
  - **RU:** «Экспортировать копию…» — новое отдельное действие в настройках проекта, пишет копию по другому пути, не переключая путь автосохранения текущего открытого проекта.

## Risks / Trade-offs

- [Risk] A burst of rapid edits (e.g., dragging to reorder 10 books, or fast-typing a title) could still trigger more `repackContainer()` calls than necessary if the debounce window is too short, each one re-walking and re-writing the whole working directory → Mitigation: 2-3s idle debounce (tunable), plus the debounce timer is reset (not stacked) on each new edit, so a continuous burst of edits produces exactly one repack shortly after the burst ends, not one per edit.
  - **RU:** [Риск] Серия быстрых правок может вызвать больше перепаковок, чем нужно → Смягчение: сброс (не накопление) таймера debounce на каждую новую правку.
- [Risk] Forcing a repack on every section-navigation (e.g., `chapters` → `settings`) could still be frequent for a user who clicks around a lot → Mitigation: skip the forced repack if `saveStatus` is already `saved` (no edits since the last successful repack) — the forced-checkpoint calls become no-ops unless there's actually something pending.
  - **RU:** [Риск] Принудительный repack при каждой смене раздела может быть частым → Смягчение: пропускать его, если `saveStatus` уже `saved` (нечего сохранять).
- [Risk] `before-quit` awaiting a pending repack could delay app shutdown for a very large audiobook if the user quits right after a burst of edits → Mitigation: this is bounded by the same one-time repack cost `project-container-format` already accepts for explicit Save; show a brief "Saving before exit…" state if it's still recognizable within Electron's quit lifecycle, consistent with how the existing `cleanupOnQuit`/`stopPeriodicUpdateChecks` sequence in `main.ts` already gates shutdown.
  - **RU:** [Риск] Ожидание repack перед выходом может задержать закрытие приложения для очень длинной книги → Смягчение: та же стоимость, что и раньше принималась для явного Save; показать состояние «Сохранение перед выходом…».
- [Trade-off] Removing the Save button means there is no way to force an *immediate* repack outside of navigating away, closing, or quitting — a user who wants to be sure "right now" has no explicit action beyond waiting out the debounce → accepted; the status indicator communicates `saving`/`saved` so the user can see progress instead of blindly trusting a click.
  - **RU:** [Компромисс] Нет способа принудительно вызвать немедленный repack, кроме ожидания debounce/смены раздела/закрытия — принято осознанно, статус-индикатор показывает прогресс.
- [Risk] `repackContainer()` failing (e.g. disk full) with no user-initiated action means the user could keep editing for a while without noticing the `error` status if it's a small/subtle badge → Mitigation: use an unmissable but non-blocking treatment (e.g. red dot + text, matching existing alert patterns like `app__alert--destructive`), not just a color change on a small icon.
  - **RU:** [Риск] Ошибка repack без явного действия пользователя может остаться незамеченной → Смягчение: заметное, но не блокирующее отображение ошибки.

## Migration Plan

- No data migration needed beyond what `project-container-format` already defines. This change is purely additive/behavioral on top of that change's file format and working-directory lifecycle.
- **Rollout**: ship together with or immediately after `project-container-format` is archived, since this design assumes its working-directory model, per-book `index.json` helpers, and `zipDirectory` are already in place.
- **Rollback**: if autosave needs to be reverted, the Save FAB and `handleSaveProject` can be restored and the debounce scheduler disabled without any file-format changes to unwind — this change touches UI/scheduling, not the container format itself.

**RU:** Миграция данных не требуется сверх уже определённой в `project-container-format`. Раскатка — вместе с архивацией того change или сразу после. Откат — восстановить кнопку «Сохранить» и отключить планировщик debounce, без изменений формата файла.

## Open Questions

- Exact debounce duration (2s vs 3s vs configurable in Settings) — left as an implementation-time tuning decision, not blocking.
- Whether the legacy-migration confirmation dialog should offer a "don't ask again, always upgrade automatically" checkbox for power users, vs. always confirming per-file — leaning toward always-confirm-per-file for v1 given it's a one-directional, per-file event that only happens once per legacy file ever.
- Whether "Export a copy…" should also offer re-exporting in the legacy plain-JSON format for interop with older AudioPie versions — `project-container-format`'s design explicitly marks this a non-goal, so default answer is no, but worth re-confirming it doesn't get smuggled back in via this new UI surface.

**RU:** Открытые вопросы: точная длительность debounce; нужен ли чекбокс «не спрашивать больше» для миграции; нужен ли экспорт обратно в legacy JSON (по умолчанию — нет, как и решено в `project-container-format`).
