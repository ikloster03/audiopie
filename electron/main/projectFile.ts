import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { app } from 'electron';
import yazl from 'yazl';
import yauzl from 'yauzl';
import type { Book, BookIndexFile, Chapter, TrackInfo } from './types';

const WORKING_DIR_PREFIX = 'audiopie-';

/**
 * Recursively collects every regular file inside `dir`, returning paths
 * relative to `dir` using forward slashes (ZIP-entry style).
 */
const walkFiles = async (dir: string, base = ''): Promise<string[]> => {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const relative = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(path.join(dir, entry.name), relative)));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }
  return files;
};

/**
 * Packs `sourceDir`'s contents into a ZIP archive at `destPath`, using the
 * STORE (uncompressed) method for every entry, streaming file contents so
 * memory usage stays bounded regardless of archive size.
 */
export const zipDirectory = async (sourceDir: string, destPath: string): Promise<void> => {
  const zipFile = new yazl.ZipFile();
  const relativeFiles = await walkFiles(sourceDir);

  for (const relativeFile of relativeFiles) {
    zipFile.addFile(path.join(sourceDir, relativeFile), relativeFile, { compress: false });
  }

  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(destPath);
    writeStream.on('error', reject);
    writeStream.on('close', resolve);
    zipFile.outputStream.on('error', reject);
    zipFile.outputStream.pipe(writeStream);
    zipFile.end();
  });
};

/**
 * Extracts a ZIP archive at `zipPath` into `destDir` (created if missing),
 * streaming each entry to disk so memory usage stays bounded.
 */
export const unzipToDirectory = async (zipPath: string, destDir: string): Promise<void> => {
  await fs.promises.mkdir(destDir, { recursive: true });

  await new Promise<void>((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (openErr, zipfile) => {
      if (openErr || !zipfile) {
        reject(openErr ?? new Error('Failed to open ZIP archive'));
        return;
      }

      zipfile.on('error', reject);
      zipfile.readEntry();

      zipfile.on('entry', (entry) => {
        const entryPath = path.join(destDir, entry.fileName);

        // Directory entry (name ends with '/')
        if (/\/$/.test(entry.fileName)) {
          fs.promises
            .mkdir(entryPath, { recursive: true })
            .then(() => zipfile.readEntry())
            .catch(reject);
          return;
        }

        fs.promises
          .mkdir(path.dirname(entryPath), { recursive: true })
          .then(() => {
            zipfile.openReadStream(entry, (readErr, readStream) => {
              if (readErr || !readStream) {
                reject(readErr ?? new Error(`Failed to read entry ${entry.fileName}`));
                return;
              }
              const writeStream = fs.createWriteStream(entryPath);
              readStream.on('error', reject);
              writeStream.on('error', reject);
              writeStream.on('close', () => zipfile.readEntry());
              readStream.pipe(writeStream);
            });
          })
          .catch(reject);
      });

      zipfile.on('end', () => resolve());
    });
  });
};

export type ProjectFileFormat = 'container' | 'legacy-json';

/**
 * Sniffs the first bytes of a file to determine whether it is a ZIP
 * container (`PK\x03\x04` local-file-header signature) or a legacy
 * plain-JSON project file, independent of the file's extension.
 */
export const detectFormat = async (filePath: string): Promise<ProjectFileFormat> => {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(4);
    const { bytesRead } = await handle.read(buffer, 0, 4, 0);
    if (bytesRead >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
      return 'container';
    }
    return 'legacy-json';
  } finally {
    await handle.close();
  }
};

/**
 * Creates a new, unique per-session working directory under the OS temp
 * directory, e.g. `<tmp>/audiopie-<sessionId>/`.
 */
export const createWorkingDir = async (): Promise<string> => {
  const tempRoot = app.getPath('temp');
  const sessionId = crypto.randomBytes(8).toString('hex');
  const workingDir = path.join(tempRoot, `${WORKING_DIR_PREFIX}${sessionId}`);
  await fs.promises.mkdir(workingDir, { recursive: true });
  return workingDir;
};

/**
 * Deletes a working directory created by `createWorkingDir`. Safe to call
 * with `undefined`/a non-existent path.
 */
