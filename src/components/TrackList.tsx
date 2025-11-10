import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sortable from 'sortablejs';
import type { TrackInfo } from '../types';
import { useAppContext } from '../context/AppContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { GripVertical, X, Clock } from 'lucide-react';

interface TrackItemProps {
  track: TrackInfo;
  index: number;
  onUpdateTitle: (index: number, title: string) => void;
  onRemove: (index: number) => void;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, index, onUpdateTitle, onRemove }) => {
  const { t } = useTranslation();
  
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

  return (
    <div 
      data-index={index}
      className="group flex items-center gap-2 p-3 bg-card border rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
    >
      <GripVertical className="drag-handle h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary transition-colors" />
      <Input
        type="text"
        value={track.displayTitle}
        className="flex-1 h-9 text-sm"
        onChange={(e) => onUpdateTitle(index, e.target.value)}
      />
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatDuration(track.durationMs)}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
        title={t('tracks.removeTrack')}
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const TrackList: React.FC = () => {
  const { tracks, setTracks, setChapters } = useAppContext();
  const listRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  useEffect(() => {
    if (listRef.current && !sortableRef.current) {
      sortableRef.current = Sortable.create(listRef.current, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: async (event) => {
          if (event.oldIndex === undefined || event.newIndex === undefined) {
            return;
          }
          const items = Array.from(listRef.current!.querySelectorAll('[data-index]'));
          const newOrder = items.map((item) => Number((item as HTMLElement).dataset.index));
          await window.audioPie.tracks.reorder(newOrder);
          const newTracks = newOrder.map((idx) => tracks[idx]);
          setTracks(newTracks);
          await refreshChapters();
        }
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, []);

  const refreshChapters = async () => {
    const chapters = await window.audioPie.chapters.autoFromTracks();
    setChapters(chapters);
  };

  const handleUpdateTitle = async (index: number, newTitle: string) => {
    const title = newTitle.trim() || tracks[index].displayTitle;
    await window.audioPie.tracks.updateTitle(index, title);
    const updatedTracks = [...tracks];
    updatedTracks[index] = { ...updatedTracks[index], displayTitle: title };
    setTracks(updatedTracks);
    await refreshChapters();
  };

  const handleRemove = async (index: number) => {
    await window.audioPie.tracks.remove([index]);
    const updatedTracks = tracks.filter((_, i) => i !== index);
    setTracks(updatedTracks);
    await refreshChapters();
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2" ref={listRef}>
        {tracks.map((track, index) => (
          <TrackItem
            key={`${track.path}-${index}`}
            track={track}
            index={index}
            onUpdateTitle={handleUpdateTitle}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
