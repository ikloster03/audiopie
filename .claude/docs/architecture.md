# Архитектура проекта AudioPie

## Обзор
**AudioPie** (v0.6.4) — Electron-приложение для конвертации MP3 треков в M4B аудиокниги с редактированием глав и метаданных.

---

## src/ — React рендерер

```
src/
├── App.tsx                 # Главный компонент
├── main.tsx                # Точка входа
├── types.ts                # Типы: TrackInfo, Chapter, BookMetadata, BuildOptions, AppSettings
├── components/
│   ├── TrackList.tsx       # Список треков (drag-reorder)
│   ├── ChapterList.tsx     # Редактор глав
│   ├── MetadataForm.tsx    # Форма метаданных (обложка, автор, название)
│   ├── ProgressModal.tsx   # Модалка прогресса сборки
│   ├── ProjectManager.tsx  # Экран открытия/создания проекта
│   ├── SettingsDialog.tsx  # Настройки приложения
│   └── ui/                 # shadcn/ui компоненты (Radix UI)
├── context/
│   └── AppContext.tsx      # Глобальный стейт (React Context)
├── i18n/
│   ├── config.ts           # Конфиг i18next
│   └── locales/            # en.json, ru.json
├── lib/utils.ts            # Утилиты (cn для classNames)
└── styles/                 # SCSS + BEM
```

---

## electron/ — Main process

```
electron/
├── main/
│   ├── main.ts         # Точка входа Electron (BrowserWindow 1280x800)
│   ├── ipc.ts          # 25+ IPC хендлеров
│   ├── ffmpeg.ts       # FFmpeg/FFprobe интеграция, сборка аудиокниги
│   ├── settings.ts     # Персистенция через electron-store
│   ├── project.ts      # .audiopie файлы (JSON)
│   ├── menu.ts         # Меню приложения
│   ├── fileDialog.ts   # Диалоги выбора файлов
│   └── i18n.ts         # Переводы main process
└── preload/
    └── preload.ts      # Context Bridge → window.audioPie API
```

### IPC API (window.audioPie)

- `tracks`: selectFiles, addFromPaths, reorder, remove, updateTitle
- `metadata`: get, set, selectCover, getCoverDataUrl
- `chapters`: autoFromTracks, update
- `build`: start, cancel, selectOutput, onProgress
- `project`: save, open, new
- `settings`: get, set, getMaxCpuCores

---

## vite.config.mts

- **Alias:** `@` → `src/`
- **SCSS:** modern-compiler API
- **Plugins:** react(), tailwindcss(), electron()
- **Output:**
  - Renderer → `dist/`
  - Main → `dist-electron/main/`
  - Preload → `dist-electron/preload/`
- **Dev server:** port 3000

---

## Dependencies

### Production (15)

| Пакет | Назначение |
|-------|------------|
| react, react-dom | UI фреймворк |
| @radix-ui/* | Доступные UI примитивы |
| electron-store | Хранение настроек |
| ffmpeg-static | FFmpeg бинарник |
| fluent-ffmpeg | Node.js обёртка FFmpeg |
| i18next, react-i18next | Интернационализация |
| lucide-react | Иконки |
| sortablejs | Drag-and-drop |

### DevDependencies (20)

electron, electron-builder, vite, typescript, tailwindcss, sass, husky, commitlint...

---

## NPM Scripts

| Скрипт | Команда | Описание |
|--------|---------|----------|
| `dev` | `vite` | Запуск dev-сервера с hot reload |
| `build` | `tsc && vite build && electron-builder` | Полная сборка + упаковка |
| `typecheck` | `tsc --noEmit` | Проверка типов |
| `lint` | `eslint ...` | Линтинг TS/TSX |
| `preview` | `vite preview` | Превью production билда |
| `prepare` | `husky` | Установка git hooks |
| `sort` | `npx sort-package-json` | Сортировка package.json |
| `version:patch` | `changelogen --patch --push` | Bump patch версии |
| `version:minor` | `changelogen --minor --push` | Bump minor версии |
| `version:major` | `changelogen --major --push` | Bump major версии |

---

## Стек технологий

| Технология | Версия | Роль |
|------------|--------|------|
| React | 18.3.1 | UI |
| TypeScript | 5.5.3 | Типизация |
| Electron | 31.2.0 | Desktop |
| Vite | 5.3.3 | Сборка |
| Tailwind CSS | 4.x | Стили |
| SCSS + BEM | — | Компонентные стили |
| FFmpeg | static | Кодирование аудио |
| i18next | 25.6.1 | i18n (en/ru) |

---

## Архитектура данных

```
┌─────────────────────────────────────────────────────────┐
│             REACT RENDERER PROCESS                      │
├─────────────────────────────────────────────────────────┤
│  App.tsx → Components → AppContext → window.audioPie    │
└─────────────────────────────────────────────────────────┘
                         │
            ┌────────────▼────────────┐
            │  IPC PRELOAD BRIDGE     │
            │  (Context Bridge)       │
            └────────────┬────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│             ELECTRON MAIN PROCESS                       │
├─────────────────────────────────────────────────────────┤
│  main.ts → ipc.ts → ffmpeg.ts / settings.ts / project.ts│
└─────────────────────────────────────────────────────────┘
```

## Типы данных (src/types.ts)

```typescript
TrackInfo: { path, displayTitle, durationMs }
Chapter: { title, startMs, endMs }
BookMetadata: { title, author, narrator, series, seriesIndex, year, genre, publisher, description, coverPath }
BuildOptions: { bitrateKbps, outputPath, tempDir?, reencode? }
AppSettings: { ffmpegPath?, ffprobePath?, defaultBitrateKbps, defaultOutputDir?, ffmpegThreads?, theme, language }
BuildProgress: { phase, percent?, message?, currentStep?, totalSteps? }
```
