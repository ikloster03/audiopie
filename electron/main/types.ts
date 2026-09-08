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

/** Shape of the root `index.json` inside a container-format `.audiopie` ZIP. */
export type RootManifest = {
  version: 2;
  type: ProjectType;
  series: SeriesMetadata | null;
  bookOrder: string[];
};

/** Shape of a legacy (pre-container) plain-JSON `.audiopie` file. */
export type LegacyProjectFile = {
  version: 1;
  tracks: TrackInfo[];
  chapters: Chapter[];
  metadata: BookMetadata;
};

/** A track as persisted inside a book's own `index.json` (path is a bare file name, not absolute). */
export type SerializedTrackInfo = {
  file: string;
  displayTitle: string;
  durationMs: number;
};

export type SerializedBookMetadata = Omit<BookMetadata, 'coverPath'>;

/** Shape of `books/<bookId>/index.json`. */
export type BookIndexFile = {
  metadata: SerializedBookMetadata;
  tracks: SerializedTrackInfo[];
};

/** A book as held in-memory while a project is open (paths are absolute, inside the working directory). */
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

export type UpdateInfo = {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
  files: Array<{
    url: string;
    size: number;
  }>;
};

export type UpdateProgress = {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
};

export type UpdateStatus =
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export type UpdateState = {
  status: UpdateStatus;
  info?: UpdateInfo;
  progress?: UpdateProgress;
  error?: string;
};
