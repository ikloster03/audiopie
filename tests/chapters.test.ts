import { describe, expect, it } from 'vitest';
import type { Chapter, TrackInfo } from '../src/types';
import {
  applyChapterTime,
  applyTimeRangesFromTracks,
  formatDuration,
  formatHoursMinutes,
  isValidChapterTimeRange,
  parseDuration,
  renameChaptersByTemplate,
  reorderChaptersAndTracks,
} from '../src/lib/chapters';

const track = (id: string, durationMs: number): TrackInfo => ({
  path: `/audio/${id}.mp3`,
  displayTitle: id,
  durationMs,
});

const chapter = (title: string, startMs: number, endMs: number): Chapter => ({
  title,
  startMs,
  endMs,
});

describe('chapter reordering', () => {
  it('reorders tracks and chapters together and keeps titles', () => {
    const tracks = [track('A', 10_000), track('B', 20_000), track('C', 30_000)];
    const chapters = [
      chapter('Intro', 0, 10_000),
      chapter('Middle', 10_000, 30_000),
      chapter('Finale', 30_000, 60_000),
    ];

    const result = reorderChaptersAndTracks(tracks, chapters, [2, 0, 1]);

    expect(result.tracks.map((item) => item.displayTitle)).toEqual(['C', 'A', 'B']);
    expect(result.chapters.map((item) => item.title)).toEqual(['Finale', 'Intro', 'Middle']);
  });

  it('recomputes contiguous chapter markers from the new track order for the build pipeline', () => {
    const tracks = [track('A', 10_000), track('B', 20_000), track('C', 30_000)];
    const chapters = [
      chapter('Intro', 0, 10_000),
      chapter('Middle', 10_000, 30_000),
      chapter('Finale', 30_000, 60_000),
    ];

    const result = reorderChaptersAndTracks(tracks, chapters, [2, 0, 1]);

    expect(result.chapters).toEqual([
      chapter('Finale', 0, 30_000),
      chapter('Intro', 30_000, 40_000),
      chapter('Middle', 40_000, 60_000),
    ]);

    let cursor = 0;
    result.tracks.forEach((item, index) => {
      expect(result.chapters[index].startMs).toBe(cursor);
      expect(result.chapters[index].endMs).toBe(cursor + item.durationMs);
      cursor += item.durationMs;
    });
    expect(cursor).toBe(60_000);
  });

  it('falls back to track titles when a chapter is missing at an index', () => {
    const tracks = [track('A', 5_000), track('B', 5_000)];
    const result = reorderChaptersAndTracks(tracks, [], [1, 0]);

    expect(result.chapters.map((item) => item.title)).toEqual(['B', 'A']);
    expect(result.chapters.map((item) => [item.startMs, item.endMs])).toEqual([
      [0, 5_000],
      [5_000, 10_000],
    ]);
  });
});

describe('rename chapters by template', () => {
  const chapters = [
    chapter('Old A', 0, 1_000),
    chapter('Old B', 1_000, 2_000),
    chapter('Old C', 2_000, 3_000),
  ];

  it('substitutes 1-based {n} for every chapter', () => {
    expect(renameChaptersByTemplate(chapters, 'Chapter {n}')).toEqual([
      chapter('Chapter 1', 0, 1_000),
      chapter('Chapter 2', 1_000, 2_000),
      chapter('Chapter 3', 2_000, 3_000),
    ]);
  });

  it('replaces every {n} occurrence in the template', () => {
    expect(renameChaptersByTemplate(chapters, '{n} — Part {n}')[0].title).toBe('1 — Part 1');
  });

  it('applies the literal template when {n} is absent', () => {
    expect(renameChaptersByTemplate(chapters, 'Interlude').map((item) => item.title)).toEqual([
      'Interlude',
      'Interlude',
      'Interlude',
    ]);
  });
});

describe('chapter time range validation', () => {
  it('accepts start < end', () => {
    expect(isValidChapterTimeRange(0, 1_000)).toBe(true);
    expect(applyChapterTime(chapter('A', 0, 5_000), 1_000, 4_000)).toEqual(chapter('A', 1_000, 4_000));
  });

  it('rejects start >= end and keeps the previous chapter', () => {
    const original = chapter('A', 0, 5_000);
    expect(isValidChapterTimeRange(5_000, 5_000)).toBe(false);
    expect(isValidChapterTimeRange(6_000, 5_000)).toBe(false);
    expect(applyChapterTime(original, 6_000, 5_000)).toBeNull();
    expect(applyChapterTime(original, 5_000, 5_000)).toBeNull();
  });
});

describe('duration parsing', () => {
  it('formats and parses mm:ss and hh:mm:ss', () => {
    expect(formatDuration(90_000)).toBe('01:30');
    expect(formatDuration(3_661_000)).toBe('01:01:01');
    expect(parseDuration('01:30')).toBe(90_000);
    expect(parseDuration('1:01:01')).toBe(3_661_000);
  });

  it('rejects invalid duration strings', () => {
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('01:80')).toBeNull();
    expect(parseDuration('1:80:00')).toBeNull();
  });
});

describe('formatHoursMinutes', () => {
  it('converts milliseconds to hours and minutes', () => {
    expect(formatHoursMinutes(15 * 3_600_000 + 54 * 60_000)).toEqual({ hours: 15, minutes: 54 });
    expect(formatHoursMinutes(90_000)).toEqual({ hours: 0, minutes: 2 });
    expect(formatHoursMinutes(0)).toEqual({ hours: 0, minutes: 0 });
  });
});

describe('applyTimeRangesFromTracks', () => {
  it('rebuilds contiguous ranges while preserving titles', () => {
    const tracks = [track('A', 2_000), track('B', 3_000)];
    const chapters = [chapter('Keep me', 99, 100), chapter('And me', 1, 2)];
    expect(applyTimeRangesFromTracks(chapters, tracks)).toEqual([
      chapter('Keep me', 0, 2_000),
      chapter('And me', 2_000, 5_000),
    ]);
  });
});
