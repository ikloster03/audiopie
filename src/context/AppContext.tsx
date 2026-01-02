import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TrackInfo, Chapter, BookMetadata, AppSettings, BuildProgress, UpdateState } from '../types';
import { useTranslation } from 'react-i18next';

interface AppState {
  tracks: TrackInfo[];
  chapters: Chapter[];
  metadata: BookMetadata;
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
  openProject: () => void;
  newProject: () => void;
  closeProject: () => void;
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

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [metadata, setMetadata] = useState<BookMetadata>({ title: 'Untitled Audiobook' });
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

  // Project management functions
  const openProject = () => {
    setIsProjectOpen(true);
  };

  const newProject = () => {
    setTracks([]);
    setChapters([]);
    setMetadata({ title: t('common.untitledAudiobook') });
    setIsProjectOpen(true);
  };

  const closeProject = () => {
    setTracks([]);
    setChapters([]);
    setMetadata({ title: t('common.untitledAudiobook') });
    setIsProjectOpen(false);
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
    openProject,
    newProject,
    closeProject,
    toggleTheme,
    changeLanguage
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

