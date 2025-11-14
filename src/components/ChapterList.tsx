import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Chapter } from '../types';
import { useAppContext } from '../context/AppContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Sparkles, Clock } from 'lucide-react';

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
      <div className="chapter-row__number">
        {index + 1}
      </div>
      <Input
        type="text"
        value={title}
        onChange={handleChange}
        className="chapter-row__input"
      />
      <Badge variant="secondary" className="chapter-row__duration">
        <Clock className="chapter-row__duration-icon" />
        {formatDuration(chapter.startMs)} – {formatDuration(chapter.endMs)}
      </Badge>
    </div>
  );
};

export const ChapterList: React.FC = () => {
  const { t } = useTranslation();
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

  const handleGenerateChapters = async () => {
    const chapters = await window.audioPie.chapters.autoFromTracks();
    setChapters(chapters);
  };

  if (chapters.length === 0) {
    return (
      <div className="chapter-list__empty">
        <div className="chapter-list__empty-actions">
          <Button onClick={handleGenerateChapters} size="sm" variant="outline">
            <Sparkles className="h-4 w-4" />
            {t('chapters.generate')}
          </Button>
        </div>
        <div className="chapter-list__empty-content">
          <div className="chapter-list__empty-inner">
            <Sparkles className="chapter-list__empty-icon" />
            <p className="chapter-list__empty-text">
              {t('chapters.noChapters')}
            </p>
            <p className="chapter-list__empty-hint">
              {t('chapters.generateDesc')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-list__container">
      <div className="chapter-list__header">
        <p className="chapter-list__count">
          {t('chapters.count', { count: chapters.length })}
        </p>
        <Button onClick={handleGenerateChapters} size="sm" variant="outline">
          <Sparkles className="h-4 w-4" />
          {t('chapters.regenerate')}
        </Button>
      </div>
      <ScrollArea className="chapter-list__list">
        <div className="chapter-list__items">
          {chapters.map((chapter, index) => (
            <ChapterRow
              key={index}
              chapter={chapter}
              index={index}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
