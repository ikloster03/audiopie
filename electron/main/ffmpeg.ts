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

let currentCommands: FfmpegCommand[] = [];
let cancelRequested = false;
let libfdkAvailable: boolean | null = null;

const ensureDir = async (dir: string) => {
  await fs.promises.mkdir(dir, { recursive: true });
};

export const isBusy = (): boolean => currentCommands.length > 0;

export const cancelBuild = () => {
  cancelRequested = true;
  currentCommands.forEach((command) => {
    try {
      command.kill('SIGINT');
    } catch (error) {
      console.warn('Failed to kill ffmpeg process:', error);
    }
  });
  currentCommands = [];
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

/**
 * Параллельная обработка массива задач с ограничением количества одновременных выполнений
 */
const processInParallel = async <T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let index = 0;
  
  const executeNext = async (): Promise<void> => {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await processor(items[currentIndex], currentIndex);
    }
  };
  
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => executeNext());
  await Promise.all(workers);
  
  return results;
};

/**
 * Кодирование одного трека
 */
const encodeTrack = async (
  inputPath: string,
  outputPath: string,
  bitrateKbps: number,
  useLibfdk: boolean,
  threads: number,
  logPath: string,
  onProgress?: (percent: number) => void,
): Promise<void> => {
  // Сначала получаем длительность файла для расчета прогресса
  const trackDuration = await probeDuration(inputPath);
  
  return new Promise<void>((resolve, reject) => {
    const command = createFfmpegCommand()
      .input(inputPath)
      .noVideo();

    // Настройка потоков для кодирования
    if (threads > 0) {
      command.outputOptions(['-threads', String(threads)]);
    }

    if (useLibfdk) {
      command.audioCodec('libfdk_aac').audioQuality(3);
    } else {
      command.audioCodec('aac').audioBitrate(`${bitrateKbps}k`);
    }

    const removeCommand = () => {
      const index = currentCommands.indexOf(command);
      if (index > -1) {
        currentCommands.splice(index, 1);
      }
    };

    command
      .output(outputPath)
      .on('start', (commandLine: string) => {
        fs.appendFileSync(logPath, `Encode track command: ${commandLine}\n`);
        if (onProgress) onProgress(0);
      })
      .on('progress', (progress: any) => {
        if (onProgress && progress.timemark && trackDuration > 0) {
          // Парсим timemark (формат: HH:MM:SS.MS)
          const parts = progress.timemark.split(':');
          if (parts.length === 3) {
            const hours = parseFloat(parts[0]);
            const minutes = parseFloat(parts[1]);
            const seconds = parseFloat(parts[2]);
            const currentMs = Math.round(((hours * 60 + minutes) * 60 + seconds) * 1000);
            const percent = Math.min(99, Math.round((currentMs / trackDuration) * 100));
            onProgress(percent);
          }
        }
      })
      .on('error', (err: Error) => {
        fs.appendFileSync(logPath, `Encode track error: ${err.message}\n`);
        removeCommand();
        reject(err);
      })
      .on('end', () => {
        removeCommand();
        if (onProgress) onProgress(100);
        resolve();
      });

    currentCommands.push(command);
    command.run();
  });
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
  const settings = getSettings();
  const tempRoot = options.tempDir || path.join(getDefaultTempDir(), String(Date.now()));
  await ensureDir(tempRoot);
  const encodedTracksDir = path.join(tempRoot, 'encoded');
  await ensureDir(encodedTracksDir);
  const concatListPath = path.join(tempRoot, 'list.txt');
  const metadataPath = path.join(tempRoot, 'ffmetadata.txt');
  const mergedPath = path.join(tempRoot, 'merged.m4a');
  const logPath = path.join(tempRoot, 'ffmpeg.log');
  
  await writeMetadataFile(metadata, chapters, metadataPath);

  const useLibfdk = await detectLibfdk();
  
  // Определяем количество параллельных процессов FFmpeg
  // 0 = авто (используем все доступные ядра)
  const concurrency = settings.ffmpegThreads || os.cpus().length;
  
  // Распределяем потоки между параллельными процессами
  // Например: 8 ядер, 4 трека параллельно = 2 потока на процесс
  const threadsPerProcess = Math.max(1, Math.floor(os.cpus().length / Math.min(concurrency, tracks.length)));
  
  console.log(`[FFmpeg] Building with ${concurrency} parallel processes, ${threadsPerProcess} threads per process`);

  try {
    // Этап 1: Параллельное кодирование треков
    const totalSteps = 3;
    onProgress({ 
      phase: 'encode', 
      message: `Параллельное кодирование треков (${concurrency} одновременно)`, 
      percent: 0,
      currentStep: 1,
      totalSteps
    });

    // Отслеживаем прогресс каждого трека (0-100 для каждого)
    const trackProgress: number[] = new Array(tracks.length).fill(0);
    let completedTracks = 0;
    let lastProgressUpdate = 0;
    
    const updateProgress = () => {
      // Троттлинг: обновляем не чаще чем раз в 200мс
      const now = Date.now();
      if (now - lastProgressUpdate < 200) {
        return;
      }
      lastProgressUpdate = now;
      
      // Вычисляем общий прогресс: сумма прогресса всех треков
      const totalProgress = trackProgress.reduce((sum, progress) => sum + progress, 0);
      const averageProgress = totalProgress / tracks.length;
      // Масштабируем на 40% от общего процесса (этап 1 занимает 0-40%)
      const percent = Math.round(averageProgress * 0.4);
      
      const inProgress = tracks.length - completedTracks;
      const message = completedTracks === 0
        ? `Кодирование треков: ${inProgress} в процессе`
        : `Кодирование: ${completedTracks}/${tracks.length} завершено${inProgress > 0 ? `, ${inProgress} в процессе` : ''}`;
      
      onProgress({
        phase: 'encode',
        percent,
        message,
        currentStep: 1,
        totalSteps
      });
    };
    
    const forceUpdateProgress = () => {
      lastProgressUpdate = 0;
      updateProgress();
    };

    const encodedPaths = await processInParallel(
      tracks,
      concurrency,
      async (track, index) => {
        if (cancelRequested) {
          throw new Error('Build cancelled');
        }
        
        const outputPath = path.join(encodedTracksDir, `track_${String(index).padStart(4, '0')}.m4a`);
        
        await encodeTrack(
          track.path,
          outputPath,
          options.bitrateKbps,
          useLibfdk,
          threadsPerProcess,
          logPath,
          (progress: number) => {
            // Обновляем прогресс конкретного трека (0-100)
            trackProgress[index] = progress;
            updateProgress();
          }
        );
        
        // Трек завершён
        trackProgress[index] = 100;
        completedTracks++;
        forceUpdateProgress(); // Принудительное обновление при завершении
        
        return outputPath;
      }
    );

    if (cancelRequested) {
      throw new Error('Build cancelled');
    }

    // Этап 2: Объединение закодированных треков
    onProgress({ 
      phase: 'encode', 
      message: 'Объединение закодированных треков', 
      percent: 45,
      currentStep: 2,
      totalSteps
    });

    await writeConcatList(encodedPaths, concatListPath);

    await new Promise<void>((resolve, reject) => {
      const command = createFfmpegCommand()
        .input(concatListPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .noVideo()
        .audioCodec('copy') // Без перекодирования, просто объединяем
        .output(mergedPath)
        .on('start', (commandLine: string) => {
          fs.appendFileSync(logPath, `Merge command: ${commandLine}\n`);
        })
        .on('progress', () => {
          onProgress({ 
            phase: 'encode', 
            percent: 47,
            message: 'Объединение треков',
            currentStep: 2,
            totalSteps
          });
        })
        .on('error', (err: Error) => {
          fs.appendFileSync(logPath, `Merge error: ${err.message}\n`);
          reject(err);
        })
        .on('end', () => {
          fs.appendFileSync(logPath, 'Merge complete\n');
          resolve();
        });

      currentCommands.push(command);
      command.run();
    });

    if (cancelRequested) {
      throw new Error('Build cancelled');
    }

    // Этап 3: Добавление метаданных и обложки
    onProgress({ 
      phase: 'finalize', 
      message: 'Добавление метаданных, глав и обложки', 
      percent: 50,
      currentStep: 3,
      totalSteps
    });

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
          onProgress({ 
            phase: 'finalize', 
            message: 'Запись финального файла', 
            percent: 80,
            currentStep: 3,
            totalSteps
          });
        })
        .on('error', (err: Error) => {
          fs.appendFileSync(logPath, `Finalize error: ${err.message}\n`);
          reject(err);
        })
        .on('end', () => {
          fs.appendFileSync(logPath, 'Finalize complete\n');
          resolve();
        });

      currentCommands.push(command);
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
    
    onProgress({ 
      phase: 'finalize', 
      message: 'Аудиокнига успешно создана', 
      percent: 100,
      currentStep: 3,
      totalSteps
    });
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
    currentCommands = [];
    cancelRequested = false;
  }
};
