import React, { useState } from 'react';
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
import { Music, Plus, Save, Hammer, Settings, X, Moon, Sun } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';

export const App: React.FC = () => {
  const { tracks, setTracks, setChapters, setMetadata, metadata, settings, isProjectOpen, openProject, closeProject, theme, toggleTheme } = useAppContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [emptyProjectAlertType, setEmptyProjectAlertType] = useState<'save' | 'build' | null>(null);

  const handleAddTracks = async () => {
    const files = await window.audioPie.tracks.selectFiles();
    if (files.length) {
      await addTracks(files);
    }
  };

  const handleSaveProject = async () => {
    if (tracks.length === 0 || metadata.title === 'Untitled Audiobook') {
      setEmptyProjectAlertType('save');
      setTimeout(() => setEmptyProjectAlertType(null), 5000); // Hide after 5 seconds
      return;
    }

    await window.audioPie.project.save();
  };

  const handleBuild = async () => {
    if (tracks.length === 0 || metadata.title === 'Untitled Audiobook') {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                AudioPie
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddTracks} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
                Add Tracks
              </Button>
              <Button onClick={handleSaveProject} variant="outline" size="sm">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleBuild} variant="outline" size="sm">
                <Hammer className="h-4 w-4" />
                Build
              </Button>
              <Button onClick={closeProject} variant="outline" size="sm">
                <X className="h-4 w-4" />
                Close
              </Button>
              <Button onClick={toggleTheme} variant="ghost" size="sm" title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
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
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-right-5 duration-300">
          <Alert variant="destructive" className="max-w-md shadow-lg border-2 border-red-600 bg-red-50 dark:bg-red-950">
            <AlertTitle className="text-red-600 dark:text-red-400">You cannot save the project</AlertTitle>
            <AlertDescription className="text-red-600 dark:text-red-400">
              The project must contain at least one track and have a title other than "Untitled Audiobook".
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {emptyProjectAlertType === 'build' && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-right-5 duration-300">
          <Alert variant="destructive" className="max-w-md shadow-lg border-2 border-red-600 bg-red-50 dark:bg-red-950">
            <AlertTitle className="text-red-600 dark:text-red-400">You cannot build the project</AlertTitle>
            <AlertDescription className="text-red-600 dark:text-red-400">
              The project must contain at least one track and have a title other than "Untitled Audiobook".
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracks Panel */}
          <Card
            className="lg:col-span-1 flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleTrackDrop}
          >
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Music className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Tracks</h2>
                <span className="ml-auto text-sm text-muted-foreground">
                  {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
                </span>
              </div>
              {tracks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/20 p-8">
                  <div className="text-center">
                    <Music className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium mb-1">
                      No tracks yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop MP3 files or click "Add Tracks"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden">
                  <TrackList />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Panel */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <Tabs defaultValue="metadata" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="metadata">📝 Metadata</TabsTrigger>
                  <TabsTrigger value="chapters">📖 Chapters</TabsTrigger>
                </TabsList>
                <TabsContent value="metadata" className="flex-1 overflow-auto scrollbar-thin">
                  <MetadataForm />
                </TabsContent>
                <TabsContent value="chapters" className="flex-1 flex flex-col overflow-hidden">
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
