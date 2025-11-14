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
      <DialogContent className="settings-dialog__content">
        <DialogHeader>
          <DialogTitle className="settings-dialog__header-title">
            <Settings2 className="settings-dialog__header-icon" />
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('settings.description')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="settings-dialog__scroll-area">
          <form onSubmit={handleSubmit} className="settings-dialog__form">
            <div className="settings-dialog__fields">
              <div className="settings-dialog__field">
                <Label htmlFor="ffmpegPath">{t('settings.ffmpegPath')}</Label>
                <Input
                  id="ffmpegPath"
                  type="text"
                  value={formData.ffmpegPath}
                  onChange={(e) => handleChange('ffmpegPath', e.target.value)}
                  placeholder={t('settings.ffmpegPathPlaceholder')}
                />
                <p className="settings-dialog__field-description">
                  {t('settings.ffmpegPathDesc')}
                </p>
              </div>

              <div className="settings-dialog__field">
                <Label htmlFor="ffprobePath">{t('settings.ffprobePath')}</Label>
                <Input
                  id="ffprobePath"
                  type="text"
                  value={formData.ffprobePath}
                  onChange={(e) => handleChange('ffprobePath', e.target.value)}
                  placeholder={t('settings.ffprobePathPlaceholder')}
                />
                <p className="settings-dialog__field-description">
                  {t('settings.ffprobePathDesc')}
                </p>
              </div>

              <div className="settings-dialog__field">
                <Label htmlFor="defaultBitrateKbps">{t('settings.defaultBitrate')}</Label>
                <Input
                  id="defaultBitrateKbps"
                  type="number"
                  min="32"
                  max="512"
                  value={formData.defaultBitrateKbps}
                  onChange={(e) => handleChange('defaultBitrateKbps', Number(e.target.value))}
                />
                <p className="settings-dialog__field-description">
                  {t('settings.defaultBitrateDesc')}
                </p>
              </div>

              <div className="settings-dialog__field">
                <Label htmlFor="defaultOutputDir">{t('settings.defaultOutputDir')}</Label>
                <Input
                  id="defaultOutputDir"
                  type="text"
                  value={formData.defaultOutputDir}
                  onChange={(e) => handleChange('defaultOutputDir', e.target.value)}
                  placeholder={t('settings.defaultOutputDirPlaceholder')}
                />
                <p className="settings-dialog__field-description">
                  {t('settings.defaultOutputDirDesc')}
                </p>
              </div>

              <div className="settings-dialog__field">
                <Label htmlFor="ffmpegThreads">{t('settings.ffmpegThreads')}</Label>
                <Input
                  id="ffmpegThreads"
                  type="number"
                  min="0"
                  max={maxCpuCores}
                  value={formData.ffmpegThreads}
                  onChange={(e) => handleChange('ffmpegThreads', Number(e.target.value))}
                />
                <p className="settings-dialog__field-description">
                  {t('settings.ffmpegThreadsDesc', { cores: maxCpuCores })}
                </p>
              </div>

              <div className="settings-dialog__field">
                <Label htmlFor="theme">{t('settings.theme')}</Label>
                <div className="settings-dialog__theme-buttons">
                  <Button
                    type="button"
                    variant={formData.theme === 'light' ? 'default' : 'outline'}
                    className="settings-dialog__theme-button"
                    onClick={() => handleChange('theme', 'light')}
                  >
                    <Sun className="settings-dialog__theme-icon" />
                    {t('settings.light')}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.theme === 'dark' ? 'default' : 'outline'}
                    className="settings-dialog__theme-button"
                    onClick={() => handleChange('theme', 'dark')}
                  >
                    <Moon className="settings-dialog__theme-icon" />
                    {t('settings.dark')}
                  </Button>
                </div>
                <p className="settings-dialog__field-description">
                  {t('settings.themeDesc')}
                </p>
              </div>

              <div className="settings-dialog__field">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <div className="settings-dialog__language-buttons">
                  <Button
                    type="button"
                    variant={formData.language === 'en' ? 'default' : 'outline'}
                    className="settings-dialog__language-button"
                    onClick={() => handleChange('language', 'en')}
                  >
                    <Languages className="settings-dialog__language-icon" />
                    English
                  </Button>
                  <Button
                    type="button"
                    variant={formData.language === 'ru' ? 'default' : 'outline'}
                    className="settings-dialog__language-button"
                    onClick={() => handleChange('language', 'ru')}
                  >
                    <Languages className="settings-dialog__language-icon" />
                    Русский
                  </Button>
                </div>
                <p className="settings-dialog__field-description">
                  {t('settings.languageDesc')}
                </p>
              </div>
            </div>

            <DialogFooter className="settings-dialog__footer">
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
