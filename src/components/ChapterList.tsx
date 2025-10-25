import React, { useState, useEffect } from 'react';
import type { Chapter } from '../types';
import { useAppContext } from '../context/AppContext';

interface ChapterRowProps {
  chapter: Chapter;
  index: number;
  onUpdate: (index: number, title: string) => void;
}

const ChapterRow: React.FC<ChapterRowProps> = ({ chapter, index, onUpdate }) => {
  const [title, setTitle] = useState(chapter.title);

  useEffect(() => {
    setTitle(chapter.title);
  }, [chapter.title]);

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number): string => value.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate(index, newTitle);
  };

  return (
    <div className="chapter-row">
      <input
        type="text"
        value={title}
        onChange={handleChange}
      />
      <span className="chapter-timing">
        {formatDuration(chapter.startMs)} – {formatDuration(chapter.endMs)}
      </span>
    </div>
  );
};

export const ChapterList: React.FC = () => {
  const { chapters, setChapters } = useAppContext();
  const [pendingUpdate, setPendingUpdate] = useState<NodeJS.Timeout | null>(null);

  const scheduleUpdate = (updatedChapters: Chapter[]) => {
    if (pendingUpdate) {
      clearTimeout(pendingUpdate);
    }
    const timeout = setTimeout(async () => {
      await window.audioPie.chapters.update(updatedChapters);
      setPendingUpdate(null);
    }, 200);
    setPendingUpdate(timeout);
  };

  const handleUpdate = (index: number, title: string) => {
    const updatedChapters = [...chapters];
    updatedChapters[index] = { ...updatedChapters[index], title };
    setChapters(updatedChapters);
    scheduleUpdate(updatedChapters);
  };

  if (chapters.length === 0) {
    return (
      <div className="chapter-list">
        <p className="empty">No chapters yet. Generate them from tracks.</p>
      </div>
    );
  }

  return (
    <div className="chapter-list">
      {chapters.map((chapter, index) => (
        <ChapterRow
          key={`${chapter.title}-${index}`}
          chapter={chapter}
          index={index}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
};

