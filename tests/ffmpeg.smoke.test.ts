import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from '@ffprobe-installer/ffprobe';
import ffmpeg from 'fluent-ffmpeg';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'audiopie-test-' + Date.now());
const TEST_MP3 = path.join(TEST_DIR, 'test.mp3');
const TEST_M4A = path.join(TEST_DIR, 'test.m4a');
const TEST_OUTPUT = path.join(TEST_DIR, 'output.m4b');

describe('FFmpeg Smoke E2E Tests', () => {
  beforeAll(async () => {
    // Set up FFmpeg and FFprobe paths
    if (ffmpegStatic) {
      ffmpeg.setFfmpegPath(ffmpegStatic);
    }
    if (ffprobeStatic.path) {
      ffmpeg.setFfprobePath(ffprobeStatic.path);
    }

    // Create test directory
    await fs.promises.mkdir(TEST_DIR, { recursive: true });

    // Generate a 3-second silent MP3 test file
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input('anullsrc=r=44100:cl=stereo')
        .inputFormat('lavfi')
        .duration(3)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .output(TEST_MP3)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      await fs.promises.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should have ffmpeg-static available', () => {
    expect(ffmpegStatic).toBeTruthy();
    expect(fs.existsSync(ffmpegStatic as string)).toBe(true);
  });

  it('should probe audio file duration', async () => {
    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(TEST_MP3, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        const duration = metadata?.format?.duration;
        if (!duration || Number.isNaN(duration)) {
          reject(new Error('Unable to parse duration'));
          return;
        }
        resolve(Math.round(duration * 1000));
      });
    });

    // Should be approximately 3 seconds (3000ms), allow some tolerance
    expect(duration).toBeGreaterThan(2500);
    expect(duration).toBeLessThan(3500);
  });

  it('should encode MP3 to M4A (AAC)', async () => {
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(TEST_MP3)
        .noVideo()
        .audioCodec('aac')
        .audioBitrate('128k')
        .output(TEST_M4A)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    // Verify output file exists and has content
    const stat = await fs.promises.stat(TEST_M4A);
    expect(stat.size).toBeGreaterThan(0);
  });

  it('should create M4B with chapters metadata', async () => {
    // Create metadata file with chapters (FFMETADATA format)
    const metadataPath = path.join(TEST_DIR, 'metadata.txt');
    const metadataContent = `;FFMETADATA1
title=Test Audiobook
artist=Test Author

[CHAPTER]
TIMEBASE=1/1000
START=0
END=1500
title=Chapter 1

[CHAPTER]
TIMEBASE=1/1000
START=1500
END=3000
title=Chapter 2
`;
    await fs.promises.writeFile(metadataPath, metadataContent, 'utf-8');

    // Create M4B with metadata (explicitly specify ffmetadata format)
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg()
        .input(TEST_M4A);

      // Add metadata file with explicit format specification
      command.input(metadataPath);
      command.inputOptions('-f ffmetadata');

      command
        .outputOptions([
          '-map', '0:a',
          '-map_chapters', '1',
          '-map_metadata', '1',
          '-c:a', 'copy',
          '-movflags', '+faststart',
        ])
        .output(TEST_OUTPUT)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err));

      command.run();
    });

    // Verify output file exists and has content
    const stat = await fs.promises.stat(TEST_OUTPUT);
    expect(stat.size).toBeGreaterThan(0);

    // Verify metadata was applied by probing the output using ffprobe directly
    // (fluent-ffmpeg's ffprobe wrapper doesn't include chapters by default)
    const ffprobeOutput = execSync(
      `"${ffprobeStatic.path}" -v quiet -print_format json -show_format -show_chapters "${TEST_OUTPUT}"`,
      { encoding: 'utf-8' }
    );
    const metadata = JSON.parse(ffprobeOutput);

    expect(metadata.format.tags?.title).toBe('Test Audiobook');
    expect(metadata.format.tags?.artist).toBe('Test Author');

    // Verify chapters exist
    expect(metadata.chapters).toBeDefined();
    expect(metadata.chapters.length).toBe(2);
    expect(metadata.chapters[0].tags?.title).toBe('Chapter 1');
    expect(metadata.chapters[1].tags?.title).toBe('Chapter 2');
  });

  it('should detect available codecs', async () => {
    const codecs = await new Promise<Record<string, any>>((resolve, reject) => {
      ffmpeg().getAvailableCodecs((err: Error | null, codecs: Record<string, any>) => {
        if (err) reject(err);
        else resolve(codecs);
      });
    });

    // AAC codec should be available (required for M4B)
    expect(codecs['aac']).toBeDefined();
    expect(codecs['libmp3lame'] || codecs['mp3']).toBeDefined();
  });
});
