import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TrackInfo, Chapter, BookMetadata, AppSettings, BuildProgress } from '../types';

interface AppState {
  tracks: TrackInfo[];
  chapters: Chapter[];
  metadata: BookMetadata;
  settings: AppSettings | null;
  buildProgress: BuildProgress | null;
  isBuildModalVisible: boolean;
  isProjectOpen: boolean;
}

interface AppContextType extends AppState {
  setTracks: (tracks: TrackInfo[]) => void;
  setChapters: (chapters: Chapter[]) => void;
  setMetadata: (metadata: BookMetadata) => void;
  setSettings: (settings: AppSettings | null) => void;
  setBuildProgress: (progress: BuildProgress | null) => void;
  setIsBuildModalVisible: (visible: boolean) => void;
  openProject: () => void;
  newProject: () => void;
  closeProject: () => void;
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

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [metadata, setMetadata] = useState<BookMetadata>({ title: 'Untitled Audiobook' });
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [buildProgress, setBuildProgress] = useState<BuildProgress | null>(null);
  const [isBuildModalVisible, setIsBuildModalVisible] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  // Load initial settings
  useEffect(() => {
    const loadInitialData = async () => {
      const loadedSettings = await window.audioPie.settings.get();
      setSettings(loadedSettings);
    };

    loadInitialData();
  }, []);

  // Project management functions
  const openProject = () => {
    setIsProjectOpen(true);
  };

  const newProject = () => {
    setTracks([]);
    setChapters([]);
    setMetadata({ title: 'Untitled Audiobook' });
    setIsProjectOpen(true);
  };

  const closeProject = () => {
    setTracks([]);
    setChapters([]);
    setMetadata({ title: 'Untitled Audiobook' });
    setIsProjectOpen(false);
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

  const value: AppContextType = {
    tracks,
    chapters,
    metadata,
    settings,
    buildProgress,
    isBuildModalVisible,
    isProjectOpen,
    setTracks,
    setChapters,
    setMetadata,
    setSettings,
    setBuildProgress,
    setIsBuildModalVisible,
    openProject,
    newProject,
    closeProject
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

