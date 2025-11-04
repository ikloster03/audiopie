import React, { useState, useEffect } from 'react';
import type { BookMetadata } from '../types';
import { useAppContext } from '../context/AppContext';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { ImagePlus, X, Loader2 } from 'lucide-react';

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
  const [isLoadingCover, setIsLoadingCover] = useState(false);

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
    <ScrollArea className="h-full">
      <div className="space-y-6">
        {/* Cover Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Book Cover</Label>
            
            {metadata.coverPath && coverDataUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <img 
                    src={coverDataUrl} 
                    alt="Book cover" 
                    className="max-w-[200px] max-h-[200px] rounded-lg shadow-lg border object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={handleCoverClear}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-[250px] break-all bg-muted px-3 py-1.5 rounded">
                  {metadata.coverPath.split(/[\\/]/).pop()}
                </p>
              </div>
            ) : isLoadingCover ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Loading cover...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20 hover:border-primary/50 transition-colors">
                <ImagePlus className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium mb-1">No cover selected</p>
                <p className="text-xs text-muted-foreground">Click button below to choose</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCoverSelect} 
                variant="outline" 
                className="flex-1"
                disabled={isLoadingCover}
              >
                <ImagePlus className="h-4 w-4" />
                {metadata.coverPath ? 'Change Cover' : 'Choose Cover'}
              </Button>
              {metadata.coverPath && (
                <Button 
                  onClick={handleCoverClear} 
                  variant="ghost"
                  disabled={isLoadingCover}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Metadata Fields */}
        <div className="grid gap-4">
          {metadataFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-sm font-medium">
                {field.label}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  value={metadata[field.key] ? String(metadata[field.key]) : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="min-h-[120px] resize-y"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  value={metadata[field.key] !== undefined ? String(metadata[field.key]) : ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
