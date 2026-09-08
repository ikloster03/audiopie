import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import type { BrowserWindow } from 'electron';

// `electron` is not available as a real module outside the Electron runtime,
// so we provide a minimal stand-in sufficient for the project/projectFile
// modules under test (they only use `app.getPath('temp')`, plus `dialog`
// types that are never invoked because every call in these tests passes an
// explicit path instead of relying on native save/open dialogs).
vi.mock('electron', () => ({
  app: {
    getPath: () => os.tmpdir(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
  },
  BrowserWindow: class {},
}));

// Avoid depending on a real ffmpeg/ffprobe binary for these unit tests.
vi.mock('../electron/main/ffmpeg', () => ({
  probeDuration: vi.fn(async () => 1000),
}));

const fakeWin = {} as BrowserWindow;

let scratchRoot: string;

const makeScratchFile = async (name: string, contents: string | Buffer): Promise<string> => {
  const filePath = path.join(scratchRoot, name);
  await fs.promises.writeFile(filePath, contents);
  return filePath;
};

const readJsonFromZip = async (zipPath: string, entryPath: string): Promise<any> => {
  const { unzipToDirectory } = await import('../electron/main/projectFile');
  const extractDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-extract-'));
  await unzipToDirectory(zipPath, extractDir);
  const raw = await fs.promises.readFile(path.join(extractDir, entryPath), 'utf-8');
  await fs.promises.rm(extractDir, { recursive: true, force: true });
  return JSON.parse(raw);
};

const extractZip = async (zipPath: string): Promise<string> => {
  const { unzipToDirectory } = await import('../electron/main/projectFile');
  const extractDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-extract-'));
  await unzipToDirectory(zipPath, extractDir);
  return extractDir;
};

describe('projectFile: detectFormat', () => {
  beforeEach(async () => {
    scratchRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-scratch-'));
  });
  afterEach(async () => {
    await fs.promises.rm(scratchRoot, { recursive: true, force: true });
  });

  it('detects a legacy JSON file regardless of its extension', async () => {
    const { detectFormat } = await import('../electron/main/projectFile');
    const legacyPath = await makeScratchFile('legacy.zip', JSON.stringify({ version: 1, tracks: [], chapters: [], metadata: {} }));
    await expect(detectFormat(legacyPath)).resolves.toBe('legacy-json');
  });

  it('detects a ZIP container regardless of its extension', async () => {
    const { detectFormat, zipDirectory } = await import('../electron/main/projectFile');
    const dirToZip = await fs.promises.mkdtemp(path.join(scratchRoot, 'dir-'));
    await fs.promises.writeFile(path.join(dirToZip, 'index.json'), '{}');
    const zipPath = path.join(scratchRoot, 'container.txt');
    await zipDirectory(dirToZip, zipPath);
    await expect(detectFormat(zipPath)).resolves.toBe('container');
  });
});

describe('project: legacy JSON open/save', () => {
  beforeEach(async () => {
    scratchRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-scratch-'));
  });
  afterEach(async () => {
    await fs.promises.rm(scratchRoot, { recursive: true, force: true });
    vi.resetModules();
  });

  it('opens a legacy JSON project without copying files or creating a working directory', async () => {
    const { openProjectAtPath, closeProject } = await import('../electron/main/project');
    const externalTrack = await makeScratchFile('external.mp3', 'not-really-audio');
    const legacyPath = await makeScratchFile(
      'legacy.audiopie',
      JSON.stringify({
        version: 1,
        tracks: [{ path: externalTrack, displayTitle: 'Track 1', durationMs: 5000 }],
        chapters: [{ title: 'Track 1', startMs: 0, endMs: 5000 }],
        metadata: { title: 'My Legacy Book' },
      }),
    );

    const snapshot = await openProjectAtPath(legacyPath);

    expect(snapshot.type).toBe('audiobook');
    expect(snapshot.tracks).toHaveLength(1);
    // Track path is left pointing at its original external location.
    expect(snapshot.tracks[0].path).toBe(externalTrack);
    expect(snapshot.metadata.title).toBe('My Legacy Book');

    await closeProject();
  });

  it('upgrades a legacy project to a container on first save, without re-copying on the second save', async () => {
    const { openProjectAtPath, saveProjectToFile, getSnapshot, closeProject } = await import('../electron/main/project');
    const externalTrack = await makeScratchFile('external2.mp3', 'legacy-audio-bytes');
    const legacyPath = await makeScratchFile(
      'legacy2.audiopie',
      JSON.stringify({
        version: 1,
        tracks: [{ path: externalTrack, displayTitle: 'Chapter A', durationMs: 4000 }],
        chapters: [],
        metadata: { title: 'Legacy Upgrade Book' },
      }),
    );

    await openProjectAtPath(legacyPath);
    const savePath = path.join(scratchRoot, 'upgraded.audiopie');
    await saveProjectToFile(fakeWin, savePath);

    const rootManifest = await readJsonFromZip(savePath, 'index.json');
    expect(rootManifest.version).toBe(2);
    expect(rootManifest.type).toBe('audiobook');
    expect(rootManifest.bookOrder).toHaveLength(1);

    const bookId = rootManifest.bookOrder[0];
    const bookIndex = await readJsonFromZip(savePath, `books/${bookId}/index.json`);
    expect(bookIndex.tracks).toHaveLength(1);
    expect(bookIndex.metadata.title).toBe('Legacy Upgrade Book');

    const afterFirstSave = getSnapshot();
    const pathAfterFirstSave = afterFirstSave.tracks[0].path;
    expect(pathAfterFirstSave).not.toBe(externalTrack);
    expect(fs.existsSync(externalTrack)).toBe(true); // original untouched

    // Second save should not re-copy from the (now-irrelevant) original path.
    await saveProjectToFile(fakeWin, savePath);
    const afterSecondSave = getSnapshot();
    expect(afterSecondSave.tracks[0].path).toBe(pathAfterFirstSave);

    await closeProject();
  });
});

describe('project: creating new projects', () => {
  beforeEach(async () => {
    scratchRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-scratch-'));
  });
  afterEach(async () => {
    await fs.promises.rm(scratchRoot, { recursive: true, force: true });
    vi.resetModules();
  });

  it('creates a minimal audiobook container immediately at the chosen path', async () => {
    const { createNewProjectAtPath, closeProject } = await import('../electron/main/project');
    const savePath = path.join(scratchRoot, 'new-book');
    const snapshot = await createNewProjectAtPath('audiobook', savePath);

    expect(snapshot.type).toBe('audiobook');
    expect(snapshot.bookOrder).toHaveLength(1);
    expect(fs.existsSync(`${savePath}.audiopie`)).toBe(true);

    const rootManifest = await readJsonFromZip(`${savePath}.audiopie`, 'index.json');
    expect(rootManifest.type).toBe('audiobook');
    expect(rootManifest.bookOrder).toHaveLength(1);

    await closeProject();
  });

  it('creates a minimal series container with zero books', async () => {
    const { createNewProjectAtPath, closeProject } = await import('../electron/main/project');
    const savePath = path.join(scratchRoot, 'new-series');
    const snapshot = await createNewProjectAtPath('series', savePath);

    expect(snapshot.type).toBe('series');
    expect(snapshot.bookOrder).toHaveLength(0);
    expect(snapshot.series).not.toBeNull();

    const rootManifest = await readJsonFromZip(`${savePath}.audiopie`, 'index.json');
    expect(rootManifest.type).toBe('series');
    expect(rootManifest.bookOrder).toHaveLength(0);

    await closeProject();
  });
});

describe('project: track add/remove', () => {
  beforeEach(async () => {
    scratchRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-scratch-'));
  });
  afterEach(async () => {
    await fs.promises.rm(scratchRoot, { recursive: true, force: true });
    vi.resetModules();
  });

  it('copies a newly added track into the working directory, leaving the source untouched; removal deletes the copy', async () => {
    const { createNewProjectAtPath, addTracksToActiveBook, removeTracksFromActiveBook, closeProject } = await import(
      '../electron/main/project'
    );
    await createNewProjectAtPath('audiobook', path.join(scratchRoot, 'book-with-tracks'));

    const sourceTrack = await makeScratchFile('source-track.mp3', 'source-bytes');
    const { added, errors } = await addTracksToActiveBook([sourceTrack]);

    expect(errors).toHaveLength(0);
    expect(added).toHaveLength(1);
    expect(added[0].path).not.toBe(sourceTrack);
    expect(fs.existsSync(added[0].path)).toBe(true);
    expect(fs.existsSync(sourceTrack)).toBe(true);
    expect(await fs.promises.readFile(added[0].path, 'utf-8')).toBe('source-bytes');

    const copiedPath = added[0].path;
    await removeTracksFromActiveBook([0]);
    expect(fs.existsSync(copiedPath)).toBe(false);

    await closeProject();
  });
});

describe('project: series round-tripping and book management', () => {
  beforeEach(async () => {
    scratchRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-scratch-'));
  });
  afterEach(async () => {
    await fs.promises.rm(scratchRoot, { recursive: true, force: true });
    vi.resetModules();
  });

  it('preserves bookOrder, book ids, and seriesIndex across a save/reopen round trip', async () => {
    const { createNewProjectAtPath, addBookToSeries, updateBookSeriesIndex, saveProjectToFile, openProjectAtPath, closeProject } =
      await import('../electron/main/project');

    const savePath = path.join(scratchRoot, 'roundtrip-series.audiopie');
    await createNewProjectAtPath('series', savePath);
    const afterBook1 = addBookToSeries();
    const book1Id = afterBook1.bookOrder[0];
    const afterBook2 = addBookToSeries();
    const book2Id = afterBook2.bookOrder[1];

    updateBookSeriesIndex(book1Id, 1);
    updateBookSeriesIndex(book2Id, 2);

    await saveProjectToFile(fakeWin, savePath);

    const reopened = await openProjectAtPath(savePath);
    expect(reopened.bookOrder).toEqual([book1Id, book2Id]);
    const book1 = reopened.books.find((b) => b.id === book1Id);
    const book2 = reopened.books.find((b) => b.id === book2Id);
    expect(book1?.metadata.seriesIndex).toBe(1);
    expect(book2?.metadata.seriesIndex).toBe(2);

    await closeProject();
  });

  it('reordering books does not rename folders, and editing seriesIndex does not change bookOrder', async () => {
    const { createNewProjectAtPath, addBookToSeries, reorderBooks, updateBookSeriesIndex, saveProjectToFile, getSnapshot, closeProject } =
      await import('../electron/main/project');

    const savePath = path.join(scratchRoot, 'reorder-series.audiopie');
    await createNewProjectAtPath('series', savePath);
    const afterBook1 = addBookToSeries();
    const book1Id = afterBook1.bookOrder[0];
    const afterBook2 = addBookToSeries();
    const book2Id = afterBook2.bookOrder[1];

    updateBookSeriesIndex(book1Id, 5);
    const beforeReorder = getSnapshot().bookOrder;
    expect(beforeReorder).toEqual([book1Id, book2Id]);

    reorderBooks([book2Id, book1Id]);
    await saveProjectToFile(fakeWin, savePath);

    const extractDir = await extractZip(savePath);
    expect(fs.existsSync(path.join(extractDir, 'books', book1Id))).toBe(true);
    expect(fs.existsSync(path.join(extractDir, 'books', book2Id))).toBe(true);
    await fs.promises.rm(extractDir, { recursive: true, force: true });

    expect(getSnapshot().bookOrder).toEqual([book2Id, book1Id]);

    await closeProject();
  });

  it('rejects importing a series file as a member book, and rejects a series file as a template', async () => {
    const {
      createNewProjectAtPath,
      addBookToSeries,
      saveProjectToFile,
      importBookFromFile,
      readTemplateMetadata,
      closeProject,
    } = await import('../electron/main/project');

    const seriesPath = path.join(scratchRoot, 'source-series.audiopie');
    await createNewProjectAtPath('series', seriesPath);
    addBookToSeries();
    await saveProjectToFile(fakeWin, seriesPath);
    await closeProject();

    // A second, currently-open series project attempts to import the first as a member.
    await createNewProjectAtPath('series', path.join(scratchRoot, 'target-series.audiopie'));
    await expect(importBookFromFile(seriesPath)).rejects.toThrow();
    await expect(readTemplateMetadata(seriesPath)).rejects.toThrow();

    await closeProject();
  });
});

describe('project: setType danger-zone behavior', () => {
  beforeEach(async () => {
    scratchRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-scratch-'));
  });
  afterEach(async () => {
    await fs.promises.rm(scratchRoot, { recursive: true, force: true });
    vi.resetModules();
  });

  it('audiobook -> series does not touch books', async () => {
    const { createNewProjectAtPath, setProjectType, getSnapshot, closeProject } = await import('../electron/main/project');
    await createNewProjectAtPath('audiobook', path.join(scratchRoot, 'a2s.audiopie'));
    const before = getSnapshot();
    const bookIdBefore = before.bookOrder[0];

    const after = await setProjectType('series');
    expect(after.type).toBe('series');
    expect(after.bookOrder).toEqual([bookIdBefore]);
    expect(after.series).not.toBeNull();

    await closeProject();
  });

  it('series -> audiobook with 3 books keeps only bookOrder[0] on save', async () => {
    const { createNewProjectAtPath, addBookToSeries, setProjectType, saveProjectToFile, closeProject } = await import(
      '../electron/main/project'
    );
    const savePath = path.join(scratchRoot, 's2a-three.audiopie');
    await createNewProjectAtPath('series', savePath);
    const b1 = addBookToSeries().bookOrder[0];
    addBookToSeries();
    addBookToSeries();

    const after = await setProjectType('audiobook');
    expect(after.type).toBe('audiobook');
    expect(after.bookOrder).toEqual([b1]);

    await saveProjectToFile(fakeWin, savePath);
    const extractDir = await extractZip(savePath);
    const remainingBooks = await fs.promises.readdir(path.join(extractDir, 'books'));
    expect(remainingBooks).toEqual([b1]);
    await fs.promises.rm(extractDir, { recursive: true, force: true });

    await closeProject();
  });

  it('series -> audiobook with zero books creates exactly one empty book', async () => {
    const { createNewProjectAtPath, setProjectType, closeProject } = await import('../electron/main/project');
    await createNewProjectAtPath('series', path.join(scratchRoot, 's2a-zero.audiopie'));

    const after = await setProjectType('audiobook');
    expect(after.type).toBe('audiobook');
    expect(after.bookOrder).toHaveLength(1);

    await closeProject();
  });
});
