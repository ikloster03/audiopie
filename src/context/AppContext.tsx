import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  TrackInfo,
  Chapter,
  BookMetadata,
  AppSettings,
  BuildProgress,
  UpdateState,
  ProjectType,
  SeriesMetadata,
} from '../types';
import { useTranslation } from 'react-i18next';
import { appendChaptersForTracks, applyTimeRangesFromTracks } from '../lib/chapters';

type ProjectSnapshot = {
  type: ProjectType;
  series: SeriesMetadata | null;
  bookOrder: string[];
  activeBookId: string | undefined;
  books: Array<{ id: string; metadata: BookMetadata }>;
  tracks: TrackInfo[];
  chapters: Chapter[];
  metadata: BookMetadata;
};

interface AppState {
  tracks: TrackInfo[];
  chapters: Chapter[];
  metadata: BookMetadata;
  projectType: ProjectType;
  seriesMetadata: SeriesMetadata | null;
  bookOrder: string[];
  books: Array<{ id: string; metadata: BookMetadata }>;
  activeBookId: string | undefined;
  settings: AppSettings | null;
  buildProgress: BuildProgress | null;
  isBuildModalVisible: boolean;
  isProjectOpen: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
  updateState: UpdateState | null;
}

interface AppContextType extends AppState {
  setTracks: (tracks: TrackInfo[]) => void;
  setChapters: (chapters: Chapter[]) => void;
  setMetadata: (metadata: BookMetadata) => void;
  setSettings: (settings: AppSettings | null) => void;
  setBuildProgress: (progress: BuildProgress | null) => void;
  setIsBuildModalVisible: (visible: boolean) => void;
  setUpdateState: (state: UpdateState | null) => void;
  applySnapshot: (snapshot: ProjectSnapshot) => void;
  openProjectFromDialog: () => Promise<boolean>;
  createNewProject: (type: ProjectType) => Promise<boolean>;
  startFromTemplate: () => Promise<void>;
  closeProject: () => Promise<void>;
  addTracksFromPaths: (paths: string[]) => Promise<void>;
  removeTrackAt: (index: number) => Promise<void>;
  switchActiveBook: (bookId: string) => Promise<void>;
  addBookToSeries: () => Promise<void>;
  removeBookFromSeries: (bookId: string) => Promise<void>;
  reorderBooks: (order: string[]) => Promise<void>;
  updateBookSeriesIndex: (bookId: string, seriesIndex: number | undefined) => Promise<void>;
  updateSeriesMetadata: (partial: Partial<SeriesMetadata>) => Promise<void>;
  importBookFromFile: () => Promise<void>;
  extractBook: (bookId: string) => Promise<boolean>;
  setProjectType: (newType: ProjectType) => Promise<void>;
  toggleTheme: () => void;
  changeLanguage: (lang: 'en' | 'ru') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const emptySnapshotState = (untitled: string) => ({
  tracks: [] as TrackInfo[],
  chapters: [] as Chapter[],
  metadata: { title: untitled } as BookMetadata,
  projectType: 'audiobook' as ProjectType,
  seriesMetadata: null as SeriesMetadata | null,
  bookOrder: [] as string[],
  books: [] as Array<{ id: string; metadata: BookMetadata }>,
  activeBookId: undefined as string | undefined,
});

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [metadata, setMetadata] = useState<BookMetadata>({ title: 'Untitled Audiobook' });
  const [projectType, setProjectTypeState] = useState<ProjectType>('audiobook');
  const [seriesMetadata, setSeriesMetadata] = useState<SeriesMetadata | null>(null);
  const [bookOrder, setBookOrder] = useState<string[]>([]);
  const [books, setBooks] = useState<Array<{ id: string; metadata: BookMetadata }>>([]);
  const [activeBookId, setActiveBookId] = useState<string | undefined>(undefined);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [buildProgress, setBuildProgress] = useState<BuildProgress | null>(null);
  const [isBuildModalVisible, setIsBuildModalVisible] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'en' | 'ru'>('en');
  const [updateState, setUpdateState] = useState<UpdateState | null>(null);

  // Load initial settings and theme
  useEffect(() => {
    const loadInitialData = async () => {
      const loadedSettings = await window.audioPie.settings.get();
      setSettings(loadedSettings);
      const initialTheme = loadedSettings.theme || 'light';
      setTheme(initialTheme);
      // Apply theme to document
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Set initial language
      const initialLanguage = loadedSettings.language || (localStorage.getItem('audiopie-language') as 'en' | 'ru') || 'en';
      setLanguage(initialLanguage);
      i18n.changeLanguage(initialLanguage);
    };

    loadInitialData();
  }, [i18n]);

