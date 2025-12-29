# CLAUDE.md - AI Assistant Guide for AudioPie

**Version:** 0.6.4
**Last Updated:** 2025-12-29
**Project:** AudioPie - M4B Audiobook Creator

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Architecture & Patterns](#architecture--patterns)
4. [Development Workflows](#development-workflows)
5. [Testing Strategy](#testing-strategy)
6. [Build & Deployment](#build--deployment)
7. [Code Conventions](#code-conventions)
8. [Important Files](#important-files)
9. [Common Tasks](#common-tasks)
10. [Git Workflow](#git-workflow)
11. [CI/CD Integration](#cicd-integration)
12. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**AudioPie** is an Electron-based desktop application that converts MP3 audio tracks into M4B audiobook format with chapter editing and metadata management capabilities.

### Key Features
- Convert MP3 tracks to M4B audiobook format
- Drag-and-drop track reordering
- Chapter editing with auto-generation from tracks
- Complete metadata editing (title, author, narrator, cover art, etc.)
- FFmpeg integration for audio processing
- Project save/load functionality (.audiopie files)
- Multilingual support (English & Russian)
- Cross-platform (macOS, Windows, Linux)
- Light/dark theme support

### Tech Stack
- **React 18.3.1** - UI framework
- **TypeScript 5.5.3** - Type safety (strict mode)
- **Electron 31.2.0** - Desktop application framework
- **Vite 5.3.3** - Build tool and dev server
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **SCSS + BEM** - Component styling methodology
- **FFmpeg** - Audio encoding/processing (bundled via ffmpeg-static)
- **i18next 25.6.1** - Internationalization
- **Vitest 4.0.16** - Unit testing framework

---

## Codebase Structure

```
audiopie/
├── electron/                    # Electron main & preload processes
│   ├── main/                    # Main process modules
│   │   ├── main.ts              # Entry point, window creation
│   │   ├── ipc.ts               # IPC handler registration (25+ handlers)
│   │   ├── ffmpeg.ts            # FFmpeg/FFprobe integration
│   │   ├── project.ts           # Project file I/O (.audiopie format)
│   │   ├── settings.ts          # Settings persistence (electron-store)
│   │   ├── fileDialog.ts        # File selection dialogs
│   │   ├── menu.ts              # Application menu
│   │   ├── i18n.ts              # Main process translations
│   │   └── types.ts             # IPC type definitions
│   └── preload/
│       └── preload.ts           # Context bridge (window.audioPie API)
│
├── src/                         # React renderer process
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # React entry point
│   ├── types.ts                 # Shared TypeScript types
│   ├── components/              # React components
│   │   ├── ProjectManager.tsx   # Project open/create screen
│   │   ├── TrackList.tsx        # Track management (drag-drop)
│   │   ├── ChapterList.tsx      # Chapter editing
│   │   ├── MetadataForm.tsx     # Metadata editing with cover
│   │   ├── ProgressModal.tsx    # Build progress dialog
│   │   ├── SettingsDialog.tsx   # Application settings
│   │   └── ui/                  # Shadcn/ui components (11 files)
│   ├── context/
│   │   └── AppContext.tsx       # Global state management
│   ├── i18n/
│   │   ├── config.ts            # i18next configuration
│   │   └── locales/             # Translation files (en.json, ru.json)
│   ├── lib/
│   │   └── utils.ts             # Utility functions (cn for classNames)
│   └── styles/                  # SCSS styles
│       ├── globals.scss         # Global styles, theme variables
│       └── components/          # BEM component styles (18 .scss files)
│
├── tests/                       # Test suites
│   └── ffmpeg.smoke.test.ts     # FFmpeg E2E smoke tests
│
├── docs/                        # Docusaurus documentation site
│   ├── docs/                    # English documentation
│   └── i18n/ru/                 # Russian documentation
│
├── public/                      # Static assets
├── assets/                      # Icons and resources
├── build/                       # Build configuration
├── .claude/                     # Claude Code configuration
│   ├── agents/                  # Agent definitions
│   └── docs/                    # Architecture documentation
│
└── .github/workflows/           # GitHub Actions CI/CD
    ├── build.yml                # Application build pipeline
    ├── claude.yml               # Claude Code integration
    └── claude-code-review.yml   # Automated code review
```

---

## Architecture & Patterns

### Electron Architecture

AudioPie follows the standard Electron multi-process architecture:

```
┌─────────────────────────────────────────────────────┐
│           REACT RENDERER PROCESS                    │
│   App.tsx → Components → AppContext                 │
│            ↓ window.audioPie API                    │
└─────────────────────────────────────────────────────┘
                      ↕ IPC
┌─────────────────────────────────────────────────────┐
│           PRELOAD BRIDGE (Context Bridge)           │
│   Secure IPC channel with type-safe API             │
└─────────────────────────────────────────────────────┘
                      ↕ IPC
┌─────────────────────────────────────────────────────┐
│           ELECTRON MAIN PROCESS                     │
│   main.ts → ipc.ts → ffmpeg / settings / project    │
└─────────────────────────────────────────────────────┘
```

### IPC API Structure

The preload script exposes `window.audioPie` with these namespaces:

```typescript
window.audioPie = {
  tracks: {
    selectFiles()           // Open file dialog for MP3 selection
    addFromPaths(paths)     // Add tracks from paths
    reorder(tracks)         // Update track order
    remove(index)           // Remove track by index
    updateTitle(index, title) // Update track display title
  },
  metadata: {
    get()                   // Get current metadata
    set(metadata)           // Update metadata
    selectCover()           // Open cover image dialog
    getCoverDataUrl()       // Get cover as data URL
    setCoverFromPath(path)  // Set cover from file path
  },
  chapters: {
    autoFromTracks()        // Generate chapters from tracks
    update(chapters)        // Update chapter list
  },
  build: {
    start(options)          // Start M4B build process
    cancel()                // Cancel ongoing build
    selectOutput()          // Select output file path
    onProgress(callback)    // Subscribe to progress updates
  },
  project: {
    save(path?)             // Save project to .audiopie file
    open()                  // Open project file
    new()                   // Create new project
  },
  settings: {
    get()                   // Get app settings
    set(settings)           // Update settings
    getMaxCpuCores()        // Get system CPU count
  }
}
```

### State Management

**React Context Pattern** (`src/context/AppContext.tsx`):
- Global state container for: tracks, chapters, metadata, settings, buildProgress, theme, language
- State methods: setTracks, setChapters, setMetadata, openProject, newProject, closeProject
- Automatically subscribes to build progress IPC events
- Theme and language persistence via electron-store and localStorage

### Core Type Definitions

**Location:** `src/types.ts` and `electron/main/types.ts`

```typescript
// Track information
type TrackInfo = {
  path: string;           // Absolute file path
  displayTitle: string;   // User-editable title
  durationMs: number;     // Track duration in milliseconds
}

// Chapter definition
type Chapter = {
  title: string;          // Chapter title
  startMs: number;        // Start time in milliseconds
  endMs: number;          // End time in milliseconds
}

// Book metadata
type BookMetadata = {
  title: string;
  author?: string;
  narrator?: string;
  series?: string;
  seriesIndex?: number;
  year?: string;
  genre?: string;
  publisher?: string;
  description?: string;
  coverPath?: string;     // Path to cover image
}

// Build configuration
type BuildOptions = {
  bitrateKbps: number;    // Audio bitrate
  outputPath: string;     // Output file path
  tempDir?: string;       // Temporary directory
  reencode?: boolean;     // Force re-encoding
}

// Application settings
type AppSettings = {
  ffmpegPath?: string;    // Custom FFmpeg binary path
  ffprobePath?: string;   // Custom FFprobe binary path
  defaultBitrateKbps: number;
  defaultOutputDir?: string;
  ffmpegThreads?: number;
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
}

// Build progress
type BuildProgress = {
  phase: 'probe' | 'encode' | 'chapters' | 'finalize';
  percent?: number;
  message?: string;
  currentStep?: number;
  totalSteps?: number;
}
```

### FFmpeg Integration

**Location:** `electron/main/ffmpeg.ts`

**Binary Resolution Strategy:**
1. User-configured path (from settings)
2. System PATH lookup
3. Bundled ffmpeg-static (with asar.unpacked support)

**Key Functions:**
- `probeAudioDuration(filePath)` - Get track duration via FFprobe
- `buildM4BAudiobook(tracks, chapters, metadata, options, onProgress)` - Main build function
- `cancelBuild()` - Terminate ongoing FFmpeg process

**Build Process:**
1. **Probe Phase:** Detect duration and codec info for all tracks
2. **Encode Phase:** Concatenate tracks and encode to M4A
3. **Chapters Phase:** Add chapter markers to M4B file
4. **Finalize Phase:** Copy to output location, cleanup temp files

**Progress Reporting:**
- IPC events: `build:progress` (progress updates), `build:complete` (success), `build:error` (failure)
- Real-time progress tracking via FFmpeg output parsing

---

## Development Workflows

### Initial Setup

```bash
# Install dependencies
npm install

# Setup git hooks (Husky)
npm run prepare
```

### Development

```bash
# Start dev server with hot reload (port 3000)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Testing

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Building

```bash
# Full production build (TypeScript → Vite → Electron Builder)
npm run build
# Output: release/{version}/ directory

# Preview production build
npm run preview
```

### Versioning

```bash
# Bump patch version (0.6.4 → 0.6.5)
npm run version:patch

# Bump minor version (0.6.4 → 0.7.0)
npm run version:minor

# Bump major version (0.6.4 → 1.0.0)
npm run version:major
```

All version commands use `changelogen` to update CHANGELOG.md and push changes.

---

## Testing Strategy

### Test Framework: Vitest

**Configuration:** `vitest.config.ts`
- Environment: Node
- Timeout: 30 seconds
- Hook timeout: 30 seconds
- Pattern: `tests/**/*.test.ts`

### Current Test Suite

**FFmpeg Smoke Tests** (`tests/ffmpeg.smoke.test.ts`):
- FFmpeg binary availability verification
- Audio duration probing with FFprobe
- MP3 to M4A encoding
- M4B creation with chapter markers
- Re-encoding with bitrate conversion
- Generates temporary test audio files
- Uses `fluent-ffmpeg` library

### Testing Best Practices
- Create test audio files dynamically (don't commit large binary files)
- Use 30-second timeout for FFmpeg operations
- Clean up temporary files after tests
- Test both happy path and error cases
- Verify FFmpeg binary detection logic

---

## Build & Deployment

### Build Configuration

**Vite** (`vite.config.mts`):
- Path alias: `@/` → `./src/`
- Plugins: React, Tailwind, Electron
- SCSS preprocessor with modern-compiler API
- Dev server: http://localhost:3000
- Output:
  - Renderer: `dist/`
  - Main process: `dist-electron/main/`
  - Preload: `dist-electron/preload/`

**Electron Builder** (`electron-builder.json`):
- App ID: `com.example.audiopie`
- Platforms:
  - **macOS:** DMG format
  - **Windows:** NSIS installer (x64)
  - **Linux:** AppImage
- FFmpeg handling: Packs `ffmpeg-static` into `asar.unpacked` directory
- Assets: Icon at `assets/icon.png`
- Includes i18n locale files

### Build Process

```bash
npm run build
```

This executes:
1. **TypeScript compilation:** `tsc`
2. **Vite build:** Bundles renderer, main, and preload
3. **Electron Builder:** Packages for target platforms

### Release Artifacts

Built applications appear in `release/{version}/`:
- macOS: `.dmg` file
- Windows: `.exe` installer
- Linux: `.AppImage` file

---

## Code Conventions

### TypeScript

- **Strict mode enabled** (`tsconfig.json`)
- **Target:** ES2020
- **Module:** ESNext
- **JSX:** react-jsx
- **No implicit any:** Enforced
- **Strict null checks:** Enabled

### Component Structure

**Functional components with hooks:**

```tsx
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export const ComponentName = () => {
  const { state, setState } = useAppContext();
  const [localState, setLocalState] = useState<Type>(initialValue);

  return (
    <div className="component-name">
      {/* Content */}
    </div>
  );
};
```

### BEM CSS Methodology

**All styles follow BEM (Block Element Modifier) pattern with SCSS.**

**Structure:**
- **Block:** `.component-name` (kebab-case)
- **Element:** `.component-name__element-name`
- **Modifier:** `.component-name__element--modifier`

**Example** (`src/styles/components/track-list.scss`):

```scss
.track-list {
  @apply space-y-2;
}

.track-item {
  @apply flex items-center gap-3 p-3 bg-card rounded-lg border;

  &__drag-handle {
    @apply cursor-move text-muted-foreground;
  }

  &__input {
    @apply flex-1 bg-transparent border-none focus:outline-none;
  }

  &__duration {
    @apply text-sm text-muted-foreground;
  }

  &__remove-button {
    @apply text-destructive hover:text-destructive/80;
  }
}
```

### Tailwind Integration

- Use `@apply` directive in SCSS for Tailwind utilities
- Global theme variables in `src/styles/globals.scss`
- OKLCH color space for theme colors
- Dark mode via `.dark` class on root element
- One SCSS file per component in `src/styles/components/`

### Theme Variables

**Location:** `src/styles/globals.scss`

```scss
:root {
  --color-background: oklch(98% 0 0);
  --color-foreground: oklch(20% 0 0);
  --color-primary: oklch(50% 0.2 250);
  --color-secondary: oklch(96% 0.01 250);
  --color-accent: oklch(96% 0.01 250);
  --color-destructive: oklch(55% 0.22 25);
  --color-border: oklch(90% 0.01 250);
  --color-input: oklch(90% 0.01 250);
  --radius-lg: 0.5rem;
  --radius-md: 0.375rem;
  --radius-sm: 0.25rem;
}

.dark {
  --color-background: oklch(15% 0 0);
  --color-foreground: oklch(98% 0 0);
  /* ... dark mode values */
}
```

### Naming Conventions

- **Files:** kebab-case (`track-list.tsx`, `metadata-form.scss`)
- **Components:** PascalCase (`TrackList`, `MetadataForm`)
- **Functions/Variables:** camelCase (`getDuration`, `trackInfo`)
- **Types/Interfaces:** PascalCase (`TrackInfo`, `BuildOptions`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_BITRATE`, `MAX_THREADS`)
- **CSS Classes:** BEM with kebab-case (`track-list__item--active`)

### Import Order

1. React imports
2. Third-party libraries
3. Local components
4. Context/hooks
5. Utils/lib
6. Types
7. Styles

```tsx
import { useState, useEffect } from 'react';
import { SortableJS } from 'sortablejs';

import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import type { TrackInfo } from '@/types';

import '@/styles/components/track-list.scss';
```

---

## Important Files

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata, dependencies, scripts |
| `vite.config.mts` | Vite build configuration |
| `vitest.config.ts` | Test runner configuration |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `components.json` | Shadcn/ui component settings |
| `electron-builder.json` | Electron packaging configuration |
| `.commitlintrc.json` | Commit message linting rules |
| `postcss.config.mjs` | PostCSS configuration |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview (English) |
| `README_RU.md` | Project overview (Russian) |
| `CHANGELOG.md` | Version history |
| `BEM_IMPLEMENTATION.md` | BEM methodology documentation |
| `UI_CHANGES.md` | UI change tracking |
| `.claude/docs/architecture.md` | Architecture overview (Russian) |
| `docs/docs/` | User documentation (Docusaurus) |

### Key Source Files

| File | Purpose | Lines of Code |
|------|---------|---------------|
| `electron/main/main.ts` | Electron main process entry | ~150 |
| `electron/main/ipc.ts` | IPC handler registration | ~200 |
| `electron/main/ffmpeg.ts` | FFmpeg integration | ~400 |
| `electron/preload/preload.ts` | Context bridge API | ~150 |
| `src/App.tsx` | Main application UI | ~300 |
| `src/context/AppContext.tsx` | Global state management | ~200 |
| `src/components/TrackList.tsx` | Track management | ~150 |
| `src/components/ChapterList.tsx` | Chapter editing | ~120 |
| `src/components/MetadataForm.tsx` | Metadata form | ~200 |

**Note:** Lines of Code (LOC) counts are approximate and may become outdated as the project evolves. These estimates were last verified on 2025-12-29.

---

## Common Tasks

### Adding a New Component

1. **Create component file:** `src/components/NewComponent.tsx`

```tsx
import { useAppContext } from '@/context/AppContext';
import '@/styles/components/new-component.scss';

export const NewComponent = () => {
  const { state } = useAppContext();

  return (
    <div className="new-component">
      <div className="new-component__header">Header</div>
      <div className="new-component__content">Content</div>
    </div>
  );
};
```

2. **Create styles:** `src/styles/components/new-component.scss`

```scss
.new-component {
  @apply p-4 bg-card rounded-lg;

  &__header {
    @apply text-lg font-semibold mb-2;
  }

  &__content {
    @apply text-foreground;
  }
}
```

3. **Import styles in globals:** Add to `src/styles/globals.scss`

```scss
@import './components/new-component.scss';
```

4. **Add to parent component**

### Adding a New IPC Handler

1. **Define types:** `electron/main/types.ts`

```typescript
export interface AudioPieAPI {
  newFeature: {
    doSomething: (arg: string) => Promise<ResultType>;
  }
}
```

2. **Implement handler:** `electron/main/ipc.ts`

```typescript
ipcMain.handle('newFeature:doSomething', async (event, arg: string) => {
  // Implementation
  return result;
});
```

3. **Expose in preload:** `electron/preload/preload.ts`

```typescript
const audioPieAPI: AudioPieAPI = {
  newFeature: {
    doSomething: (arg: string) => ipcRenderer.invoke('newFeature:doSomething', arg),
  }
};
```

4. **Use in renderer:** Update `src/vite-env.d.ts` types and use `window.audioPie.newFeature.doSomething()`

### Adding a Translation

1. **Add key to English:** `src/i18n/locales/en.json`

```json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description here"
  }
}
```

2. **Add key to Russian:** `src/i18n/locales/ru.json`

```json
{
  "newFeature": {
    "title": "Новая функция",
    "description": "Описание здесь"
  }
}
```

3. **Use in component:**

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
return <h1>{t('newFeature.title')}</h1>;
```

### Adding a Test

1. **Create test file:** `tests/feature.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

2. **Run tests:**

```bash
npm test
```

---

## Git Workflow

### Commit Message Convention

**Standard:** Conventional Commits (enforced by commitlint)

**Allowed types** (`.commitlintrc.json`):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `build:` - Build system changes
- `ci:` - CI/CD changes
- `chore:` - Other changes (maintenance)
- `revert:` - Revert a previous commit

**Format:**

```
type(scope): subject

body (optional)

footer (optional)
```

**Examples:**

```bash
git commit -m "feat(tracks): add drag-and-drop reordering"
git commit -m "fix(ffmpeg): resolve asar.unpacked path issue"
git commit -m "docs: update README with new features"
git commit -m "refactor(ui): migrate to BEM methodology"
```

### Git Hooks

**Husky hooks** (`.husky/`):
- **commit-msg:** Validates commit message format (commitlint)
- **pre-push:** Runs before push operations

### Branch Strategy

When working on features or fixes:
1. Create feature branch: `feature/description` or `fix/description`
2. Use Claude Code branches: `claude/claude-md-*` for AI-assisted work
3. Create PR to main branch
4. Ensure CI passes
5. Squash and merge

### Pull Request Process

1. **Create branch** following naming convention
2. **Make changes** with proper commit messages
3. **Run tests:** `npm test`
4. **Run linter:** `npm run lint`
5. **Type check:** `npm run typecheck`
6. **Push branch**
7. **Create PR** with description of changes
8. **Wait for CI** to pass
9. **Tag @claude** in PR comments for AI code review (optional)

---

## CI/CD Integration

### GitHub Actions Workflows

**Build Pipeline** (`.github/workflows/build.yml`):
- Triggers: Push to main, pull requests
- Runs: Install, lint, type check, test, build
- Platforms: Ubuntu (can extend to macOS/Windows)

**Claude Code Integration** (`.github/workflows/claude.yml`):
- Triggers: Issue comments, PR comments, PR reviews with `@claude` mention
- Permissions: Contents (read), PRs (read), Issues (read), Actions (read)
- Uses: `anthropics/claude-code-action@v1`
- Token: Stored in `CLAUDE_CODE_OAUTH_TOKEN` secret

**Claude Code Review** (`.github/workflows/claude-code-review.yml`):
- Automated code review workflow
- Triggers on pull requests

### Using Claude in GitHub

**To invoke Claude Code in issues/PRs:**
1. Comment with `@claude` mention
2. Example: `@claude please review this code for performance issues`
3. Claude will analyze and respond automatically

---

## AI Assistant Guidelines

### When Working with This Codebase

#### DO:
- ✅ **Read files before editing** - Always use Read tool first
- ✅ **Follow BEM methodology** - Use block__element--modifier pattern
- ✅ **Use TypeScript strict mode** - No implicit any, strict null checks
- ✅ **Apply Tailwind via @apply** - Keep styles in SCSS files, not inline
- ✅ **Maintain IPC type safety** - Update types in both main and preload
- ✅ **Add translations for both languages** - Update en.json and ru.json
- ✅ **Test FFmpeg changes** - Run smoke tests after modifying ffmpeg.ts
- ✅ **Follow commit conventions** - Use conventional commits format
- ✅ **Preserve existing patterns** - Match coding style of surrounding code
- ✅ **Update documentation** - Keep README and CHANGELOG current

#### DON'T:
- ❌ **Don't use inline Tailwind classes** - Use BEM classes with @apply
- ❌ **Don't skip type definitions** - All IPC APIs must be typed
- ❌ **Don't forget translations** - Never add English-only text
- ❌ **Don't modify asar packed paths** - Use asar.unpacked for FFmpeg binaries
- ❌ **Don't break IPC contract** - Maintain backward compatibility
- ❌ **Don't commit without testing** - Always run tests before committing
- ❌ **Don't ignore ESLint warnings** - Fix all linting issues
- ❌ **Don't create new files unnecessarily** - Prefer editing existing files

### Common Pitfalls

**1. FFmpeg Path Resolution**
- FFmpeg binaries must be in asar.unpacked for Electron
- Check `electron/main/ffmpeg.ts` for proper path resolution
- Test both development and production builds

**2. IPC Communication**
- All IPC handlers must return Promises
- Types must match between main and preload
- Use `ipcRenderer.invoke()` (not `send()`) for request/response

**3. State Management**
- Don't bypass AppContext for global state
- Use IPC for persistence, not localStorage in renderer
- Settings and theme changes must sync to electron-store

**4. Styling**
- All component styles must be in separate SCSS files
- Use BEM naming consistently
- Import styles in component file
- Don't forget to add @import in globals.scss

**5. i18n**
- Use `t()` function from react-i18next
- Never hardcode UI text
- Keep translation keys organized by feature
- Both languages must have same keys

### Code Review Checklist

Before submitting changes, verify:
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] All tests pass (`npm test`)
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] BEM methodology followed in styles
- [ ] Both English and Russian translations added
- [ ] IPC types updated if API changed
- [ ] Commit messages follow conventional commits
- [ ] No console.log statements left in code
- [ ] FFmpeg paths work in both dev and production
- [ ] Theme switching works (light/dark)
- [ ] Documentation updated if needed

### Architecture Decisions

**When adding features, consider:**

1. **Does this belong in main or renderer?**
   - File I/O, FFmpeg operations → Main process
   - UI, state management → Renderer process

2. **How should state be managed?**
   - Global state → AppContext
   - Component state → useState
   - Persistent settings → electron-store (via IPC)

3. **How should this be styled?**
   - Create new BEM block for new components
   - Extend existing blocks for variations
   - Use Tailwind utilities via @apply

4. **Does this need internationalization?**
   - All user-facing text → Yes
   - Debug/dev messages → No

5. **What tests are needed?**
   - FFmpeg operations → E2E smoke tests
   - Complex logic → Unit tests
   - UI components → Manual testing (for now)

### Debugging Tips

**Renderer Process:**
- Open DevTools: Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (macOS)
- Use React DevTools extension
- Check console for errors

**Main Process:**
- Run with: `npm run dev`
- Check terminal output for main process logs
- Use console.log in electron/main files

**IPC Communication:**
- Log in both preload and main process
- Check handler names match exactly
- Verify types align between processes

**FFmpeg Issues:**
- Check binary paths in Settings dialog
- Verify FFmpeg/FFprobe are executable
- Check temp directory permissions
- Review FFmpeg output in terminal

---

## Project Philosophy

AudioPie is designed to be:
- **Simple:** Focused feature set, intuitive UI
- **Reliable:** Type-safe, tested, error-handled
- **Maintainable:** Clear structure, documented patterns
- **Accessible:** Multilingual, keyboard-friendly
- **Cross-platform:** Works on macOS, Windows, Linux

When contributing, prioritize:
1. User experience and usability
2. Code clarity over cleverness
3. Consistency with existing patterns
4. Comprehensive error handling
5. Performance (especially for large audiobooks)

---

## Additional Resources

- **Documentation Site:** https://audiopie.ikloster.tech
- **Repository:** https://github.com/ikloster03/audiopie
- **Issue Tracker:** GitHub Issues
- **FFmpeg Documentation:** https://ffmpeg.org/documentation.html
- **Electron Documentation:** https://www.electronjs.org/docs
- **React Documentation:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **BEM Methodology:** https://getbem.com

---

## Document Change History

### Version 0.6.4 - 2025-12-29
- **Initial Release:** Comprehensive CLAUDE.md guide created
- Fixed file path references (src/App.tsx location)
- Corrected component counts (11 Shadcn/ui components, 18 SCSS files)
- Added LOC count disclaimer with verification date
- Added this change history section

### Future Updates
This document should be updated when:
- Major architectural changes occur
- New dependencies or technologies are added
- File structure significantly changes
- New development workflows are established
- Testing strategies evolve

---

**For questions or clarifications about this codebase, consult this guide first. If unclear, examine existing code patterns before making changes.**

**Last updated:** 2025-12-29
**Maintained by:** Claude Code
**Update frequency:** Keep synchronized with major architectural changes
