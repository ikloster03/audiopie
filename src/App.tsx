import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrackList } from './components/TrackList';
import { ChapterList } from './components/ChapterList';
import { MetadataForm } from './components/MetadataForm';
import { ProgressModal } from './components/ProgressModal';
import { SettingsDialog } from './components/SettingsDialog';
import { ProjectManager } from './components/ProjectManager';
import { useAppContext } from './context/AppContext';
import type { BuildOptions } from './types';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Music, Plus, Save, Hammer, Settings, X, Moon, Sun, Languages } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { tracks, setTracks, setChapters, metadata, settings, isProjectOpen, closeProject, theme, toggleTheme, language, changeLanguage } = useAppContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [emptyProjectAlertType, setEmptyProjectAlertType] = useState<'save' | 'build' | null>(null);

  const handleAddTracks = async () => {
    const files = await window.audioPie.tracks.selectFiles();
    if (files.length) {
      await addTracks(files);
    }
  };

  const handleSaveProject = async () => {
    const untitledCheck = t('common.untitledAudiobook');
    if (tracks.length === 0 || metadata.title === 'Untitled Audiobook' || metadata.title === untitledCheck) {
      setEmptyProjectAlertType('save');
      setTimeout(() => setEmptyProjectAlertType(null), 5000); // Hide after 5 seconds
      return;
    }

    await window.audioPie.project.save();
  };

  const handleBuild = async () => {
    const untitledCheck = t('common.untitledAudiobook');
    if (tracks.length === 0 || metadata.title === 'Untitled Audiobook' || metadata.title === untitledCheck) {
      setEmptyProjectAlertType('build');
      setTimeout(() => setEmptyProjectAlertType(null), 5000); // Hide after 5 seconds
      return;
    }

    try {
      const currentSettings = settings || (await window.audioPie.settings.get());
      const defaultBitrate = currentSettings.defaultBitrateKbps || 128;
      const defaultDir = currentSettings.defaultOutputDir || undefined;
      const fileName = `${sanitizeFileName(metadata.title || 'audiobook')}.m4b`;
      const outputPath = await window.audioPie.build.selectOutput(defaultDir, fileName);
      if (!outputPath) {
        return;
      }
      const options: BuildOptions = {
        bitrateKbps: defaultBitrate,
        outputPath,
        reencode: true
      };
      await window.audioPie.build.start(options);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleOpenSettings = async () => {
    setIsSettingsOpen(true);
  };

  const handleTrackDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) => file.name.endsWith('.mp3'));
    const paths = files
      .map((file) => (file as any).path)
      .filter((p): p is string => typeof p === 'string' && p.length > 0);
    if (paths.length) {
      await addTracks(paths);
    }
  };

  const addTracks = async (paths: string[]) => {
    const added = await window.audioPie.tracks.addFromPaths(paths);
    if (added.length) {
      setTracks([...tracks, ...added]);
      const chapters = await window.audioPie.chapters.autoFromTracks();
      setChapters(chapters);
    }
  };

  const sanitizeFileName = (value: string): string => {
    return value.replace(/[^a-zA-Z0-9-_]+/g, '_');
  };

  // If no project is open, show the project manager
  if (!isProjectOpen) {
    return <ProjectManager />;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__header-container">
          <div className="app__header-content">
            <div className="app__logo">
              <Music className="app__logo-icon" />
              <h1 className="app__logo-title">
                {t('app.title')}
              </h1>
            </div>
            <div className="app__actions">
              <Button onClick={handleAddTracks} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
                {t('header.addTracks')}
              </Button>
              <Button onClick={handleSaveProject} variant="outline" size="sm">
                <Save className="h-4 w-4" />
                {t('header.save')}
              </Button>
              <Button onClick={handleBuild} variant="outline" size="sm">
                <Hammer className="h-4 w-4" />
                {t('header.build')}
              </Button>
              <Button onClick={closeProject} variant="outline" size="sm">
                <X className="h-4 w-4" />
                {t('header.close')}
              </Button>
              <Button onClick={toggleTheme} variant="ghost" size="sm" title={theme === 'light' ? t('header.switchToDarkMode') : t('header.switchToLightMode')}>
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button onClick={() => changeLanguage(language === 'en' ? 'ru' : 'en')} variant="ghost" size="sm" title={language === 'en' ? 'Переключить на русский' : 'Switch to English'}>
                <Languages className="h-4 w-4" />
                <span className="ml-1 text-xs font-medium">{language.toUpperCase()}</span>
              </Button>
              <Button onClick={handleOpenSettings} variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Empty Project Alert - Toast Notification */}
      {emptyProjectAlertType === 'save' && (
        <div className="app__alert">
          <Alert variant="destructive" className="app__alert--destructive">
            <AlertTitle className="app__alert-title">{t('alerts.cannotSaveTitle')}</AlertTitle>
            <AlertDescription className="app__alert-description">
              {t('alerts.cannotSaveDesc')}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {emptyProjectAlertType === 'build' && (
        <div className="app__alert">
          <Alert variant="destructive" className="app__alert--destructive">
            <AlertTitle className="app__alert-title">{t('alerts.cannotBuildTitle')}</AlertTitle>
            <AlertDescription className="app__alert-description">
              {t('alerts.cannotBuildDesc')}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="app__main">
        <div className="app__content">
          {/* Tracks Panel */}
          <Card
            className="app__tracks-panel"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleTrackDrop}
          >
            <CardContent className="app__tracks-content">
              <div className="app__tracks-header">
                <Music className="app__tracks-icon" />
                <h2 className="app__tracks-title">{t('tracks.title')}</h2>
                <span className="app__tracks-count">
                  {t('tracks.count', { count: tracks.length })}
                </span>
              </div>
              {tracks.length === 0 ? (
                <div className="app__tracks-empty">
                  <div className="app__tracks-empty-content">
                    <Music className="app__tracks-empty-icon" />
                    <p className="app__tracks-empty-text">
                      {t('tracks.noTracks')}
                    </p>
                    <p className="app__tracks-empty-hint">
                      {t('tracks.dragDrop')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="app__tracks-list">
                  <TrackList />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Panel */}
          <Card className="app__details-panel">
            <CardContent className="app__details-content">
              <Tabs defaultValue="metadata" className="app__tabs">
                <TabsList className="app__tabs-list">
                  <TabsTrigger value="metadata">{t('metadata.tab')}</TabsTrigger>
                  <TabsTrigger value="chapters">{t('chaptersTab.tab')}</TabsTrigger>
                </TabsList>
                <TabsContent value="metadata" className="app__tabs-content">
                  <MetadataForm />
                </TabsContent>
                <TabsContent value="chapters" className="app__tabs-content--chapters">
                  <ChapterList />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <ProgressModal />
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