  // Sync theme when settings change
  useEffect(() => {
    if (settings && settings.theme && settings.theme !== theme) {
      setTheme(settings.theme);
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings, theme]);

  const applySnapshot = (snapshot: ProjectSnapshot) => {
    setTracks(snapshot.tracks);
    setChapters(snapshot.chapters);
    setMetadata(snapshot.metadata);
    setProjectTypeState(snapshot.type);
    setSeriesMetadata(snapshot.series);
    setBookOrder(snapshot.bookOrder);
    setBooks(snapshot.books);
    setActiveBookId(snapshot.activeBookId);
  };

  const passesAudiobookCompletenessCheck = (snapshot: ProjectSnapshot): boolean => {
    if (snapshot.type === 'series') {
      // The audiobook-specific "zero tracks" completeness check does not apply to a series.
      return true;
    }
    return (
      snapshot.tracks.length > 0 &&
      snapshot.chapters.length > 0 &&
      snapshot.metadata.title !== 'Untitled Audiobook'
    );
  };

  const openProjectFromDialog = async (): Promise<boolean> => {
    const snapshot = await window.audioPie.project.open();
    if (!snapshot || !passesAudiobookCompletenessCheck(snapshot)) {
      return false;
    }
    applySnapshot(snapshot);
    setIsProjectOpen(true);
    return true;
  };

  const createNewProject = async (type: ProjectType): Promise<boolean> => {
    const snapshot = await window.audioPie.project.new(type);
    if (!snapshot) {
      return false;
    }
    applySnapshot(snapshot);
    setIsProjectOpen(true);
    return true;
  };

  const startFromTemplate = async (): Promise<void> => {
    const updated = await window.audioPie.project.newFromTemplate();
    if (updated) {
      setMetadata(updated);
    }
  };

  const closeProject = async (): Promise<void> => {
    await window.audioPie.project.close();
    const empty = emptySnapshotState(t('common.untitledAudiobook'));
    setTracks(empty.tracks);
    setChapters(empty.chapters);
    setMetadata(empty.metadata);
    setProjectTypeState(empty.projectType);
    setSeriesMetadata(empty.seriesMetadata);
    setBookOrder(empty.bookOrder);
    setBooks(empty.books);
    setActiveBookId(empty.activeBookId);
    setIsProjectOpen(false);
  };

  const addTracksFromPaths = async (paths: string[]) => {
    if (paths.length === 0) {
      return;
    }
    const added = await window.audioPie.tracks.addFromPaths(paths);
    if (!added.length) {
      return;
    }
    const nextTracks = [...tracks, ...added];
    const nextChapters = appendChaptersForTracks(chapters, added);
    setTracks(nextTracks);
    setChapters(nextChapters);
    await window.audioPie.chapters.update(nextChapters);
  };

  const removeTrackAt = async (index: number) => {
    await window.audioPie.tracks.remove([index]);
    const nextTracks = tracks.filter((_, i) => i !== index);
    const remainingChapters = chapters.filter((_, i) => i !== index);
    const nextChapters = applyTimeRangesFromTracks(remainingChapters, nextTracks);
    setTracks(nextTracks);
    setChapters(nextChapters);
    await window.audioPie.chapters.update(nextChapters);
  };

  const switchActiveBook = async (bookId: string) => {
    const snapshot = await window.audioPie.project.setActiveBook(bookId);
    applySnapshot(snapshot);
  };

  const addBookToSeries = async () => {
    const snapshot = await window.audioPie.project.addBookToSeries();
    applySnapshot(snapshot);
  };

  const removeBookFromSeries = async (bookId: string) => {
    const snapshot = await window.audioPie.project.removeBookFromSeries(bookId);
    applySnapshot(snapshot);
  };

  const reorderBooks = async (order: string[]) => {
    const snapshot = await window.audioPie.project.reorderBooks(order);
    applySnapshot(snapshot);
  };

  const updateBookSeriesIndex = async (bookId: string, seriesIndex: number | undefined) => {
    const snapshot = await window.audioPie.project.updateBookSeriesIndex(bookId, seriesIndex);
    applySnapshot(snapshot);
  };

  const updateSeriesMetadata = async (partial: Partial<SeriesMetadata>) => {
    const snapshot = await window.audioPie.project.updateSeriesMetadata(partial);
    applySnapshot(snapshot);
  };

  const importBookFromFile = async () => {
    const snapshot = await window.audioPie.project.importBookFromFile();
    if (snapshot) {
      applySnapshot(snapshot);
    }
  };

  const extractBook = async (bookId: string): Promise<boolean> => {
    return window.audioPie.project.extractBook(bookId);
  };

  const setProjectType = async (newType: ProjectType) => {
    const snapshot = await window.audioPie.project.setType(newType);
    applySnapshot(snapshot);
  };

  // Theme management
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save to settings
    const updatedSettings = await window.audioPie.settings.set({
      ...settings,
      theme: newTheme,
    });
    setSettings(updatedSettings);
  };

  // Language management
  const changeLanguage = async (lang: 'en' | 'ru') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('audiopie-language', lang);

    // Save to settings
    const updatedSettings = await window.audioPie.settings.set({
      ...settings,
      language: lang,
    });
    setSettings(updatedSettings);
  };

  // Subscribe to build progress
  useEffect(() => {
    const unsubscribe = window.audioPie.build.onProgress((progress) => {
      if (progress.phase === 'probe' && progress.message) {
        console.warn(progress.message);
        alert(progress.message);
        return;
      }
      setBuildProgress(progress);
      setIsBuildModalVisible(true);
      if (progress.percent === 100) {
        setTimeout(() => setIsBuildModalVisible(false), 800);
      }
    });

    return unsubscribe;
  }, []);

  // Subscribe to update state changes
  useEffect(() => {
    const unsubscribe = window.audioPie.update.onStateChanged((state) => {
      setUpdateState(state);
    });

    return unsubscribe;
  }, []);

  const value: AppContextType = {
    tracks,
    chapters,
    metadata,
    projectType,
    seriesMetadata,
    bookOrder,
    books,
    activeBookId,
    settings,
    buildProgress,
    isBuildModalVisible,
    isProjectOpen,
    theme,
    language,
    updateState,
    setTracks,
    setChapters,
    setMetadata,
    setSettings,
    setBuildProgress,
    setIsBuildModalVisible,
    setUpdateState,
    applySnapshot,
    openProjectFromDialog,
    createNewProject,
    startFromTemplate,
    closeProject,
    addTracksFromPaths,
    removeTrackAt,
    switchActiveBook,
    addBookToSeries,
    removeBookFromSeries,
    reorderBooks,
    updateBookSeriesIndex,
    updateSeriesMetadata,
    importBookFromFile,
    extractBook,
    setProjectType,
    toggleTheme,
    changeLanguage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
