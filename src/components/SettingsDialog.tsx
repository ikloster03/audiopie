import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Settings2, Moon, Sun, Languages } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { settings, setSettings, theme, changeLanguage, language } = useAppContext();
  const [maxCpuCores, setMaxCpuCores] = useState<number>(0);
  const [formData, setFormData] = useState<AppSettings>({
    ffmpegPath: '',
    ffprobePath: '',
    defaultBitrateKbps: 128,
    defaultOutputDir: '',
    ffmpegThreads: 0,
    theme: 'light',
    language: 'en'
  });

  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        ffmpegPath: settings.ffmpegPath || '',
        ffprobePath: settings.ffprobePath || '',
        defaultBitrateKbps: settings.defaultBitrateKbps || 128,
        defaultOutputDir: settings.defaultOutputDir || '',
        ffmpegThreads: settings.ffmpegThreads ?? 0,
        theme: settings.theme || theme || 'light',
        language: settings.language || language || 'en'
      });
    }
  }, [isOpen, settings, theme, language]);

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
      theme: formData.theme,
      language: formData.language
    });
    setSettings(updated);
    
    // Apply theme change immediately
    if (formData.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply language change immediately
    if (formData.language && formData.language !== language) {
      changeLanguage(formData.language);
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
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('settings.description')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ffmpegPath">{t('settings.ffmpegPath')}</Label>
                <Input
                  id="ffmpegPath"
                  type="text"
                  value={formData.ffmpegPath}
                  onChange={(e) => handleChange('ffmpegPath', e.target.value)}
                  placeholder={t('settings.ffmpegPathPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.ffmpegPathDesc')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ffprobePath">{t('settings.ffprobePath')}</Label>
                <Input
                  id="ffprobePath"
                  type="text"
                  value={formData.ffprobePath}
                  onChange={(e) => handleChange('ffprobePath', e.target.value)}
                  placeholder={t('settings.ffprobePathPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.ffprobePathDesc')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultBitrateKbps">{t('settings.defaultBitrate')}</Label>
                <Input
                  id="defaultBitrateKbps"
                  type="number"
                  min="32"
                  max="512"
                  value={formData.defaultBitrateKbps}
                  onChange={(e) => handleChange('defaultBitrateKbps', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.defaultBitrateDesc')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultOutputDir">{t('settings.defaultOutputDir')}</Label>
                <Input
                  id="defaultOutputDir"
                  type="text"
                  value={formData.defaultOutputDir}
                  onChange={(e) => handleChange('defaultOutputDir', e.target.value)}
                  placeholder={t('settings.defaultOutputDirPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.defaultOutputDirDesc')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ffmpegThreads">{t('settings.ffmpegThreads')}</Label>
                <Input
                  id="ffmpegThreads"
                  type="number"
                  min="0"
                  max={maxCpuCores}
                  value={formData.ffmpegThreads}
                  onChange={(e) => handleChange('ffmpegThreads', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  {t('settings.ffmpegThreadsDesc', { cores: maxCpuCores })}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">{t('settings.theme')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.theme === 'light' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleChange('theme', 'light')}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    {t('settings.light')}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.theme === 'dark' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleChange('theme', 'dark')}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    {t('settings.dark')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('settings.themeDesc')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.language === 'en' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleChange('language', 'en')}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    English
                  </Button>
                  <Button
                    type="button"
                    variant={formData.language === 'ru' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleChange('language', 'ru')}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    Русский
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('settings.languageDesc')}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('settings.cancel')}
              </Button>
              <Button type="submit">
                {t('settings.saveChanges')}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
