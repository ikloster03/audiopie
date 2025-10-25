/// <reference types="vite/client" />

declare global {
  interface Window {
    audioPie: {
      tracks: {
        selectFiles: () => Promise<string[]>;
        addFromPaths: (paths: string[]) => Promise<import('../main/types').TrackInfo[]>;
        remove: (indices: number[]) => Promise<void>;
        reorder: (newOrder: number[]) => Promise<void>;
        updateTitle: (index: number, title: string) => Promise<void>;
      };
      chapters: {
        autoFromTracks: () => Promise<import('../main/types').Chapter[]>;
        update: (chapters: import('../main/types').Chapter[]) => Promise<void>;
      };
      metadata: {
        get: () => Promise<import('../main/types').BookMetadata>;
        set: (metadata: Partial<import('../main/types').BookMetadata>) => Promise<void>;
        selectCover: () => Promise<string | null>;
      };
      settings: {
        get: () => Promise<import('../main/types').AppSettings>;
        set: (settings: Partial<import('../main/types').AppSettings>) => Promise<import('../main/types').AppSettings>;
      };
      project: {
        save: () => Promise<void>;
        open: () => Promise<{
          tracks: import('../main/types').TrackInfo[];
          chapters: import('../main/types').Chapter[];
          metadata: import('../main/types').BookMetadata;
        } | null>;
      };
      build: {
        selectOutput: (defaultDir: string | undefined, defaultFileName: string) => Promise<string | null>;
        start: (options: import('../main/types').BuildOptions) => Promise<void>;
        cancel: () => Promise<void>;
        onProgress: (callback: (progress: import('../main/types').BuildProgress) => void) => () => void;
      };
    };
  }
}

export {};

