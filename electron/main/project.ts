import fs from 'fs';
import path from 'path';
import { dialog, BrowserWindow } from 'electron';
import {
  Book,
  BookMetadata,
  Chapter,
  LegacyProjectFile,
  ProjectType,
  RootManifest,
  SeriesMetadata,
  TrackInfo,
} from './types';
import {
  bookDirOf,
  booksDirOf,
  cleanupWorkingDir,
  computeChaptersFromTracks,
  createWorkingDir,
  detectFormat,
  generateBookId,
  readBookIndex,
  rootIndexPathOf,
  unzipToDirectory,
  writeBookIndex,
  zipDirectory,
} from './projectFile';
import { probeDuration } from './ffmpeg';

type ProjectState = {
  type: ProjectType;
  series: SeriesMetadata | null;
  bookOrder: string[];
  books: Record<string, Book>;
};

const defaultBook = (): Book => ({
  id: generateBookId(),
  metadata: { title: 'Untitled Audiobook' },
  tracks: [],
});

const defaultState = (): ProjectState => {
  const book = defaultBook();
  return {
    type: 'audiobook',
    series: null,
    bookOrder: [book.id],
    books: { [book.id]: book },
  };
};

let state: ProjectState = defaultState();
let activeBookId: string | undefined = state.bookOrder[0];
let workingDir: string | undefined;
let projectPath: string | undefined;
/** True once a legacy JSON project has been opened but not yet saved (upgraded) this session. */
let isLegacyPending = false;

export type ProjectSnapshot = {
  type: ProjectType;
  series: SeriesMetadata | null;
  bookOrder: string[];
  activeBookId: string | undefined;
  books: Array<{ id: string; metadata: BookMetadata }>;
  // Active-book convenience fields, kept for backward compatibility with the
  // single-book editor UI (Chapters / Metadata views).
  tracks: TrackInfo[];
  chapters: Chapter[];
  metadata: BookMetadata;
};

const getActiveBook = (): Book => {
  if (!activeBookId || !state.books[activeBookId]) {
    throw new Error('No active book.');
  }
  return state.books[activeBookId];
};

export const getSnapshot = (): ProjectSnapshot => {
  const active = activeBookId ? state.books[activeBookId] : undefined;
  return {
    type: state.type,
    series: state.series,
    bookOrder: [...state.bookOrder],
    activeBookId,
    books: state.bookOrder
      .map((id) => state.books[id])
      .filter((book): book is Book => Boolean(book))
      .map((book) => ({ id: book.id, metadata: book.metadata })),
    tracks: active ? active.tracks : [],
    chapters: active ? computeChaptersFromTracks(active.tracks) : [],
    metadata: active ? active.metadata : { title: 'Untitled Audiobook' },
  };
};

export const getProjectPath = (): string | undefined => projectPath;

export const setProjectPath = (filePath: string | undefined) => {
  projectPath = filePath;
};

export const getActiveBookId = (): string | undefined => activeBookId;

export const setActiveBookId = (bookId: string): ProjectSnapshot => {
  if (!state.books[bookId]) {
    throw new Error(`Unknown book id: ${bookId}`);
  }
  activeBookId = bookId;
  return getSnapshot();
};

// --- Working directory lifecycle -------------------------------------------------

const ensureWorkingDir = async (): Promise<string> => {
  if (!workingDir) {
    workingDir = await createWorkingDir();
  }
  return workingDir;
};

const cleanupCurrentWorkingDir = async () => {
  await cleanupWorkingDir(workingDir);
  workingDir = undefined;
};

export const closeProject = async (): Promise<void> => {
  await cleanupCurrentWorkingDir();
  state = defaultState();
  activeBookId = state.bookOrder[0];
  projectPath = undefined;
  isLegacyPending = false;
};

export const cleanupOnQuit = async (): Promise<void> => {
  await cleanupCurrentWorkingDir();
};

/** True once a legacy JSON project has been opened but not yet saved (upgraded) this session. */
export const isProjectLegacyUnsaved = (): boolean => isLegacyPending;

// --- Track file naming -------------------------------------------------------------

