import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sortable from 'sortablejs';
import { BookOpen, Clock, GripVertical, Plus, Sparkles, Type, X } from 'lucide-react';
import type { Chapter } from '../types';
import { useAppContext } from '../context/AppContext';
import { formatDuration, formatHoursMinutes } from '../lib/chapters';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip } from './ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ChapterRowProps {
  chapter: Chapter;
  index: number;
  durationMs: number;
  onUpdateTitle: (index: number, title: string) => void;
  onRemove: (index: number) => void;
}

const ChapterRow: React.FC<ChapterRowProps> = ({
  chapter,
  index,
  durationMs,
  onUpdateTitle,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(chapter.title);

  useEffect(() => {
    setTitle(chapter.title);
  }, [chapter.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdateTitle(index, newTitle);
  };

  return (
    <div data-index={index} className="chapter-row">
      <GripVertical className="drag-handle chapter-row__drag-handle" />
      <div className="chapter-row__number">{index + 1}</div>
      <Input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="chapter-row__input"
        aria-label={t('chapters.title')}
      />
      <Badge variant="secondary" className="chapter-row__duration" aria-label={t('chapters.duration')}>
        <Clock className="chapter-row__duration-icon" />
        {formatDuration(durationMs)}
      </Badge>
      <span className="chapter-row__range" aria-label={`${t('chapters.startTime')} – ${t('chapters.endTime')}`}>
        {formatDuration(chapter.startMs)} – {formatDuration(chapter.endMs)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="chapter-row__remove-button"
        title={t('chapters.removeSource')}
        onClick={() => onRemove(index)}
      >
        <X className="chapter-row__remove-icon" />
      </Button>
    </div>
  );
};

const UNTITLED_EN = 'Untitled Audiobook';

export const ChapterList: React.FC = () => {
  const { t } = useTranslation();
  const { chapters, setChapters, tracks, setTracks, addTracksFromPaths, removeTrackAt, metadata } = useAppContext();
  const [pendingUpdate, setPendingUpdate] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTemplate, setRenameTemplate] = useState('');
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  useEffect(() => {
    return () => {
      if (pendingUpdate) {
        clearTimeout(pendingUpdate);
      }
    };
  }, [pendingUpdate]);

  useEffect(() => {
    let cancelled = false;

    const loadCover = async () => {
      if (!metadata.coverPath) {
        setCoverDataUrl(null);
        return;
      }

      setCoverDataUrl(null);
      try {
        const dataUrl = await window.audioPie.metadata.getCoverDataUrl(metadata.coverPath);
        if (!cancelled) {
          setCoverDataUrl(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setCoverDataUrl(null);
        }
      }
    };

    loadCover();
    return () => {
      cancelled = true;
    };
  }, [metadata.coverPath]);

  useEffect(() => {
    if (!listRef.current || chapters.length === 0) {
      return;
    }

    sortableRef.current = Sortable.create(listRef.current, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: async (event) => {
        if (event.oldIndex === undefined || event.newIndex === undefined || !listRef.current) {
          return;
        }
        const items = Array.from(listRef.current.querySelectorAll('[data-index]'));
        const newOrder = items.map((item) => Number((item as HTMLElement).dataset.index));
        const result = await window.audioPie.chapters.reorder(newOrder);
        setChapters(result.chapters);
        setTracks(result.tracks);
      },
    });

    return () => {
      sortableRef.current?.destroy();
      sortableRef.current = null;
    };
  }, [chapters.length === 0, setChapters, setTracks]);

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

  const handleUpdateTitle = (index: number, title: string) => {
    const updatedChapters = [...chapters];
    updatedChapters[index] = { ...updatedChapters[index], title };
    setChapters(updatedChapters);
    scheduleUpdate(updatedChapters);
  };

  const handleGenerateChapters = async () => {
    const generated = await window.audioPie.chapters.autoFromTracks();
    setChapters(generated);
  };

  const handleAddTracks = async () => {
    const files = await window.audioPie.tracks.selectFiles();
    if (files.length) {
      await addTracksFromPaths(files);
    }
  };

  const handleApplyRename = async () => {
    const updated = await window.audioPie.chapters.renameByTemplate(renameTemplate);
    setChapters(updated);
    setIsRenameOpen(false);
  };

  const openRenameDialog = () => {
    setRenameTemplate(t('chapters.renameTemplateDefault'));
    setIsRenameOpen(true);
  };

  const totalDuration = formatHoursMinutes(
    tracks.reduce((sum, track) => sum + (track.durationMs || 0), 0),
  );

  const untitledLabel = t('common.untitledAudiobook');
  const rawTitle = metadata.title?.trim() ?? '';
  const isUntitledTitle =
    rawTitle === '' || rawTitle === UNTITLED_EN || rawTitle === untitledLabel;
  const displayTitle = isUntitledTitle ? untitledLabel : rawTitle;

  const renderToolbar = (showRename: boolean) => (
    <div className="chapter-list__header">
      <div className="chapter-list__identity">
        <div className="chapter-list__cover">
          {coverDataUrl ? (
            <img
              src={coverDataUrl}
              alt={t('chapters.coverAlt')}
              className="chapter-list__cover-image"
            />
          ) : (
            <div
              className="chapter-list__cover-placeholder"
              role="img"
              aria-label={t('chapters.coverPlaceholder')}
            >
              <BookOpen className="chapter-list__cover-placeholder-icon" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="chapter-list__identity-text">
          <h2
            className={
              isUntitledTitle
                ? 'chapter-list__book-title chapter-list__book-title--placeholder'
                : 'chapter-list__book-title'
            }
            title={displayTitle}
          >
            {displayTitle}
          </h2>
          <div className="chapter-list__meta">
            <p className="chapter-list__count">
              {t('chapters.count', { count: chapters.length })}
            </p>
            <p className="chapter-list__total-duration">
              {t('chapters.totalDuration', totalDuration)}
            </p>
          </div>
        </div>
      </div>
      <div className="chapter-list__actions">
        <Tooltip label={t('chapters.addTracks')} side="bottom">
          <Button
            onClick={handleAddTracks}
            size="icon"
            variant="outline"
            aria-label={t('chapters.addTracks')}
          >
            <Plus />
          </Button>
        </Tooltip>
        {showRename && (
          <Button onClick={openRenameDialog} size="sm" variant="outline">
            <Type className="h-4 w-4" />
            {t('chapters.renameByTemplate')}
          </Button>
        )}
        {tracks.length > 0 && (
          <Button onClick={handleGenerateChapters} size="sm" variant="outline">
            <Sparkles className="h-4 w-4" />
            {chapters.length === 0 ? t('chapters.generate') : t('chapters.regenerate')}
          </Button>
        )}
      </div>
    </div>
  );

  const renameDialog = (
    <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('chapters.renameByTemplateTitle')}</DialogTitle>
          <DialogDescription>{t('chapters.renameByTemplateDesc')}</DialogDescription>
        </DialogHeader>
        <div className="chapter-list__rename-field">
          <Label htmlFor="chapter-rename-template">{t('chapters.renameByTemplatePlaceholder')}</Label>
          <Input
            id="chapter-rename-template"
            value={renameTemplate}
            onChange={(e) => setRenameTemplate(e.target.value)}
            placeholder={t('chapters.renameTemplateDefault')}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleApplyRename}>{t('chapters.renameByTemplateApply')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (tracks.length === 0) {
    return (
      <div className="chapter-list__empty">
        {renderToolbar(false)}
        <div className="chapter-list__empty-content">
          <div className="chapter-list__empty-inner">
            <BookOpen className="chapter-list__empty-icon" />
            <p className="chapter-list__empty-text">{t('chapters.noTracks')}</p>
            <p className="chapter-list__empty-hint">{t('chapters.dragDrop')}</p>
          </div>
        </div>
        {renameDialog}
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="chapter-list__empty">
        {renderToolbar(false)}
        <div className="chapter-list__empty-content">
          <div className="chapter-list__empty-inner">
            <Sparkles className="chapter-list__empty-icon" />
            <p className="chapter-list__empty-text">{t('chapters.noChapters')}</p>
            <p className="chapter-list__empty-hint">{t('chapters.generateDesc')}</p>
          </div>
        </div>
        {renameDialog}
      </div>
    );
  }

  return (
    <div className="chapter-list__container">
      {renderToolbar(true)}
      <ScrollArea className="chapter-list__list">
        <div className="chapter-list__items" ref={listRef}>
          {chapters.map((chapter, index) => (
            <ChapterRow
              key={`${tracks[index]?.path ?? 'chapter'}-${index}`}
              chapter={chapter}
              index={index}
              durationMs={tracks[index]?.durationMs ?? Math.max(0, chapter.endMs - chapter.startMs)}
              onUpdateTitle={handleUpdateTitle}
              onRemove={removeTrackAt}
            />
          ))}
        </div>
      </ScrollArea>
      {renameDialog}
    </div>
  );
};
