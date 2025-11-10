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
    <div className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:border-primary/50 hover:shadow-md transition-all">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
        {index + 1}
      </div>
      <Input
        type="text"
        value={title}
        onChange={handleChange}
        className="flex-1 h-9 text-sm"
      />
      <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
        <Clock className="h-3 w-3" />
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
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end mb-4">
          <Button onClick={handleGenerateChapters} size="sm" variant="outline">
            <Sparkles className="h-4 w-4" />
            {t('chapters.generate')}
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/20 p-8">
          <div className="text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground font-medium mb-1">
              {t('chapters.noChapters')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('chapters.generateDesc')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {t('chapters.count', { count: chapters.length })}
        </p>
        <Button onClick={handleGenerateChapters} size="sm" variant="outline">
          <Sparkles className="h-4 w-4" />
          {t('chapters.regenerate')}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2">
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
