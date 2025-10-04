import { AppSettings, BookMetadata, BuildProgress, Chapter, TrackInfo } from '../../main/types';

type Listener = () => void;

type ModalState = {
  visible: boolean;
  progress?: BuildProgress;
  logMessage?: string;
};

export class AppState {
  tracks: TrackInfo[] = [];
  chapters: Chapter[] = [];
  metadata: BookMetadata = { title: 'Untitled Audiobook' };
  settings: AppSettings | null = null;
  buildModal: ModalState = { visible: false };

  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const appState = new AppState();
