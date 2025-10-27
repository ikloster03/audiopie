import React, { useState } from 'react';
import { TrackList } from './components/TrackList';
import { ChapterList } from './components/ChapterList';
import { MetadataForm } from './components/MetadataForm';
import { ProgressModal } from './components/ProgressModal';
import { SettingsDialog } from './components/SettingsDialog';
import { useAppContext } from './context/AppContext';
import type { BuildOptions } from './types';

export const App: React.FC = () => {
  const { tracks, setTracks, setChapters, setMetadata, metadata, settings } = useAppContext();
  const [activeTab, setActiveTab] = useState<'metadata' | 'chapters'>('metadata');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleAddTracks = async () => {
    const files = await window.audioPie.tracks.selectFiles();
    if (files.length) {
      await addTracks(files);
    }
  };

  const handleSaveProject = async () => {
    await window.audioPie.project.save();
  };

  const handleOpenProject = async () => {
    const data = await window.audioPie.project.open();
    if (data) {
      setTracks(data.tracks);
      setChapters(data.chapters);
      setMetadata(data.metadata);
    }
  };

  const handleGenerateChapters = async () => {
    const chapters = await window.audioPie.chapters.autoFromTracks();
    setChapters(chapters);
  };

  const handleBuild = async () => {
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

  return (
    <>
      <header className="toolbar">
        <div className="brand">🎵 AudioPie</div>
        <div className="toolbar-actions">
          <button onClick={handleAddTracks}>➕ Add Tracks</button>
          <button onClick={handleSaveProject}>💾 Save Project</button>
          <button onClick={handleOpenProject}>📂 Open Project</button>
          <button onClick={handleBuild} className="primary">
            🔨 Build
          </button>
          <button onClick={handleOpenSettings}>⚙️ Settings</button>
        </div>
      </header>

      <main className="content">
        <section
          id="track-column"
          className="panel track-panel"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleTrackDrop}
        >
          <h2>📚 Tracks</h2>
          {tracks.length === 0 ? (
            <p className="hint">
              🎵 Drag and drop MP3 files here or click "Add Tracks"
            </p>
          ) : (
            <TrackList />
          )}
        </section>

        <section className="panel detail-panel">
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'metadata' ? 'active' : ''}`}
              onClick={() => setActiveTab('metadata')}
            >
              📝 Metadata
            </button>
            <button
              className={`tab-button ${activeTab === 'chapters' ? 'active' : ''}`}
              onClick={() => setActiveTab('chapters')}
            >
              📖 Chapters
            </button>
          </div>

          <div className={`tab-content ${activeTab === 'metadata' ? 'active' : ''}`}>
            <MetadataForm />
          </div>

          <div className={`tab-content ${activeTab === 'chapters' ? 'active' : ''}`}>
            <div className="chapters-toolbar">
              <button onClick={handleGenerateChapters}>✨ Generate from tracks</button>
            </div>
            <ChapterList />
          </div>
        </section>
      </main>

      <ProgressModal />
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

