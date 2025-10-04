import fs from 'fs';
import os from 'os';
import path from 'path';
import { execa } from 'execa';
import type { Subprocess } from 'execa';
import { BookMetadata, BuildOptions, BuildProgress, Chapter, TrackInfo } from './types';
import { resolveBinary, getDefaultTempDir } from './settings';

let currentProcess: Subprocess | null = null;
let cancelRequested = false;
let libfdkAvailable: boolean | null = null;

const ensureDir = async (dir: string) => {
  await fs.promises.mkdir(dir, { recursive: true });
};

export const isBusy = (): boolean => currentProcess !== null;

export const cancelBuild = () => {
  cancelRequested = true;
  if (currentProcess) {
    currentProcess.kill('SIGINT');
  }
};

const detectLibfdk = async (ffmpegPath: string): Promise<boolean> => {
  if (libfdkAvailable !== null) {
    return libfdkAvailable;
  }
  try {
    const { stdout } = await execa(ffmpegPath, ['-hide_banner', '-codecs'], { windowsHide: true });
    libfdkAvailable = stdout.includes('libfdk_aac');
  } catch (error) {
    libfdkAvailable = false;
  }
  return libfdkAvailable ?? false;
};

export const probeDuration = async (filePath: string): Promise<number> => {
  const ffprobePath = resolveBinary('ffprobe');
  if (!ffprobePath) {
    throw new Error('FFprobe not configured. Please set the path in settings.');
  }
  const { stdout } = await execa(ffprobePath, [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    filePath,
  ], { windowsHide: true });
  const durationSeconds = parseFloat(stdout.trim());
  if (Number.isNaN(durationSeconds)) {
    throw new Error(`Unable to parse duration for ${filePath}`);
  }
  return Math.round(durationSeconds * 1000);
};

const escapeForConcat = (filePath: string): string => {
  return filePath.replace(/\\/g, '\\\\').replace(/'/g, "'\\''");
};

const writeConcatList = async (paths: string[], listPath: string) => {
  const lines = paths.map((p) => `file '${escapeForConcat(p)}'`);
  await fs.promises.writeFile(listPath, lines.join(os.EOL), 'utf-8');
};

const formatMetadataValue = (value?: string | number): string => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).replace(/\n/g, '\\n');
};

const writeMetadataFile = async (
  metadata: BookMetadata,
  chapters: Chapter[],
  metadataPath: string,
) => {
  const headerLines = [
    ';FFMETADATA1',
    `title=${formatMetadataValue(metadata.title)}`,
    `artist=${formatMetadataValue(metadata.author)}`,
    `album_artist=${formatMetadataValue(metadata.narrator)}`,
    `date=${formatMetadataValue(metadata.year)}`,
    `genre=${formatMetadataValue(metadata.genre)}`,
    `publisher=${formatMetadataValue(metadata.publisher)}`,
    `comment=${formatMetadataValue(metadata.description)}`,
  ];
  const chapterLines = chapters.flatMap((chapter) => [
    '',
    '[CHAPTER]',
    'TIMEBASE=1/1000',
    `START=${chapter.startMs}`,
    `END=${chapter.endMs}`,
    `title=${formatMetadataValue(chapter.title)}`,
  ]);
  const content = [...headerLines, ...chapterLines].join(os.EOL);
  await fs.promises.writeFile(metadataPath, content, 'utf-8');
};

