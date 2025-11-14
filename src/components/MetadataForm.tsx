import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { BookMetadata } from '../types';
import { useAppContext } from '../context/AppContext';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { ImagePlus, X, Loader2 } from 'lucide-react';

export const MetadataForm: React.FC = () => {
  const { t } = useTranslation();
  const { metadata, setMetadata } = useAppContext();
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);
  const [isLoadingCover, setIsLoadingCover] = useState(false);

  const metadataFields = [
    { key: 'title' as keyof BookMetadata, label: t('metadata.title'), type: 'text' as const },
    { key: 'author' as keyof BookMetadata, label: t('metadata.author'), type: 'text' as const },
    { key: 'genre' as keyof BookMetadata, label: t('metadata.genre'), type: 'text' as const },
    { key: 'description' as keyof BookMetadata, label: t('metadata.description'), type: 'textarea' as const },
  ];

  const handleChange = (key: keyof BookMetadata, value: string) => {
    let processedValue: string | number | undefined = value;

    if ((key === 'seriesIndex' || key === 'year') && value !== '') {
      processedValue = Number(value);
    }
    if (value === '') {
      processedValue = undefined;
    }

    // Update local state immediately to prevent cursor jump
    setMetadata({ ...metadata, [key]: processedValue });
    
    // Persist to backend asynchronously
    window.audioPie.metadata.set({ [key]: processedValue } as Partial<BookMetadata>);
  };

  const handleCoverSelect = async () => {
    setIsLoadingCover(true);
    try {
      const result = await window.audioPie.metadata.selectCover();
      if (result) {
        setMetadata({ ...metadata, coverPath: result });
        await window.audioPie.metadata.set({ coverPath: result });
      }
    } finally {
      setIsLoadingCover(false);
    }
  };

  const handleCoverClear = async () => {
    await window.audioPie.metadata.set({ coverPath: undefined });
    setMetadata({ ...metadata, coverPath: undefined });
    setCoverDataUrl(null);
  };

  // Load cover image as data URL when coverPath changes
  useEffect(() => {
    const loadCover = async () => {
      if (metadata.coverPath) {
        setIsLoadingCover(true);
        try {
          const dataUrl = await window.audioPie.metadata.getCoverDataUrl(metadata.coverPath);
          setCoverDataUrl(dataUrl);
        } finally {
          setIsLoadingCover(false);
        }
      } else {
        setCoverDataUrl(null);
      }
    };
    loadCover();
  }, [metadata.coverPath]);

  return (
    <ScrollArea className="metadata-form">
      <div className="metadata-form__container">
        {/* Cover Section */}
        <Card className="metadata-form__cover-card">
          <div className="metadata-form__cover-section">
            <Label className="metadata-form__cover-label">{t('metadata.bookCover')}</Label>
            
            {metadata.coverPath && coverDataUrl ? (
              <div className="metadata-form__cover-display">
                <div className="metadata-form__cover-image-wrapper">
                  <img 
                    src={coverDataUrl} 
                    alt={t('metadata.bookCover')}
                    className="metadata-form__cover-image"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="metadata-form__cover-remove"
                    onClick={handleCoverClear}
                  >
                    <X className="metadata-form__cover-remove-icon" />
                  </Button>
                </div>
                <p className="metadata-form__cover-path">
                  {metadata.coverPath.split(/[\\/]/).pop()}
                </p>
              </div>
            ) : isLoadingCover ? (
              <div className="metadata-form__cover-loading">
                <Loader2 className="metadata-form__cover-loading-icon" />
                <p className="metadata-form__cover-loading-text">{t('metadata.loadingCover')}</p>
              </div>
            ) : (
              <div className="metadata-form__cover-empty">
                <ImagePlus className="metadata-form__cover-empty-icon" />
                <p className="metadata-form__cover-empty-text">{t('metadata.noCover')}</p>
                <p className="metadata-form__cover-empty-hint">{t('metadata.chooseCover')}</p>
              </div>
            )}
            
            <div className="metadata-form__cover-actions">
              <Button 
                onClick={handleCoverSelect} 
                variant="outline" 
                className="metadata-form__cover-select"
                disabled={isLoadingCover}
              >
                <ImagePlus className="metadata-form__cover-select-icon" />
                {metadata.coverPath ? t('metadata.changeCover') : t('metadata.chooseCoverButton')}
              </Button>
              {metadata.coverPath && (
                <Button 
                  onClick={handleCoverClear} 
                  variant="ghost"
                  disabled={isLoadingCover}
                >
                  <X className="metadata-form__cover-clear-icon" />
                  {t('metadata.clear')}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Metadata Fields */}
        <div className="metadata-form__fields">
          {metadataFields.map((field) => (
            <div key={field.key} className="metadata-form__field">
              <Label htmlFor={field.key} className="metadata-form__field-label">
                {field.label}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  value={metadata[field.key] ? String(metadata[field.key]) : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="metadata-form__field-textarea"
                  placeholder={t('metadata.enterPlaceholder', { field: field.label.toLowerCase() })}
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  value={metadata[field.key] !== undefined ? String(metadata[field.key]) : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={t('metadata.enterPlaceholder', { field: field.label.toLowerCase() })}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