const nextSequentialFileName = async (dir: string, ext: string): Promise<string> => {
  let entries: string[] = [];
  try {
    entries = await fs.promises.readdir(dir);
  } catch {
    entries = [];
  }
  const pattern = new RegExp(`^(\\d+)\\${ext}$`);
  let max = 0;
  for (const entry of entries) {
    const match = entry.match(pattern);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `${max + 1}${ext}`;
};

/** Copies `sourcePath` into `bookId`'s working-directory folder, returning the new absolute path. */
const copyIntoBookDir = async (sourcePath: string, bookId: string): Promise<string> => {
  const dir = await ensureWorkingDir();
  const targetDir = bookDirOf(dir, bookId);
  await fs.promises.mkdir(targetDir, { recursive: true });
  const ext = path.extname(sourcePath) || '.mp3';
  const fileName = await nextSequentialFileName(targetDir, ext);
  const destPath = path.join(targetDir, fileName);
  await fs.promises.copyFile(sourcePath, destPath);
  return destPath;
};

/** Ensures every track/cover file referenced by `book` physically lives inside the working directory. */
const materializeBookFiles = async (book: Book): Promise<void> => {
  const dir = await ensureWorkingDir();
  const bookDir = bookDirOf(dir, book.id);
  await fs.promises.mkdir(bookDir, { recursive: true });

  for (let i = 0; i < book.tracks.length; i += 1) {
    const track = book.tracks[i];
    if (!track.path.startsWith(dir)) {
      const newPath = await copyIntoBookDir(track.path, book.id);
      book.tracks[i] = { ...track, path: newPath };
    }
  }

  if (book.metadata.coverPath && !book.metadata.coverPath.startsWith(dir)) {
    const newCoverPath = await copyIntoBookDir(book.metadata.coverPath, book.id);
    book.metadata = { ...book.metadata, coverPath: newCoverPath };
  }
};

// --- Open ----------------------------------------------------------------------------

const parseLegacyProject = (raw: string): LegacyProjectFile => {
  const parsed = JSON.parse(raw) as Partial<LegacyProjectFile>;
  return {
    version: 1,
    tracks: parsed.tracks || [],
    chapters: parsed.chapters || [],
    metadata: parsed.metadata || { title: 'Untitled Audiobook' },
  };
};

const loadRootManifest = async (dir: string): Promise<RootManifest> => {
  const raw = await fs.promises.readFile(rootIndexPathOf(dir), 'utf-8');
  const parsed = JSON.parse(raw) as Partial<RootManifest>;
  return {
    version: 2,
    type: parsed.type === 'series' ? 'series' : 'audiobook',
    series: parsed.type === 'series' ? parsed.series || { title: 'Untitled Series' } : null,
    bookOrder: parsed.bookOrder || [],
  };
};

const loadContainerAt = async (filePath: string): Promise<{ dir: string; manifest: RootManifest; books: Record<string, Book> }> => {
  const dir = await createWorkingDir();
  await unzipToDirectory(filePath, dir);
  const manifest = await loadRootManifest(dir);
  const books: Record<string, Book> = {};
  for (const bookId of manifest.bookOrder) {
    try {
      books[bookId] = await readBookIndex(dir, bookId);
    } catch (error) {
      console.warn(`[project] Failed to read book ${bookId}:`, error);
    }
  }
  return { dir, manifest, books };
};

export const openProjectFromFile = async (win: BrowserWindow): Promise<ProjectSnapshot | undefined> => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Open AudioPie Project',
    filters: [{ name: 'AudioPie Project', extensions: ['audiopie'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths[0]) {
    return undefined;
  }
  return openProjectAtPath(result.filePaths[0]);
};

export const openProjectAtPath = async (filePath: string): Promise<ProjectSnapshot> => {
  await cleanupCurrentWorkingDir();

  const format = await detectFormat(filePath);

  if (format === 'container') {
    const { dir, manifest, books } = await loadContainerAt(filePath);
    workingDir = dir;
    state = { type: manifest.type, series: manifest.series, bookOrder: manifest.bookOrder, books };
    activeBookId = manifest.bookOrder[0];
    isLegacyPending = false;
  } else {
    const raw = await fs.promises.readFile(filePath, 'utf-8');
    const legacy = parseLegacyProject(raw);
    const bookId = generateBookId();
    const book: Book = { id: bookId, metadata: legacy.metadata, tracks: legacy.tracks };
    state = { type: 'audiobook', series: null, bookOrder: [bookId], books: { [bookId]: book } };
    activeBookId = bookId;
    workingDir = undefined;
    isLegacyPending = true;
  }

  projectPath = filePath;
  return getSnapshot();
};

// --- Save ----------------------------------------------------------------------------

const ensureAudiopieExtension = (filePath: string): string =>
  filePath.endsWith('.audiopie') ? filePath : `${filePath}.audiopie`;

/** Deletes any `books/<id>/` directories on disk that are no longer referenced by `bookOrder`. */
const pruneRemovedBookFolders = async (dir: string): Promise<void> => {
  const booksDir = booksDirOf(dir);
  let entries: string[] = [];
  try {
    entries = await fs.promises.readdir(booksDir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!state.bookOrder.includes(entry)) {
      await fs.promises.rm(path.join(booksDir, entry), { recursive: true, force: true });
    }
  }
};

const writeContainerAndZip = async (filePath: string): Promise<void> => {
  const dir = await ensureWorkingDir();

  for (const bookId of state.bookOrder) {
    const book = state.books[bookId];
    if (!book) continue;
    await materializeBookFiles(book);
    await writeBookIndex(dir, book);
  }

  await pruneRemovedBookFolders(dir);

  const manifest: RootManifest = {
    version: 2,
    type: state.type,
    series: state.type === 'series' ? state.series || { title: 'Untitled Series' } : null,
    bookOrder: state.bookOrder,
  };
  await fs.promises.writeFile(rootIndexPathOf(dir), JSON.stringify(manifest, null, 2), 'utf-8');

  await zipDirectory(dir, filePath);
};

export const saveProjectToFile = async (win: BrowserWindow, targetPath?: string): Promise<void> => {
  let filePath = targetPath || projectPath;
  if (!filePath) {
    const result = await dialog.showSaveDialog(win, {
      title: 'Save AudioPie Project',
      filters: [{ name: 'AudioPie Project', extensions: ['audiopie'] }],
    });
    if (result.canceled || !result.filePath) {
      return;
    }
    filePath = result.filePath;
  }

  filePath = ensureAudiopieExtension(filePath);

  await writeContainerAndZip(filePath);

  isLegacyPending = false;
  projectPath = filePath;
};

// --- Create new ------------------------------------------------------------------------

export const showNewProjectSaveDialog = async (win: BrowserWindow, type: ProjectType): Promise<string | undefined> => {
  const result = await dialog.showSaveDialog(win, {
    title: type === 'series' ? 'Create New Series' : 'Create New Audiobook',
    filters: [{ name: 'AudioPie Project', extensions: ['audiopie'] }],
  });
  if (result.canceled || !result.filePath) {
    return undefined;
  }
  return ensureAudiopieExtension(result.filePath);
};

export const createNewProjectAtPath = async (type: ProjectType, savePath: string): Promise<ProjectSnapshot> => {
  await cleanupCurrentWorkingDir();

  if (type === 'audiobook') {
    const book = defaultBook();
    state = { type: 'audiobook', series: null, bookOrder: [book.id], books: { [book.id]: book } };
    activeBookId = book.id;
  } else {
    state = { type: 'series', series: { title: 'Untitled Series' }, bookOrder: [], books: {} };
    activeBookId = undefined;
  }
  isLegacyPending = false;

  const filePath = ensureAudiopieExtension(savePath);
  await writeContainerAndZip(filePath);
  projectPath = filePath;

  return getSnapshot();
};

/** Reads an existing `.audiopie` file's first book's metadata for use as a template. Rejects series files. */
export const readTemplateMetadata = async (templatePath: string): Promise<BookMetadata> => {
  const format = await detectFormat(templatePath);
  if (format === 'legacy-json') {
    const raw = await fs.promises.readFile(templatePath, 'utf-8');
    return parseLegacyProject(raw).metadata;
  }

  const scratchDir = await createWorkingDir();
  try {
    await unzipToDirectory(templatePath, scratchDir);
    const manifest = await loadRootManifest(scratchDir);
    if (manifest.type === 'series') {
      throw new Error('Only audiobook files can be used as a template.');
    }
    const bookId = manifest.bookOrder[0];
    if (!bookId) {
      return { title: 'Untitled Audiobook' };
    }
    const book = await readBookIndex(scratchDir, bookId);
    return book.metadata;
  } finally {
    await cleanupWorkingDir(scratchDir);
  }
};

/** Applies a template's metadata (and cover, if any) onto the currently active book. */
export const applyTemplateToActiveBook = async (templatePath: string): Promise<BookMetadata> => {
  const templateMetadata = await readTemplateMetadata(templatePath);
  const active = getActiveBook();

  let coverPath: string | undefined;
  if (templateMetadata.coverPath && fs.existsSync(templateMetadata.coverPath)) {
    coverPath = await copyIntoBookDir(templateMetadata.coverPath, active.id);
  }

  const mergedMetadata: BookMetadata = {
    ...active.metadata,
    author: templateMetadata.author,
    narrator: templateMetadata.narrator,
    genre: templateMetadata.genre,
    publisher: templateMetadata.publisher,
    series: templateMetadata.series,
    seriesIndex: templateMetadata.seriesIndex,
    coverPath: coverPath ?? active.metadata.coverPath,
  };

  state.books[active.id] = { ...active, metadata: mergedMetadata };
  return mergedMetadata;
};

// --- Active-book track/metadata editing ------------------------------------------------

export const addTracksToActiveBook = async (
  paths: string[],
): Promise<{ added: TrackInfo[]; errors: string[] }> => {
  const active = getActiveBook();
  const added: TrackInfo[] = [];
  const errors: string[] = [];

  for (const sourcePath of paths) {
    let copiedPath: string | undefined;
    try {
      copiedPath = await copyIntoBookDir(sourcePath, active.id);
      const durationMs = await probeDuration(copiedPath);
      added.push({
        path: copiedPath,
        displayTitle: path.basename(sourcePath).replace(/\.[^/.]+$/, ''),
        durationMs,
      });
    } catch (error) {
      if (copiedPath) {
        await fs.promises.unlink(copiedPath).catch(() => undefined);
      }
      errors.push(`${path.basename(sourcePath)}: ${(error as Error).message}`);
    }
  }

  if (added.length > 0) {
    const book = getActiveBook();
    state.books[book.id] = { ...book, tracks: [...book.tracks, ...added] };
  }

  return { added, errors };
};

export const removeTracksFromActiveBook = async (indexes: number[]): Promise<TrackInfo[]> => {
  const active = getActiveBook();
  const toRemove = active.tracks.filter((_, index) => indexes.includes(index));
  for (const track of toRemove) {
    await fs.promises.unlink(track.path).catch(() => undefined);
  }
  const remaining = active.tracks.filter((_, index) => !indexes.includes(index));
  state.books[active.id] = { ...active, tracks: remaining };
  return remaining;
};

export const setActiveBookTracks = (tracks: TrackInfo[]) => {
  const active = getActiveBook();
  state.books[active.id] = { ...active, tracks };
};

export const setActiveBookMetadata = (metadata: BookMetadata) => {
  const active = getActiveBook();
  state.books[active.id] = { ...active, metadata };
};

export const setActiveTrackTitle = (index: number, title: string): TrackInfo | undefined => {
  const active = getActiveBook();
  if (!active.tracks[index]) {
    return undefined;
  }
  const updated = active.tracks.map((track, idx) => (idx === index ? { ...track, displayTitle: title } : track));
  state.books[active.id] = { ...active, tracks: updated };
  return updated[index];
};

export const setActiveBookCoverFromPath = async (sourcePath: string): Promise<string> => {
  const active = getActiveBook();
  const coverPath = await copyIntoBookDir(sourcePath, active.id);
  state.books[active.id] = { ...active, metadata: { ...active.metadata, coverPath } };
  return coverPath;
};

export const clearActiveBookCover = () => {
  const active = getActiveBook();
  if (active.metadata.coverPath) {
    fs.promises.unlink(active.metadata.coverPath).catch(() => undefined);
  }
  state.books[active.id] = { ...active, metadata: { ...active.metadata, coverPath: undefined } };
};

// --- Series & book management ------------------------------------------------------------

export const addBookToSeries = (): ProjectSnapshot => {
  if (state.type !== 'series') {
    throw new Error('addBookToSeries can only be called on a series project.');
  }
  const book = defaultBook();
  book.metadata = {
    title: 'Untitled Audiobook',
    author: state.series?.author,
    narrator: state.series?.narrator,
  };
  state.books[book.id] = book;
  state.bookOrder = [...state.bookOrder, book.id];
  activeBookId = book.id;
  return getSnapshot();
};

export const removeBookFromSeries = (bookId: string): ProjectSnapshot => {
  state.bookOrder = state.bookOrder.filter((id) => id !== bookId);
  delete state.books[bookId];
  if (activeBookId === bookId) {
    activeBookId = state.bookOrder[0];
  }
  return getSnapshot();
};

export const reorderBooks = (order: string[]): ProjectSnapshot => {
  const known = new Set(state.bookOrder);
  const filtered = order.filter((id) => known.has(id));
  // Preserve any ids from the current order that were missing from `order` (defensive).
  const missing = state.bookOrder.filter((id) => !filtered.includes(id));
  state.bookOrder = [...filtered, ...missing];
  return getSnapshot();
};

export const updateBookSeriesIndex = (bookId: string, seriesIndex: number | undefined): ProjectSnapshot => {
  const book = state.books[bookId];
  if (!book) {
    throw new Error(`Unknown book id: ${bookId}`);
  }
  state.books[bookId] = { ...book, metadata: { ...book.metadata, seriesIndex } };
  return getSnapshot();
};

export const updateSeriesMetadata = (metadata: Partial<SeriesMetadata>): ProjectSnapshot => {
  if (state.type !== 'series') {
    throw new Error('updateSeriesMetadata can only be called on a series project.');
  }
  state.series = { ...(state.series || { title: 'Untitled Series' }), ...metadata };
  return getSnapshot();
};

export const importBookFromFile = async (filePath: string): Promise<ProjectSnapshot> => {
  if (state.type !== 'series') {
    throw new Error('importBookFromFile can only be called on a series project.');
  }

  const format = await detectFormat(filePath);
  const scratchDir = await createWorkingDir();
  try {
    let sourceBookId: string;
    if (format === 'legacy-json') {
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      const legacy = parseLegacyProject(raw);
      sourceBookId = generateBookId();
      const scratchBook: Book = { id: sourceBookId, metadata: legacy.metadata, tracks: legacy.tracks };
      for (let i = 0; i < scratchBook.tracks.length; i += 1) {
        const track = scratchBook.tracks[i];
        const targetDir = bookDirOf(scratchDir, sourceBookId);
        await fs.promises.mkdir(targetDir, { recursive: true });
        const destPath = path.join(targetDir, path.basename(track.path));
        await fs.promises.copyFile(track.path, destPath);
        scratchBook.tracks[i] = { ...track, path: destPath };
      }
      await writeBookIndex(scratchDir, scratchBook);
    } else {
      await unzipToDirectory(filePath, scratchDir);
      const manifest = await loadRootManifest(scratchDir);
      if (manifest.type === 'series') {
        throw new Error('Only individual audiobook files can be imported.');
      }
      sourceBookId = manifest.bookOrder[0];
      if (!sourceBookId) {
        throw new Error('Selected file has no book to import.');
      }
    }

    const dir = await ensureWorkingDir();
    const newBookId = generateBookId();
    const destDir = bookDirOf(dir, newBookId);
    await fs.promises.cp(bookDirOf(scratchDir, sourceBookId), destDir, { recursive: true });
    const importedBook = await readBookIndex(dir, newBookId);
    state.books[newBookId] = { ...importedBook, id: newBookId };
    state.bookOrder = [...state.bookOrder, newBookId];
    activeBookId = newBookId;

    return getSnapshot();
  } finally {
    await cleanupWorkingDir(scratchDir);
  }
};

export const extractBook = async (bookId: string, savePath: string): Promise<void> => {
  const book = state.books[bookId];
  if (!book) {
    throw new Error(`Unknown book id: ${bookId}`);
  }
  const dir = await ensureWorkingDir();
  const scratchDir = await createWorkingDir();
  try {
    await fs.promises.cp(bookDirOf(dir, bookId), bookDirOf(scratchDir, bookId), { recursive: true });
    const manifest: RootManifest = { version: 2, type: 'audiobook', series: null, bookOrder: [bookId] };
    await fs.promises.writeFile(rootIndexPathOf(scratchDir), JSON.stringify(manifest, null, 2), 'utf-8');
    await zipDirectory(scratchDir, ensureAudiopieExtension(savePath));
  } finally {
    await cleanupWorkingDir(scratchDir);
  }
};

export const setProjectType = async (newType: ProjectType): Promise<ProjectSnapshot> => {
  if (newType === state.type) {
    return getSnapshot();
  }

  if (newType === 'series') {
    state.series = { title: state.books[state.bookOrder[0]]?.metadata.series || 'Untitled Series' };
    state.type = 'series';
    return getSnapshot();
  }

  // series -> audiobook
  if (state.bookOrder.length === 0) {
    const book = defaultBook();
    state.books[book.id] = book;
    state.bookOrder = [book.id];
    activeBookId = book.id;
  } else {
    const keptId = state.bookOrder[0];
    for (const id of state.bookOrder.slice(1)) {
      delete state.books[id];
    }
    state.bookOrder = [keptId];
    activeBookId = keptId;
  }
  state.type = 'audiobook';
  state.series = null;
  return getSnapshot();
};

export const getBookCount = (): number => state.bookOrder.length;

export const ensureAbsolutePath = (referencePath: string, filePath: string): string => {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.resolve(path.dirname(referencePath), filePath);
};
