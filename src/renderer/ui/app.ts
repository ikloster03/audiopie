import { BuildOptions } from '../../main/types';
import { appState } from './state';
import { TrackList } from './components/TrackList';
import { ChapterList } from './components/ChapterList';
import { MetadataForm } from './components/MetadataForm';
import { ProgressModal } from './components/ProgressModal';
import { SettingsDialog } from './components/SettingsDialog';

export const initApp = async () => {
  const trackColumn = document.querySelector('#track-column') as HTMLElement;
  const chapterColumn = document.querySelector('#chapter-column') as HTMLElement;
  const metadataContainer = document.querySelector('#metadata-container') as HTMLElement;
  const progressContainer = document.body;
  const settingsContainer = document.body;

  const trackList = new TrackList(trackColumn);
  const chapterList = new ChapterList(chapterColumn);
  const metadataForm = new MetadataForm(metadataContainer);
  const progressModal = new ProgressModal(progressContainer);
  const settingsDialog = new SettingsDialog(settingsContainer);

  const settings = await window.audioPie.settings.get();
  appState.settings = settings;

  const metadata = await window.audioPie.metadata.get();
  appState.metadata = metadata;

  appState.subscribe(() => {
    trackList.render(appState.tracks);
    chapterList.render(appState.chapters);
    metadataForm.render(appState.metadata);
  });

  setupTabs();
  appState.notify();

  window.audioPie.build.onProgress((progress) => {
    if (progress.phase === 'probe' && progress.message) {
      console.warn(progress.message);
      alert(progress.message);
      return;
    }
    appState.buildModal = { visible: true, progress };
    progressModal.show(progress);
    if (progress.percent === 100) {
      setTimeout(() => progressModal.hide(), 800);
    }
  });

  setupTopBar(settingsDialog, progressModal);
  setupTrackDrop(trackColumn);
};

const setupTabs = () => {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.tab-button'));
  const contents = Array.from(document.querySelectorAll<HTMLDivElement>('.tab-content'));
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      if (!tab) return;
      buttons.forEach((b) => b.classList.toggle('active', b === button));
      contents.forEach((content) => {
        content.classList.toggle('active', content.dataset.tabContent === tab);
      });
    });
  });
};

const setupTrackDrop = (dropZone: HTMLElement) => {
  const highlight = (active: boolean) => {
    dropZone.classList.toggle('drag-active', active);
  };
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    highlight(true);
  });
  dropZone.addEventListener('dragleave', () => highlight(false));
  dropZone.addEventListener('drop', async (event) => {
    event.preventDefault();
    highlight(false);
    const files = Array.from(event.dataTransfer?.files || []).filter((file) => file.name.endsWith('.mp3'));
    const paths = files
      .map((file) => (file as unknown as { path?: string }).path)
      .filter((p): p is string => typeof p === 'string' && p.length > 0);
    if (paths.length) {
      await addTracks(paths);
    }
  });
};

const setupTopBar = (settingsDialog: SettingsDialog, progressModal: ProgressModal) => {
  const addButton = document.querySelector('#add-tracks') as HTMLButtonElement;
  const saveButton = document.querySelector('#save-project') as HTMLButtonElement;
  const openButton = document.querySelector('#open-project') as HTMLButtonElement;
  const buildButton = document.querySelector('#build-project') as HTMLButtonElement;
  const settingsButton = document.querySelector('#open-settings') as HTMLButtonElement;
  const generateChaptersButton = document.querySelector('#generate-chapters') as HTMLButtonElement;

  addButton.addEventListener('click', async () => {
    const files = await window.audioPie.tracks.selectFiles();
    if (files.length) {
      await addTracks(files);
    }
  });

  saveButton.addEventListener('click', async () => {
    await window.audioPie.project.save();
  });

  openButton.addEventListener('click', async () => {
    const data = await window.audioPie.project.open();
    if (data) {
      appState.tracks = data.tracks;
      appState.chapters = data.chapters;
      appState.metadata = data.metadata;
      appState.notify();
    }
  });

  generateChaptersButton.addEventListener('click', async () => {
    const chapters = await window.audioPie.chapters.autoFromTracks();
    appState.chapters = chapters;
    appState.notify();
  });

  buildButton.addEventListener('click', async () => {
    try {
      const settings = appState.settings || (await window.audioPie.settings.get());
      const defaultBitrate = settings.defaultBitrateKbps || 128;
      const defaultDir = settings.defaultOutputDir || undefined;
      const fileName = `${sanitizeFileName(appState.metadata.title || 'audiobook')}.m4b`;
      const outputPath = await window.audioPie.build.selectOutput(defaultDir, fileName);
      if (!outputPath) {
        return;
      }
      const options: BuildOptions = {
        bitrateKbps: defaultBitrate,
        outputPath,
        reencode: true,
      };
      progressModal.show({ phase: 'encode', percent: 0, message: 'Preparing build…' });
      await window.audioPie.build.start(options);
    } catch (error) {
      progressModal.hide();
      alert((error as Error).message);
    }
  });

  settingsButton.addEventListener('click', async () => {
    const settings = await window.audioPie.settings.get();
    appState.settings = settings;
    settingsDialog.open(settings);
  });
};

const addTracks = async (paths: string[]) => {
  const added = await window.audioPie.tracks.addFromPaths(paths);
  if (added.length) {
    appState.tracks = [...appState.tracks, ...added];
    const chapters = await window.audioPie.chapters.autoFromTracks();
    appState.chapters = chapters;
    appState.notify();
  }
};

const sanitizeFileName = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9-_]+/g, '_');
};
