export type TrackInfo = {
  path: string;
  displayTitle: string;
  durationMs: number;
};

export type Chapter = {
  title: string;
  startMs: number;
  endMs: number;
};

export type ChapterReorderResult = {
  tracks: TrackInfo[];
  chapters: Chapter[];
};

export type BookMetadata = {
  title: string;
  author?: string;
  narrator?: string;
  series?: string;
  seriesIndex?: number;
  year?: number;
  genre?: string;
  publisher?: string;
  description?: string;
  /** Absolute path (within the project's working directory) to this book's cover image, if any. */
  coverPath?: string;
  /** File name of the cover image inside `books/<bookId>/`, as persisted in that book's own index.json. */
  coverFile?: string;
};

// --- Container format (v2) ---

export type ProjectType = 'audiobook' | 'series';

export type SeriesMetadata = {
  title: string;
  author?: string;
  narrator?: string;
  description?: string;
};

/** A book as held in-memory while a project is open. */
export type Book = {
  id: string;
  metadata: BookMetadata;
  tracks: TrackInfo[];
};

export type BuildOptions = {
  bitrateKbps: number;
  outputPath: string;
  tempDir?: string;
  reencode?: boolean;
};

export type AppSettings = {
  ffmpegPath?: string;
  ffprobePath?: string;
  defaultBitrateKbps: number;
  ffmpegThreads?: number;
  theme?: 'light' | 'dark';
  language?: 'en' | 'ru';
  sidebarMode?: 'minimal' | 'expanded';
  autoCheckForUpdates?: boolean;
  lastUpdateCheck?: number;
};

export type BuildProgress = {
  phase: 'probe' | 'encode' | 'chapters' | 'finalize';
  percent?: number;
  message?: string;
  currentStep?: number;
  totalSteps?: number;
};

export type {
  UpdateInfo,
  UpdateProgress,
  UpdateStatus,
  UpdateState,
} from '../electron/main/types';