export const cleanupWorkingDir = async (workingDir: string | undefined): Promise<void> => {
  if (!workingDir) {
    return;
  }
  try {
    await fs.promises.rm(workingDir, { recursive: true, force: true });
  } catch (error) {
    console.warn('[projectFile] Failed to clean up working directory:', workingDir, error);
  }
};

/**
 * Removes any orphaned `audiopie-*` temp directories left behind by a
 * previous crash. Intended to be called once at app startup.
 */
export const sweepOrphanedWorkingDirs = async (): Promise<void> => {
  const tempRoot = app.getPath('temp');
  let entries: fs.Dirent[] = [];
  try {
    entries = await fs.promises.readdir(tempRoot, { withFileTypes: true });
  } catch (error) {
    console.warn('[projectFile] Failed to read temp directory for sweep:', error);
    return;
  }

  const orphaned = entries.filter((entry) => entry.isDirectory() && entry.name.startsWith(WORKING_DIR_PREFIX));
  for (const entry of orphaned) {
    await cleanupWorkingDir(path.join(tempRoot, entry.name));
  }
};

/** Generates a new opaque, stable book folder id, e.g. `book-a1b2c3d4`. */
export const generateBookId = (): string => `book-${crypto.randomBytes(4).toString('hex')}`;

export const booksDirOf = (workingDir: string): string => path.join(workingDir, 'books');

export const bookDirOf = (workingDir: string, bookId: string): string => path.join(booksDirOf(workingDir), bookId);

export const rootIndexPathOf = (workingDir: string): string => path.join(workingDir, 'index.json');

export const bookIndexPathOf = (workingDir: string, bookId: string): string =>
  path.join(bookDirOf(workingDir, bookId), 'index.json');

/**
 * Derives a book's chapter list from its own `tracks` array: one chapter
 * per track, in array order, with contiguous `startMs`/`endMs` ranges
 * computed from track durations. Chapters are never persisted separately.
 */
export const computeChaptersFromTracks = (tracks: TrackInfo[]): Chapter[] => {
  let cursor = 0;
  return tracks.map((track) => {
    const startMs = cursor;
    const endMs = cursor + (track.durationMs || 0);
    cursor = endMs;
    return { title: track.displayTitle, startMs, endMs };
  });
};

/**
 * Reads a single book's `books/<bookId>/index.json` in isolation, resolving
 * its serialized (bare-filename) track/cover references into absolute paths
 * within the working directory. Does not touch the root manifest or any
 * other book.
 */
export const readBookIndex = async (workingDir: string, bookId: string): Promise<Book> => {
  const bookDir = bookDirOf(workingDir, bookId);
  const raw = await fs.promises.readFile(bookIndexPathOf(workingDir, bookId), 'utf-8');
  const parsed = JSON.parse(raw) as BookIndexFile;

  const tracks: TrackInfo[] = (parsed.tracks || []).map((track) => ({
    path: path.join(bookDir, track.file),
    displayTitle: track.displayTitle,
    durationMs: track.durationMs,
  }));

  const coverFile = parsed.metadata?.coverFile;
  return {
    id: bookId,
    metadata: {
      ...parsed.metadata,
      coverPath: coverFile ? path.join(bookDir, coverFile) : undefined,
    },
    tracks,
  };
};

/**
 * Writes a single book's `books/<bookId>/index.json` in isolation,
 * serializing its absolute track/cover paths down to bare file names.
 * Creates the book's directory if it doesn't exist yet. Does not touch the
 * root manifest or any other book.
 */
export const writeBookIndex = async (workingDir: string, book: Book): Promise<void> => {
  const bookDir = bookDirOf(workingDir, book.id);
  await fs.promises.mkdir(bookDir, { recursive: true });

  const { coverPath, ...restMetadata } = book.metadata;
  const coverFile = coverPath ? path.basename(coverPath) : undefined;

  const payload: BookIndexFile = {
    metadata: { ...restMetadata, coverFile },
    tracks: book.tracks.map((track) => ({
      file: path.basename(track.path),
      displayTitle: track.displayTitle,
      durationMs: track.durationMs,
    })),
  };

  await fs.promises.writeFile(bookIndexPathOf(workingDir, book.id), JSON.stringify(payload, null, 2), 'utf-8');
};
