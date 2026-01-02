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
  coverPath?: string;
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
  defaultOutputDir?: string;
  ffmpegThreads?: number;
  theme?: 'light' | 'dark';
  language?: 'en' | 'ru';
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
