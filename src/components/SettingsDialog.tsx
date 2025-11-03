import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { useAppContext } from '../context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Settings2, Moon, Sun } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings, theme } = useAppContext();
  const [maxCpuCores, setMaxCpuCores] = useState<number>(0);
  const [formData, setFormData] = useState<AppSettings>({
    ffmpegPath: '',
    ffprobePath: '',
    defaultBitrateKbps: 128,
    defaultOutputDir: '',
    ffmpegThreads: 0,
    theme: 'light'
  });

  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        ffmpegPath: settings.ffmpegPath || '',
        ffprobePath: settings.ffprobePath || '',
        defaultBitrateKbps: settings.defaultBitrateKbps || 128,
        defaultOutputDir: settings.defaultOutputDir || '',
        ffmpegThreads: settings.ffmpegThreads ?? 0,
        theme: settings.theme || theme || 'light'
      });
    }
  }, [isOpen, settings, theme]);

  useEffect(() => {
    if (isOpen) {
      window.audioPie.settings.getMaxCpuCores().then(setMaxCpuCores);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await window.audioPie.settings.set({
      ffmpegPath: formData.ffmpegPath || undefined,
      ffprobePath: formData.ffprobePath || undefined,
      defaultBitrateKbps: formData.defaultBitrateKbps,
      defaultOutputDir: formData.defaultOutputDir || undefined,
      ffmpegThreads: formData.ffmpegThreads,
      theme: formData.theme
    });
    setSettings(updated);
    
    // Apply theme change immediately
    if (formData.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    onClose();
  };

  const handleChange = (key: keyof AppSettings, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure application settings and preferences
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ffmpegPath">FFmpeg Path</Label>
                <Input
                  id="ffmpegPath"
                  type="text"
                  value={formData.ffmpegPath}
                  onChange={(e) => handleChange('ffmpegPath', e.target.value)}
                  placeholder="Leave empty for system default"
                />
                <p className="text-xs text-muted-foreground">
                  Path to FFmpeg executable. Leave empty to use system default.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ffprobePath">FFprobe Path</Label>
                <Input
                  id="ffprobePath"
                  type="text"
                  value={formData.ffprobePath}
                  onChange={(e) => handleChange('ffprobePath', e.target.value)}
                  placeholder="Leave empty for system default"
                />
                <p className="text-xs text-muted-foreground">
                  Path to FFprobe executable. Leave empty to use system default.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultBitrateKbps">Default Bitrate (kbps)</Label>
                <Input
                  id="defaultBitrateKbps"
                  type="number"
                  min="32"
                  max="512"
                  value={formData.defaultBitrateKbps}
                  onChange={(e) => handleChange('defaultBitrateKbps', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Audio bitrate for encoded output (32-512 kbps)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultOutputDir">Default Output Directory</Label>
                <Input
                  id="defaultOutputDir"
                  type="text"
                  value={formData.defaultOutputDir}
                  onChange={(e) => handleChange('defaultOutputDir', e.target.value)}
                  placeholder="Leave empty for last used directory"
                />
                <p className="text-xs text-muted-foreground">
                  Default directory for saving built audiobooks
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ffmpegThreads">Parallel FFmpeg Processes</Label>
                <Input
                  id="ffmpegThreads"
                  type="number"
                  min="0"
                  max={maxCpuCores}
                  value={formData.ffmpegThreads}
                  onChange={(e) => handleChange('ffmpegThreads', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Number of tracks to encode simultaneously. 0 = Auto (all {maxCpuCores} cores), Max: {maxCpuCores}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.theme === 'light' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleChange('theme', 'light')}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    type="button"
                    variant={formData.theme === 'dark' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleChange('theme', 'dark')}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred color theme
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
