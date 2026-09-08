import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { zipDirectory, unzipToDirectory } from '../electron/main/projectFile';

// Simulates a multi-hour audiobook's worth of "chapter" MP3 files and packs
// them into a ZIP, then unpacks the result — while sampling Node's
// ArrayBuffer/Buffer memory (`process.memoryUsage().arrayBuffers`, which is
// where streamed file bytes actually live) throughout the operation. This
// confirms yazl/yauzl push data through in small chunks (Node stream default
// highWaterMark) rather than buffering a whole file/archive at once, which
// would show up as a multi-megabyte spike matching the payload size.

const CHAPTER_SIZE_BYTES = 8 * 1024 * 1024; // 8MB per synthetic "chapter"
const CHAPTER_COUNT = 6; // ~48MB total synthetic payload
// Two fully-buffered chapters (16MB) would already blow past this — true
// chunked streaming keeps peak buffer memory to a small, size-independent
// pool of in-flight chunks (observed: low single-digit MB even with several
// concurrent file streams), well under the 48MB total payload.
const PEAK_BUFFER_GROWTH_CEILING_BYTES = 16 * 1024 * 1024;

const samplePeakArrayBufferGrowth = async <T>(operation: () => Promise<T>): Promise<{ result: T; peakGrowth: number }> => {
  const baseline = process.memoryUsage().arrayBuffers;
  let peak = baseline;
  const interval = setInterval(() => {
    const current = process.memoryUsage().arrayBuffers;
    if (current > peak) peak = current;
  }, 2);

  try {
    const result = await operation();
    // Catch a final sample in case the operation completed between ticks.
    const current = process.memoryUsage().arrayBuffers;
    if (current > peak) peak = current;
    return { result, peakGrowth: peak - baseline };
  } finally {
    clearInterval(interval);
  }
};

describe('projectFile smoke test: streaming pack/unpack of a large synthetic audiobook', () => {
  let sourceDir: string;
  let extractDir: string;
  let zipPath: string;

  beforeEach(async () => {
    sourceDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-smoke-src-'));
    extractDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'audiopie-smoke-dst-'));
    zipPath = path.join(os.tmpdir(), `audiopie-smoke-${Date.now()}.audiopie`);

    for (let i = 0; i < CHAPTER_COUNT; i += 1) {
      const chunk = Buffer.alloc(CHAPTER_SIZE_BYTES, i % 256);
      await fs.promises.writeFile(path.join(sourceDir, `${i + 1}.mp3`), chunk);
    }
  }, 30000);

  afterEach(async () => {
    await fs.promises.rm(sourceDir, { recursive: true, force: true });
    await fs.promises.rm(extractDir, { recursive: true, force: true });
    await fs.promises.rm(zipPath, { force: true }).catch(() => undefined);
  });

  it('streams file contents while packing instead of buffering whole files/archive', async () => {
    const { peakGrowth } = await samplePeakArrayBufferGrowth(() => zipDirectory(sourceDir, zipPath));

    const stat = await fs.promises.stat(zipPath);
    expect(stat.size).toBeGreaterThan(CHAPTER_SIZE_BYTES * CHAPTER_COUNT * 0.9); // STORE: ~uncompressed size
    expect(peakGrowth).toBeLessThan(PEAK_BUFFER_GROWTH_CEILING_BYTES);
  }, 30000);

  it('streams file contents while unpacking instead of buffering whole files/archive', async () => {
    await zipDirectory(sourceDir, zipPath);

    const { peakGrowth } = await samplePeakArrayBufferGrowth(() => unzipToDirectory(zipPath, extractDir));

    const extractedFiles = await fs.promises.readdir(extractDir);
    expect(extractedFiles).toHaveLength(CHAPTER_COUNT);
    expect(peakGrowth).toBeLessThan(PEAK_BUFFER_GROWTH_CEILING_BYTES);
  }, 30000);
});
