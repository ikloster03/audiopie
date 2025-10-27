import fs from 'fs';
import os from 'os';
import path from 'path';
import { app } from 'electron';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import type { FfmpegCommand } from 'fluent-ffmpeg';
import { BookMetadata, BuildOptions, BuildProgress, Chapter, TrackInfo } from './types';
import { getDefaultTempDir, getSettings, resolveBinary } from './settings';

// Получаем правильный путь к ffmpeg с учетом настроек и упаковки в asar
const getFFmpegPath = (): string | null => {
  // 1. Сначала проверяем настройки пользователя
  const settings = getSettings();
  if (settings.ffmpegPath) {
    console.log('[FFmpeg] Checking configured path:', settings.ffmpegPath);
    if (fs.existsSync(settings.ffmpegPath)) {
      console.log('[FFmpeg] Using configured FFmpeg');
      return settings.ffmpegPath;
    } else {
      console.warn('[FFmpeg] Configured path does not exist');
    }
  }
  
  // 2. Пробуем найти через resolveBinary (PATH)
  const resolved = resolveBinary('ffmpeg');
  if (resolved) {
    console.log('[FFmpeg] Found FFmpeg in system');
    return resolved;
  }
  
  // 3. Пробуем использовать ffmpeg-static
  if (!ffmpegStatic) {
    console.log('[FFmpeg] ffmpeg-static not available');
    return null;
  }
  
  // В production режиме, если приложение упаковано
  if (app.isPackaged) {
    // ffmpeg-static находится в app.asar.unpacked
    const unpackedPath = ffmpegStatic.replace('app.asar', 'app.asar.unpacked');
    console.log('[FFmpeg] Checking unpacked path:', unpackedPath);
    if (fs.existsSync(unpackedPath)) {
      return unpackedPath;
    }
  }
  
  // В dev режиме или если unpacked путь не найден
  console.log('[FFmpeg] Checking static path:', ffmpegStatic);
  if (fs.existsSync(ffmpegStatic)) {
    return ffmpegStatic;
  }
  
  return null;
};

const getFFprobePath = (): string | null => {
  // 1. Проверяем настройки пользователя
  const settings = getSettings();
  if (settings.ffprobePath) {
    console.log('[FFmpeg] Checking configured ffprobe:', settings.ffprobePath);
    if (fs.existsSync(settings.ffprobePath)) {
      console.log('[FFmpeg] Using configured FFprobe');
      return settings.ffprobePath;
    } else {
      console.warn('[FFmpeg] Configured ffprobe path does not exist');
    }
  }
  
  // 2. Пробуем найти через resolveBinary (PATH)
  const resolved = resolveBinary('ffprobe');
  if (resolved) {
    console.log('[FFmpeg] Found FFprobe in system');
    return resolved;
  }
  
  // 3. Пробуем найти рядом с ffmpeg
  if (ffmpegPath) {
    const ffprobePath = ffmpegPath.replace(/ffmpeg(.exe)?$/, 'ffprobe$1');
    if (fs.existsSync(ffprobePath)) {
      console.log('[FFmpeg] Found FFprobe next to FFmpeg');
      return ffprobePath;
    }
  }
  
  return null;
};

let ffmpegPath: string | null = null;
let ffprobePath: string | null = null;
let initialized = false;

// Функция для инициализации FFmpeg (должна вызываться после app.whenReady())
export const initializeFFmpeg = (): void => {
  if (initialized) return;
  
  console.log('[FFmpeg] Initializing...');
  console.log('[FFmpeg] app.isPackaged:', app.isPackaged);
  console.log('[FFmpeg] app.getAppPath():', app.getAppPath());
  
  ffmpegPath = getFFmpegPath();
  if (ffmpegPath) {
    console.log('[FFmpeg] Using FFmpeg at:', ffmpegPath);
    ffmpeg.setFfmpegPath(ffmpegPath);
    
    ffprobePath = getFFprobePath();
    if (ffprobePath) {
      console.log('[FFmpeg] Using FFprobe at:', ffprobePath);
      ffmpeg.setFfprobePath(ffprobePath);
    } else {
      console.warn('[FFmpeg] FFprobe not found');
    }
  } else {
    console.error('[FFmpeg] FFmpeg binary not found');
  }
  
  initialized = true;
};

let currentCommand: FfmpegCommand | null = null;
let cancelRequested = false;
let libfdkAvailable: boolean | null = null;

const ensureDir = async (dir: string) => {
  await fs.promises.mkdir(dir, { recursive: true });
};

export const isBusy = (): boolean => currentCommand !== null;

export const cancelBuild = () => {
  cancelRequested = true;
  if (currentCommand) {
    currentCommand.kill('SIGINT');
  }
};

const detectLibfdk = async (): Promise<boolean> => {
  if (libfdkAvailable !== null) {
    return libfdkAvailable;
  }
  
  return new Promise((resolve) => {
    const command = ffmpeg();
    command.getAvailableCodecs((err: Error | null, codecs: Record<string, any>) => {
      if (err || !codecs) {
        libfdkAvailable = false;
        resolve(false);
        return;
      }
      
      libfdkAvailable = 'libfdk_aac' in codecs;
      resolve(libfdkAvailable ?? false);
    });
  });
};

