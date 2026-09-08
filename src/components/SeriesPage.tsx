import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sortable from 'sortablejs';
import { BookOpen, GripVertical, Plus, FilePlus, FileInput, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { BookMetadata, SeriesMetadata } from '../types';

interface BookRowProps {
  bookId: string;
  metadata: BookMetadata;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}

const BookRow: React.FC<BookRowProps> = ({ bookId, metadata, index, onEdit, onRemove }) => {
  const { t } = useTranslation();
  const { updateBookSeriesIndex } = useAppContext();
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);
  const [seriesIndexValue, setSeriesIndexValue] = useState<string>(
    metadata.seriesIndex !== undefined ? String(metadata.seriesIndex) : '',
  );

  useEffect(() => {
    setSeriesIndexValue(metadata.seriesIndex !== undefined ? String(metadata.seriesIndex) : '');
  }, [metadata.seriesIndex]);

  useEffect(() => {
    let cancelled = false;
    if (!metadata.coverPath) {
      setCoverDataUrl(null);
      return;
    }
    window.audioPie.metadata.getCoverDataUrl(metadata.coverPath).then((dataUrl) => {
      if (!cancelled) setCoverDataUrl(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [metadata.coverPath]);

  const handleSeriesIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSeriesIndexValue(value);
    const parsed = value === '' ? undefined : Number(value);
    updateBookSeriesIndex(bookId, Number.isFinite(parsed) ? parsed : undefined);
  };

  return (
    <div data-book-id={bookId} className="series-book-row">
      <GripVertical className="drag-handle series-book-row__drag-handle" />
      <div className="series-book-row__order">{index + 1}</div>
      <div className="series-book-row__cover">
        {coverDataUrl ? (
          <img src={coverDataUrl} alt={metadata.title} className="series-book-row__cover-image" />
        ) : (
          <div className="series-book-row__cover-placeholder">
            <BookOpen className="series-book-row__cover-placeholder-icon" />
          </div>
        )}
      </div>
      <button type="button" className="series-book-row__body" onClick={onEdit}>
        <span className="series-book-row__title">{metadata.title || t('common.untitledAudiobook')}</span>
        {metadata.author && <span className="series-book-row__author">{metadata.author}</span>}
      </button>
      <div className="series-book-row__series-index">
        <Label htmlFor={`series-index-${bookId}`} className="series-book-row__series-index-label">
          {t('series.numberShort')}
        </Label>
        <Input
          id={`series-index-${bookId}`}
          type="number"
          value={seriesIndexValue}
          onChange={handleSeriesIndexChange}
          onClick={(e) => e.stopPropagation()}
          className="series-book-row__series-index-input"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="series-book-row__remove-button"
        title={t('series.removeFromSeries')}
        onClick={onRemove}
      >
        <Trash2 className="series-book-row__remove-icon" />
      </Button>
    </div>
  );
};

interface SeriesPageProps {
  onEditBook: () => void;
}

export const SeriesPage: React.FC<SeriesPageProps> = ({ onEditBook }) => {
  const { t } = useTranslation();
  const {
    seriesMetadata,
    books,
    bookOrder,
    updateSeriesMetadata,
    addBookToSeries,
    importBookFromFile,
    removeBookFromSeries,
    reorderBooks,
    extractBook,
    switchActiveBook,
  } = useAppContext();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [bookPendingRemoval, setBookPendingRemoval] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);

  const orderedBooks = bookOrder
    .map((id) => books.find((book) => book.id === id))
    .filter((book): book is { id: string; metadata: BookMetadata } => Boolean(book));

  useEffect(() => {
    if (!listRef.current || orderedBooks.length === 0) {
      return;
    }
    sortableRef.current = Sortable.create(listRef.current, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: async (event) => {
        if (event.oldIndex === undefined || event.newIndex === undefined || !listRef.current) {
          return;
        }
        const items = Array.from(listRef.current.querySelectorAll('[data-book-id]'));
        const newOrder = items.map((item) => (item as HTMLElement).dataset.bookId as string);
        await reorderBooks(newOrder);
      },
    });
    return () => {
      sortableRef.current?.destroy();
      sortableRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedBooks.length === 0]);

  const handleSeriesFieldChange = (key: keyof SeriesMetadata, value: string) => {
    updateSeriesMetadata({ [key]: value || undefined } as Partial<SeriesMetadata>);
  };

  const handleCreateNewBook = async () => {
    setIsAddMenuOpen(false);
    await addBookToSeries();
    onEditBook();
  };

  const handleImportBook = async () => {
    setIsAddMenuOpen(false);
    await importBookFromFile();
  };

  const handleEditBook = async (bookId: string) => {
    await switchActiveBook(bookId);
    onEditBook();
  };

  const handleExtractThenRemove = async () => {
    if (!bookPendingRemoval) return;
    const extracted = await extractBook(bookPendingRemoval);
    if (extracted) {
      await removeBookFromSeries(bookPendingRemoval);
    }
    setBookPendingRemoval(null);
  };

  const handleRemoveOnly = async () => {
    if (!bookPendingRemoval) return;
    await removeBookFromSeries(bookPendingRemoval);
    setBookPendingRemoval(null);
  };

  return (
    <div className="series-page">
      <div className="series-page__column series-page__column--metadata">
        <h2 className="series-page__section-title">{t('series.metadataTitle')}</h2>
        <div className="series-page__field">
          <Label htmlFor="series-title">{t('series.title')}</Label>
          <Input
            id="series-title"
            value={seriesMetadata?.title ?? ''}
            onChange={(e) => handleSeriesFieldChange('title', e.target.value)}
            placeholder={t('series.titlePlaceholder')}
          />
        </div>
        <div className="series-page__field">
          <Label htmlFor="series-author">{t('series.author')}</Label>
          <Input
            id="series-author"
            value={seriesMetadata?.author ?? ''}
            onChange={(e) => handleSeriesFieldChange('author', e.target.value)}
          />
        </div>
        <div className="series-page__field">
          <Label htmlFor="series-narrator">{t('series.narrator')}</Label>
          <Input
            id="series-narrator"
            value={seriesMetadata?.narrator ?? ''}
            onChange={(e) => handleSeriesFieldChange('narrator', e.target.value)}
          />
        </div>
        <div className="series-page__field">
          <Label htmlFor="series-description">{t('series.description')}</Label>
          <Textarea
            id="series-description"
            value={seriesMetadata?.description ?? ''}
            onChange={(e) => handleSeriesFieldChange('description', e.target.value)}
          />
        </div>
      </div>

      <div className="series-page__column series-page__column--books">
        <h2 className="series-page__section-title">
          {t('series.booksTitle', { count: orderedBooks.length })}
        </h2>
        <ScrollArea className="series-page__books-scroll">
          {orderedBooks.length === 0 ? (
            <div className="series-page__empty">
              <BookOpen className="series-page__empty-icon" />
              <p className="series-page__empty-text">{t('series.noBooks')}</p>
            </div>
          ) : (
            <div className="series-page__books-list" ref={listRef}>
              {orderedBooks.map((book, index) => (
                <BookRow
                  key={book.id}
                  bookId={book.id}
                  metadata={book.metadata}
                  index={index}
                  onEdit={() => handleEditBook(book.id)}
                  onRemove={() => setBookPendingRemoval(book.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="series-page__fab-stack">
        {isAddMenuOpen && (
          <div className="series-page__add-menu">
            <Button variant="outline" onClick={handleCreateNewBook} className="series-page__add-menu-item">
              <FilePlus className="h-4 w-4" />
              {t('series.createNewBook')}
            </Button>
            <Button variant="outline" onClick={handleImportBook} className="series-page__add-menu-item">
              <FileInput className="h-4 w-4" />
              {t('series.importBook')}
            </Button>
          </div>
        )}
        <Button size="icon-xl" onClick={() => setIsAddMenuOpen((prev) => !prev)} aria-label={t('series.addBook')}>
          <Plus className="size-8" />
        </Button>
      </div>

      <Dialog open={bookPendingRemoval !== null} onOpenChange={(open) => !open && setBookPendingRemoval(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('series.removeConfirmTitle')}</DialogTitle>
            <DialogDescription>{t('series.removeConfirmDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookPendingRemoval(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="outline" onClick={handleExtractThenRemove}>
              {t('series.extractAndRemove')}
            </Button>
            <Button variant="destructive" onClick={handleRemoveOnly}>
              {t('series.removeOnly')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
