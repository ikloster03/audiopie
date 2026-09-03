import type { Chapter, TrackInfo } from '../types';

export const isValidChapterTimeRange = (startMs: number, endMs: number): boolean => {
  return Number.isFinite(startMs) && Number.isFinite(endMs) && startMs < endMs;
};

export const formatHoursMinutes = (ms: number): { hours: number; minutes: number } => {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
};

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number): string => value.toString().padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

export const parseDuration = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2 || parts.length > 3) {
    return null;
  }
  const numbers = parts.map((part) => Number(part));
  if (numbers.some((n) => !Number.isFinite(n) || n < 0 || !Number.isInteger(n))) {
    return null;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = numbers;
    if (seconds >= 60) {
      return null;
    }
    return (minutes * 60 + seconds) * 1000;
  }
  const [hours, minutes, seconds] = numbers;
  if (minutes >= 60 || seconds >= 60) {
    return null;
  }
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

export const applyChapterTime = (chapter: Chapter, startMs: number, endMs: number): Chapter | null => {
  if (!isValidChapterTimeRange(startMs, endMs)) {
    return null;
  }
  return { ...chapter, startMs, endMs };
};

export const renameChaptersByTemplate = (chapters: Chapter[], template: string): Chapter[] => {
  return chapters.map((chapter, index) => ({
    ...chapter,
    title: template.replace(/\{n\}/g, String(index + 1)),
  }));
};

export const applyTimeRangesFromTracks = (chapters: Chapter[], tracks: TrackInfo[]): Chapter[] => {
  let cursor = 0;
  return tracks.map((track, index) => {
    const startMs = cursor;
    const endMs = cursor + (track.durationMs || 0);
    cursor = endMs;
    return {
      title: chapters[index]?.title ?? track.displayTitle,
      startMs,
      endMs,
    };
  });
};

export const reorderChaptersAndTracks = (
  tracks: TrackInfo[],
  chapters: Chapter[],
  newOrder: number[],
): { tracks: TrackInfo[]; chapters: Chapter[] } => {
  const reorderedTracks = newOrder
    .map((index) => tracks[index])
    .filter((track): track is TrackInfo => Boolean(track));
  const reorderedChapters = newOrder
    .map((index) => chapters[index])
    .filter((chapter): chapter is Chapter => Boolean(chapter));

  return {
    tracks: reorderedTracks,
    chapters: applyTimeRangesFromTracks(reorderedChapters, reorderedTracks),
  };
};

export const appendChaptersForTracks = (existing: Chapter[], added: TrackInfo[]): Chapter[] => {
  let cursor = existing.length > 0 ? existing[existing.length - 1].endMs : 0;
  const appended = added.map((track) => {
    const startMs = cursor;
    const endMs = cursor + (track.durationMs || 0);
    cursor = endMs;
    return {
      title: track.displayTitle,
      startMs,
      endMs,
    };
  });
  return [...existing, ...appended];
};
