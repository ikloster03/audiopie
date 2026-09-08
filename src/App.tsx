import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChapterList } from './components/ChapterList';
import { MetadataForm } from './components/MetadataForm';
import { ProgressModal } from './components/ProgressModal';
import { SettingsPage } from './components/SettingsPage';
import { ProjectManager } from './components/ProjectManager';
import { SeriesPage } from './components/SeriesPage';
import { UpdateNotificationDialog } from './components/UpdateNotificationDialog';
import { UpdateProgressModal } from './components/UpdateProgressModal';
import { WorkspaceSidebar, type WorkspaceSection } from './components/WorkspaceSidebar';
import { useAppContext } from './context/AppContext';
import type { BuildOptions } from './types';
import { Button } from './components/ui/button';
import { Tooltip } from './components/ui/tooltip';
import { Card, CardContent } from './components/ui/card';
import { Save, Hammer } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const {
    tracks,
    metadata,
    settings,
    projectType,
    isProjectOpen,
    closeProject,
    addTracksFromPaths,
  } = useAppContext();
  const [cannotBuildAlertVisible, setCannotBuildAlertVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('chapters');
  const [fabsHidden, setFabsHidden] = useState(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    if (isProjectOpen) {
      setActiveSection(projectType === 'series' ? 'series' : 'chapters');
    }
  }, [isProjectOpen, projectType]);

  const isEditorSection = activeSection === 'chapters' || activeSection === 'metadata';
  const isBuildableSection = isEditorSection || activeSection === 'series';

  useEffect(() => {
    setFabsHidden(false);
    lastScrollTop.current = 0;
  }, [activeSection]);

  useEffect(() => {
    if (!isEditorSection) {
      return;
    }

    const onScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (!target.closest('.app__main')) {
        return;
      }

      const current = target.scrollTop;
      const delta = current - lastScrollTop.current;
      if (Math.abs(delta) < 6) {
        return;
      }

      lastScrollTop.current = current;
      if (current <= 8 || delta < 0) {
        setFabsHidden(false);
      } else {
        setFabsHidden(true);
      }
    };

    document.addEventListener('scroll', onScroll, true);
    return () => document.removeEventListener('scroll', onScroll, true);
  }, [isEditorSection]);

  const handleSaveProject = async () => {
    // Every project already has a save path assigned at creation time, so
    // Save always writes to that known path without any guard/dialog.
    await window.audioPie.project.save();
  };

  const handleBuild = async () => {
    const untitledCheck = t('common.untitledAudiobook');
    if (tracks.length === 0 || metadata.title === 'Untitled Audiobook' || metadata.title === untitledCheck) {
      setCannotBuildAlertVisible(true);
      setTimeout(() => setCannotBuildAlertVisible(false), 5000);
      return;
    }

    try {
      const currentSettings = settings || (await window.audioPie.settings.get());
      const defaultBitrate = currentSettings.defaultBitrateKbps || 128;
      const fileName = `${sanitizeFileName(metadata.title || 'audiobook')}.m4b`;
      const outputPath = await window.audioPie.build.selectOutput(fileName);
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

  const handleTrackDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) => file.name.endsWith('.mp3'));
    const paths = files
      .map((file) => (file as File & { path?: string }).path)
      .filter((p): p is string => typeof p === 'string' && p.length > 0);
    if (paths.length) {
      await addTracksFromPaths(paths);
    }
  };

  const sanitizeFileName = (value: string): string => {
    return value.replace(/[^a-zA-Z0-9-_]+/g, '_');
  };

  if (!isProjectOpen) {
    return <ProjectManager />;
  }

  return (
    <div className="app">
      {cannotBuildAlertVisible && (
        <div className="app__alert">
          <Alert variant="destructive" className="app__alert--destructive">
            <AlertTitle className="app__alert-title">{t('alerts.cannotBuildTitle')}</AlertTitle>
            <AlertDescription className="app__alert-description">
              {t('alerts.cannotBuildDesc')}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="app__workspace">
        <WorkspaceSidebar
          activeSection={activeSection}
          onSelect={setActiveSection}
          onCloseProject={closeProject}
          mode={settings?.sidebarMode || 'expanded'}
          projectType={projectType}
        />
        <main
          className="app__main"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleTrackDrop}
        >
          <Card className="app__section-panel">
            <CardContent className="app__section-content">
              {activeSection === 'chapters' && <ChapterList />}
              {activeSection === 'metadata' && <MetadataForm onBackToSeries={() => setActiveSection('series')} />}
              {activeSection === 'series' && <SeriesPage onEditBook={() => setActiveSection('chapters')} />}
              {activeSection === 'settings' && (
                <SettingsPage
                  onNavigateToSeries={() => setActiveSection('series')}
                  onNavigateToBookEditor={() => setActiveSection('chapters')}
                />
              )}
            </CardContent>
          </Card>
          {isBuildableSection && (
            <div className={`app__fab-stack${fabsHidden ? ' app__fab-stack--hidden' : ''}`}>
              <Tooltip label={t('header.save')} side="left">
                <Button
                  onClick={handleSaveProject}
                  variant="outline"
                  size="icon-md"
                  aria-label={t('header.save')}
                >
                  <Save className="size-5" />
                </Button>
              </Tooltip>
              {isEditorSection && (
                <Tooltip label={t('header.build')} side="left">
                  <Button
                    onClick={handleBuild}
                    size="icon-xl"
                    aria-label={t('header.build')}
                  >
                    <Hammer className="size-8" />
                  </Button>
                </Tooltip>
              )}
            </div>
          )}
        </main>
      </div>

      <ProgressModal />
      <UpdateNotificationDialog />
      <UpdateProgressModal />
    </div>
  );
};
