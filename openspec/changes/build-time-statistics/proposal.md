## Why

The build-completion notification already reports a single build's duration and output size, but that information disappears once dismissed — there's no history to compare build times across attempts (e.g. after changing bitrate or thread count) or to understand how build time scales as a project grows. Addresses GitHub issue [#33](https://github.com/ikloster03/audiopie/issues/33).

**RU:** Уведомление о завершении сборки уже сообщает длительность и размер выходного файла для одной сборки, но эта информация исчезает после закрытия уведомления — нет истории, чтобы сравнить время сборки между попытками (например, после изменения битрейта или количества потоков) или понять, как время сборки растёт вместе с проектом. Закрывает issue #33.

## What Changes

- Record a build history entry (timestamp, duration, output file size, bitrate, thread count used, success/failure) each time a build completes or fails, scoped to the current project.
  - **RU:** Записывать запись истории сборки (временная метка, длительность, размер выходного файла, битрейт, использованное количество потоков, успех/неудача) каждый раз при завершении или сбое сборки, в рамках текущего проекта.
- Persist this history as part of the project file so it travels with the `.audiopie` project and survives app restarts.
  - **RU:** Сохранять эту историю как часть файла проекта, чтобы она перемещалась вместе с `.audiopie`-проектом и сохранялась между перезапусками приложения.
- Add a "Build Statistics" view showing the history as a simple list/table (most recent first), with at least: date/time, duration, output size, and the bitrate/thread settings used.
  - **RU:** Добавить экран «Статистика сборки», показывающий историю в виде простого списка/таблицы (от самой недавней), содержащий как минимум: дату/время, длительность, размер выходного файла и использованные настройки битрейта/потоков.
- Cap the stored history per project (e.g. most recent 20 builds) to avoid unbounded file growth.
  - **RU:** Ограничить сохраняемую историю на проект (например, 20 последних сборок), чтобы избежать неограниченного роста файла.

## Capabilities

### New Capabilities
- `build-statistics`: Recording, persisting, and displaying a per-project history of build attempts (duration, size, settings used, outcome).
  - **RU:** Запись, сохранение и отображение истории попыток сборки на уровне проекта (длительность, размер, использованные настройки, результат).

### Modified Capabilities
- `project-persistence`: Project file format gains an optional `buildHistory` array.
  - **RU:** Формат файла проекта получает опциональный массив `buildHistory`.

## Impact

- `electron/main/ffmpeg.ts`: on build success/failure/cancellation, emit the data needed for a history entry (duration, output size, bitrate, threads, outcome) alongside existing `build:complete`/`build:error` events.
- `electron/main/project.ts` / IPC: append the new entry to the in-memory project's `buildHistory` (capped) and persist on next save; expose it to the renderer.
- New component (e.g. `src/components/BuildStatistics.tsx`) rendering the history.
- `src/context/AppContext.tsx`: hold `buildHistory` state, updated on build completion events.
- `src/i18n/locales/en.json` / `ru.json`: new strings for the statistics view.

**RU:** `electron/main/ffmpeg.ts` — при успехе/сбое/отмене сборки передавать данные, необходимые для записи истории (длительность, размер выходного файла, битрейт, потоки, результат), вместе с существующими событиями `build:complete`/`build:error`. `electron/main/project.ts` / IPC — добавлять новую запись в `buildHistory` проекта в памяти (с ограничением) и сохранять при следующем сохранении; передавать её в рендерер. Новый компонент (например, `src/components/BuildStatistics.tsx`), отображающий историю. `src/context/AppContext.tsx` — хранить состояние `buildHistory`, обновляемое по событиям завершения сборки. `src/i18n/locales/en.json` / `ru.json` — новые строки для экрана статистики.