export const probeDuration = async (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error | null, metadata: any) => {
      if (err) {
        reject(new Error(`Unable to probe file: ${err.message}`));
        return;
      }
      
      const duration = metadata?.format?.duration;
      if (!duration || Number.isNaN(duration)) {
        reject(new Error(`Unable to parse duration for ${filePath}`));
        return;
      }
      
      resolve(Math.round(duration * 1000));
    });
  });
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

const createFfmpegCommand = (): FfmpegCommand => {
  const command = ffmpeg();
  if (!ffmpegPath) {
    throw new Error('FFmpeg binary not found');
  }
  return command;
};

export const buildAudiobook = async (
  tracks: TrackInfo[],
  chapters: Chapter[],
  metadata: BookMetadata,
  options: BuildOptions,
  onProgress: (progress: BuildProgress) => void,
): Promise<void> => {
  if (!ffmpegPath) {
    throw new Error('FFmpeg binary not found');
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

  const useLibfdk = await detectLibfdk();

  try {
    // Этап 1: Кодирование и объединение треков
    onProgress({ phase: 'encode', message: 'Encoding audio…', percent: 0 });

    await new Promise<void>((resolve, reject) => {
      const command = createFfmpegCommand()
        .input(concatListPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .noVideo();

      if (useLibfdk) {
        command.audioCodec('libfdk_aac').audioQuality(3);
      } else {
        command.audioCodec('aac').audioBitrate(`${options.bitrateKbps}k`);
      }

      command
        .output(mergedPath)
        .on('start', (commandLine: string) => {
          fs.appendFileSync(logPath, `Encode command: ${commandLine}\n`);
        })
        .on('progress', (progress: any) => {
          if (progress.timemark && totalDuration > 0) {
            // Parse timemark (format: HH:MM:SS.MS)
            const parts = progress.timemark.split(':');
            if (parts.length === 3) {
              const hours = parseFloat(parts[0]);
              const minutes = parseFloat(parts[1]);
              const seconds = parseFloat(parts[2]);
              const currentMs = Math.round(((hours * 60 + minutes) * 60 + seconds) * 1000);
              const percent = Math.min(99, Math.round((currentMs / totalDuration) * 100));
              onProgress({ phase: 'encode', percent, message: 'Encoding audio…' });
            }
          }
        })
        .on('error', (err: Error) => {
          fs.appendFileSync(logPath, `Encode error: ${err.message}\n`);
          reject(err);
        })
        .on('end', () => {
          fs.appendFileSync(logPath, 'Encode complete\n');
          resolve();
        });

      currentCommand = command;
      command.run();
    });

    if (cancelRequested) {
      throw new Error('Build cancelled');
    }

    // Этап 2: Добавление метаданных и обложки
    onProgress({ phase: 'chapters', message: 'Applying chapters…', percent: 80 });

    let coverPath: string | undefined;
    if (metadata.coverPath && fs.existsSync(metadata.coverPath)) {
      coverPath = metadata.coverPath;
    }

    await new Promise<void>((resolve, reject) => {
      const command = createFfmpegCommand()
        .input(mergedPath);

      if (coverPath) {
        command.input(coverPath);
      }

      command
        .input(metadataPath)
        .outputOptions([
          '-map', '0:a',
        ]);

      if (coverPath) {
        command.outputOptions([
          '-map', '1:v',
          '-c:v', 'copy',
          '-disposition:v:0', 'attached_pic',
        ]);
      }

      command
        .outputOptions([
          '-map_metadata', coverPath ? '2' : '1',
          '-c:a', 'copy',
          '-movflags', '+faststart',
        ])
        .output(options.outputPath)
        .on('start', (commandLine: string) => {
          fs.appendFileSync(logPath, `Finalize command: ${commandLine}\n`);
        })
        .on('progress', () => {
          onProgress({ phase: 'finalize', message: 'Writing final file…', percent: 95 });
        })
        .on('error', (err: Error) => {
          fs.appendFileSync(logPath, `Finalize error: ${err.message}\n`);
          reject(err);
        })
        .on('end', () => {
          fs.appendFileSync(logPath, 'Finalize complete\n');
          resolve();
        });

      currentCommand = command;
      command.run();
    });

    if (cancelRequested) {
      throw new Error('Build cancelled');
    }

    const stat = await fs.promises.stat(options.outputPath).catch(() => undefined);
    if (!stat || stat.size === 0) {
      throw new Error('Output file was not created.');
    }
    
    // Очистка временных файлов
    if (!options.tempDir) {
      try {
        await fs.promises.rm(tempRoot, { recursive: true, force: true });
      } catch (error) {
        console.warn('Failed to clean up temporary files:', error);
      }
    }
    
    onProgress({ phase: 'finalize', message: 'Build complete', percent: 100 });
  } catch (error) {
    // Очистка временных файлов при ошибке
    if (!options.tempDir) {
      try {
        await fs.promises.rm(tempRoot, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary files:', cleanupError);
      }
    }
    throw error;
  } finally {
    currentCommand = null;
    cancelRequested = false;
  }
};
