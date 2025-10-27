import fs from 'fs';
import os from 'os';
import path from 'path';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import type { FfmpegCommand } from 'fluent-ffmpeg';
import { BookMetadata, BuildOptions, BuildProgress, Chapter, TrackInfo } from './types';
import { getDefaultTempDir } from './settings';

// Устанавливаем путь к ffmpeg из ffmpeg-static
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
  // ffmpeg-static также предоставляет ffprobe
  const ffprobePath = ffmpegStatic.replace('ffmpeg', 'ffprobe');
  if (fs.existsSync(ffprobePath)) {
    ffmpeg.setFfprobePath(ffprobePath);
  }
}

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
  if (!ffmpegStatic) {
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
  if (!ffmpegStatic) {
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
