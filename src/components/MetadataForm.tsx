import React, { useState, useEffect } from 'react';
import type { BookMetadata } from '../types';
import { useAppContext } from '../context/AppContext';

interface MetadataField {
  key: keyof BookMetadata;
  label: string;
  type: 'text' | 'number' | 'textarea';
}

const metadataFields: MetadataField[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'author', label: 'Author', type: 'text' },
  { key: 'narrator', label: 'Narrator', type: 'text' },
  { key: 'series', label: 'Series', type: 'text' },
  { key: 'seriesIndex', label: 'Series Index', type: 'number' },
  { key: 'year', label: 'Year', type: 'number' },
  { key: 'genre', label: 'Genre', type: 'text' },
  { key: 'publisher', label: 'Publisher', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

export const MetadataForm: React.FC = () => {
  const { metadata, setMetadata } = useAppContext();
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);

  const handleChange = async (key: keyof BookMetadata, value: string) => {
    let processedValue: string | number | undefined = value;

    if ((key === 'seriesIndex' || key === 'year') && value !== '') {
      processedValue = Number(value);
    }
    if (value === '') {
      processedValue = undefined;
    }

    await window.audioPie.metadata.set({ [key]: processedValue } as Partial<BookMetadata>);
    setMetadata({ ...metadata, [key]: processedValue });
  };

  const handleCoverSelect = async () => {
    const result = await window.audioPie.metadata.selectCover();
    if (result) {
      setMetadata({ ...metadata, coverPath: result });
      await window.audioPie.metadata.set({ coverPath: result });
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
        const dataUrl = await window.audioPie.metadata.getCoverDataUrl(metadata.coverPath);
        setCoverDataUrl(dataUrl);
      } else {
        setCoverDataUrl(null);
      }
    };
    loadCover();
  }, [metadata.coverPath]);

  return (
    <form className="metadata-form">
      {metadataFields.map((field) => (
        <label key={field.key} className="field">
          <span>{field.label}</span>
          {field.type === 'textarea' ? (
            <textarea
              value={metadata[field.key] ? String(metadata[field.key]) : ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          ) : (
            <input
              type={field.type}
              value={metadata[field.key] !== undefined ? String(metadata[field.key]) : ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          )}
        </label>
      ))}

      <div className="cover-section">
        <div className="cover-actions">
          <button type="button" onClick={handleCoverSelect}>
            Choose Cover
          </button>
          {metadata.coverPath && (
            <button type="button" onClick={handleCoverClear} className="clear-btn">
              Clear
            </button>
          )}
        </div>
        {metadata.coverPath && coverDataUrl ? (
          <div className="cover-preview">
            <img src={coverDataUrl} alt="Book cover" />
            <span className="cover-path">{metadata.coverPath.split(/[\\/]/).pop()}</span>
          </div>
        ) : metadata.coverPath ? (
          <div className="cover-preview">
            <div className="cover-loading">Loading...</div>
            <span className="cover-path">{metadata.coverPath.split(/[\\/]/).pop()}</span>
          </div>
        ) : (
          <div className="cover-empty">
            <span>No cover selected</span>
          </div>
        )}
      </div>
    </form>
  );
};