const parseFfmpegTime = (line: string): number | undefined => {
  const match = /time=(\d+):(\d+):(\d+\.\d+)/.exec(line);
  if (!match) {
    return undefined;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  return Math.round(((hours * 60 + minutes) * 60 + seconds) * 1000);
};

const attachLogging = (child: Subprocess, logPath: string) => {
  const stream = fs.createWriteStream(logPath, { flags: 'a' });
  child.stdout?.on('data', (chunk: Buffer) => stream.write(chunk));
  child.stderr?.on('data', (chunk: Buffer) => stream.write(chunk));
  child.once('exit', () => {
    stream.end();
  });
};

export const buildAudiobook = async (
  tracks: TrackInfo[],
  chapters: Chapter[],
  metadata: BookMetadata,
  options: BuildOptions,
  onProgress: (progress: BuildProgress) => void,
): Promise<void> => {
  const ffmpegPath = resolveBinary('ffmpeg');
  if (!ffmpegPath) {
    throw new Error('FFmpeg not configured. Please set the path in settings.');
  }
  cancelRequested = false;
  const totalDuration = tracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
  const tempRoot = options.tempDir || path.join(getDefaultTempDir(), String(Date.now()));
  await ensureDir(tempRoot);
  const concatListPath = path.join(tempRoot, 'list.txt');
  const metadataPath = path.join(tempRoot, 'ffmetadata.txt');
  const mergedPath = path.join(tempRoot, 'merged.m4a');
  const logPath = path.join(tempRoot, 'ffmpeg.log');
  await writeConcatList(tracks.map((t) => t.path), concatListPath);
  await writeMetadataFile(metadata, chapters, metadataPath);

  const useLibfdk = await detectLibfdk(ffmpegPath);

  const encodeArgs = [
    '-hide_banner',
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    concatListPath,
    '-vn',
  ];
  if (useLibfdk) {
    encodeArgs.push('-c:a', 'libfdk_aac', '-vbr', '3');
  } else {
    encodeArgs.push('-c:a', 'aac', '-b:a', `${options.bitrateKbps}k`);
  }
  encodeArgs.push(mergedPath);

  onProgress({ phase: 'encode', message: 'Encoding audio…', percent: 0 });

  const encodeProcess = execa(ffmpegPath, encodeArgs, { windowsHide: true });
  currentProcess = encodeProcess;
  attachLogging(encodeProcess, logPath);

  try {
    if (totalDuration > 0) {
      encodeProcess.stderr?.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        const current = parseFfmpegTime(text);
        if (current !== undefined) {
          const percent = Math.min(99, Math.round((current / totalDuration) * 100));
          onProgress({ phase: 'encode', percent, message: 'Encoding audio…' });
        }
      });
    }

    await encodeProcess;

    if (cancelRequested) {
      throw new Error('Build cancelled');
    }

    onProgress({ phase: 'chapters', message: 'Applying chapters…', percent: 80 });

    const finalArgs = ['-hide_banner', '-y', '-i', mergedPath];

  let coverPath: string | undefined;
  if (metadata.coverPath && fs.existsSync(metadata.coverPath)) {
    coverPath = metadata.coverPath;
  }

  if (coverPath) {
    finalArgs.push('-i', coverPath);
  }

  finalArgs.push('-i', metadataPath);

  if (coverPath) {
    finalArgs.push(
      '-map',
      '0',
      '-map',
      '1',
      '-map_metadata',
      '2',
      '-c',
      'copy',
      '-disposition:1',
      'attached_pic',
    );
  } else {
    finalArgs.push('-map', '0', '-map_metadata', '1', '-c', 'copy');
  }

  finalArgs.push('-movflags', '+faststart', '-f', 'mp4', options.outputPath);

    onProgress({ phase: 'finalize', message: 'Writing final file…', percent: 95 });

    const finalizeProcess = execa(ffmpegPath, finalArgs, { windowsHide: true });
    currentProcess = finalizeProcess;
    attachLogging(finalizeProcess, logPath);

    await finalizeProcess;

    if (cancelRequested) {
      throw new Error('Build cancelled');
    }
    const stat = await fs.promises.stat(options.outputPath).catch(() => undefined);
    if (!stat || stat.size === 0) {
      throw new Error('Output file was not created.');
    }
    onProgress({ phase: 'finalize', message: 'Build complete', percent: 100 });
  } finally {
    currentProcess = null;
  }
};
