import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppSettings } from '../types';
import { useAppContext } from '../context/AppContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Settings2, Moon, Sun, Languages, RefreshCw, PanelLeft, PanelLeftClose, BookOpen, Library, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const defaultFormData = (settings: AppSettings | null, theme: 'light' | 'dark', language: 'en' | 'ru'): AppSettings => ({
  ffmpegPath: settings?.ffmpegPath || '',
  ffprobePath: settings?.ffprobePath || '',
  defaultBitrateKbps: settings?.defaultBitrateKbps || 128,
  ffmpegThreads: settings?.ffmpegThreads ?? 1,
  theme: settings?.theme || theme || 'light',
  language: settings?.language || language || 'en',
  sidebarMode: settings?.sidebarMode || 'expanded',
  autoCheckForUpdates: settings?.autoCheckForUpdates ?? true,
});

interface SettingsPageProps {
  onNavigateToSeries?: () => void;
  onNavigateToBookEditor?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateToSeries, onNavigateToBookEditor }) => {
  const { t } = useTranslation();
  const { settings, setSettings, theme, changeLanguage, language, updateState, projectType, bookOrder, setProjectType } = useAppContext();
  const [maxCpuCores, setMaxCpuCores] = useState<number>(0);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [formData, setFormData] = useState<AppSettings>(() => defaultFormData(settings, theme, language));
  const [isConfirmTypeSwitchOpen, setIsConfirmTypeSwitchOpen] = useState(false);

  useEffect(() => {
    setFormData(defaultFormData(settings, theme, language));
  }, [settings, theme, language]);

  useEffect(() => {
    window.audioPie.settings.getMaxCpuCores().then(setMaxCpuCores);
  }, []);

  useEffect(() => {
    if (updateState?.status === 'not-available' ||
        updateState?.status === 'available' ||
        updateState?.status === 'error') {
      setIsCheckingUpdates(false);
    }
  }, [updateState]);

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      await window.audioPie.update.checkNow();
    } catch (error) {
      console.error('Failed to check for updates:', error);
      setIsCheckingUpdates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await window.audioPie.settings.set({
      ffmpegPath: formData.ffmpegPath || undefined,
      ffprobePath: formData.ffprobePath || undefined,
      defaultBitrateKbps: formData.defaultBitrateKbps,
      ffmpegThreads: formData.ffmpegThreads,
      theme: formData.theme,
      language: formData.language,
      sidebarMode: formData.sidebarMode || 'expanded',
      autoCheckForUpdates: formData.autoCheckForUpdates,
    });
    setSettings(updated);

    await window.audioPie.update.setAutoUpdateEnabled(formData.autoCheckForUpdates ?? true);

    if (formData.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (formData.language && formData.language !== language) {
      changeLanguage(formData.language);
    }
  };

  const handleReset = () => {
    setFormData(defaultFormData(settings, theme, language));
  };

  const handleChange = (key: keyof AppSettings, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSidebarModeChange = async (mode: 'minimal' | 'expanded') => {
    handleChange('sidebarMode', mode);
    const updated = await window.audioPie.settings.set({ sidebarMode: mode });
    setSettings(updated);
  };

  const handleSwitchToSeries = async () => {
    await setProjectType('series');
    onNavigateToSeries?.();
  };

  const handleSwitchToAudiobook = async () => {
    if (bookOrder.length > 1) {
      setIsConfirmTypeSwitchOpen(true);
      return;
    }
    await setProjectType('audiobook');
    onNavigateToBookEditor?.();
  };

  const handleConfirmSwitchToAudiobook = async () => {
    setIsConfirmTypeSwitchOpen(false);
    await setProjectType('audiobook');
    onNavigateToBookEditor?.();
  };

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h2 className="settings-page__title">
          <Settings2 className="settings-page__title-icon" />
          {t('settings.title')}
        </h2>
        <p className="settings-page__description">{t('settings.description')}</p>
      </div>

      <ScrollArea className="settings-page__scroll">
        <form onSubmit={handleSubmit} className="settings-page__form">
          <div className="settings-page__fields">
            <div className="settings-page__field">
              <Label htmlFor="ffmpegPath">{t('settings.ffmpegPath')}</Label>
              <Input
                id="ffmpegPath"
                type="text"
                value={formData.ffmpegPath}
                onChange={(e) => handleChange('ffmpegPath', e.target.value)}
                placeholder={t('settings.ffmpegPathPlaceholder')}
              />
              <p className="settings-page__field-description">{t('settings.ffmpegPathDesc')}</p>
            </div>

            <div className="settings-page__field">
              <Label htmlFor="ffprobePath">{t('settings.ffprobePath')}</Label>
              <Input
                id="ffprobePath"
                type="text"
                value={formData.ffprobePath}
                onChange={(e) => handleChange('ffprobePath', e.target.value)}
                placeholder={t('settings.ffprobePathPlaceholder')}
              />
              <p className="settings-page__field-description">{t('settings.ffprobePathDesc')}</p>
            </div>

            <div className="settings-page__field">
              <Label htmlFor="defaultBitrateKbps">{t('settings.defaultBitrate')}</Label>
              <Input
                id="defaultBitrateKbps"
                type="number"
                min="32"
                max="512"
                value={formData.defaultBitrateKbps}
                onChange={(e) => handleChange('defaultBitrateKbps', Number(e.target.value))}
              />
              <p className="settings-page__field-description">{t('settings.defaultBitrateDesc')}</p>
            </div>

            <div className="settings-page__field">
              <Label htmlFor="ffmpegThreads">{t('settings.ffmpegThreads')}</Label>
              <Input
                id="ffmpegThreads"
                type="number"
                min="1"
                max={maxCpuCores}
                value={formData.ffmpegThreads}
                onChange={(e) => handleChange('ffmpegThreads', Math.max(1, Number(e.target.value)))}
              />
              <p className="settings-page__field-description">
                {t('settings.ffmpegThreadsDesc', { cores: maxCpuCores })}
              </p>
            </div>

            <div className="settings-page__field">
              <Label htmlFor="autoCheckForUpdates">{t('settings.autoCheckForUpdates')}</Label>
              <div className="settings-page__update-check">
                <div className="settings-page__update-toggle">
                  <input
                    id="autoCheckForUpdates"
                    type="checkbox"
                    checked={formData.autoCheckForUpdates ?? true}
                    onChange={(e) => handleChange('autoCheckForUpdates', e.target.checked)}
                    className="settings-page__checkbox"
                  />
                  <span>{t('settings.autoCheckForUpdatesLabel')}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckForUpdates}
                  disabled={isCheckingUpdates}
                  className="settings-page__check-updates-button"
                >
                  <RefreshCw className={`settings-page__refresh-icon ${isCheckingUpdates ? 'settings-page__refresh-icon--spinning' : ''}`} />
                  {t('settings.checkForUpdates')}
                </Button>
              </div>
              <p className="settings-page__field-description">{t('settings.autoCheckForUpdatesDesc')}</p>
            </div>

            <div className="settings-page__field">
              <Label htmlFor="sidebarMode">{t('settings.sidebarMode')}</Label>
              <div className="settings-page__theme-buttons">
                <Button
                  type="button"
                  variant={formData.sidebarMode === 'expanded' ? 'default' : 'outline'}
                  className="settings-page__theme-button"
                  onClick={() => handleSidebarModeChange('expanded')}
                >
                  <PanelLeft className="settings-page__theme-icon" />
                  {t('settings.sidebarExpanded')}
                </Button>
                <Button
                  type="button"
                  variant={formData.sidebarMode === 'minimal' ? 'default' : 'outline'}
                  className="settings-page__theme-button"
                  onClick={() => handleSidebarModeChange('minimal')}
                >
                  <PanelLeftClose className="settings-page__theme-icon" />
                  {t('settings.sidebarMinimal')}
                </Button>
              </div>
              <p className="settings-page__field-description">{t('settings.sidebarModeDesc')}</p>
            </div>

            <div className="settings-page__field">
              <Label htmlFor="theme">{t('settings.theme')}</Label>
              <div className="settings-page__theme-buttons">
                <Button
                  type="button"
                  variant={formData.theme === 'light' ? 'default' : 'outline'}
                  className="settings-page__theme-button"
                  onClick={() => handleChange('theme', 'light')}
                >
                  <Sun className="settings-page__theme-icon" />
                  {t('settings.light')}
                </Button>
                <Button
                  type="button"
                  variant={formData.theme === 'dark' ? 'default' : 'outline'}
                  className="settings-page__theme-button"
                  onClick={() => handleChange('theme', 'dark')}
                >
                  <Moon className="settings-page__theme-icon" />
                  {t('settings.dark')}
                </Button>
              </div>
              <p className="settings-page__field-description">{t('settings.themeDesc')}</p>
            </div>

            <div className="settings-page__field">
              <Label htmlFor="language">{t('settings.language')}</Label>
              <div className="settings-page__language-buttons">
                <Button
                  type="button"
                  variant={formData.language === 'en' ? 'default' : 'outline'}
                  className="settings-page__language-button"
                  onClick={() => handleChange('language', 'en')}
                >
                  <Languages className="settings-page__language-icon" />
                  English
                </Button>
                <Button
                  type="button"
                  variant={formData.language === 'ru' ? 'default' : 'outline'}
                  className="settings-page__language-button"
                  onClick={() => handleChange('language', 'ru')}
                >
                  <Languages className="settings-page__language-icon" />
                  Русский
                </Button>
              </div>
              <p className="settings-page__field-description">{t('settings.languageDesc')}</p>
            </div>
          </div>

          <div className="settings-page__footer">
            <Button type="button" variant="outline" onClick={handleReset}>
              {t('settings.cancel')}
            </Button>
            <Button type="submit">{t('settings.saveChanges')}</Button>
          </div>

          <div className="settings-page__danger-zone">
            <h3 className="settings-page__danger-zone-title">
              <AlertTriangle className="settings-page__danger-zone-icon" />
              {t('settings.dangerZone')}
            </h3>
            <p className="settings-page__field-description">{t('settings.dangerZoneDesc')}</p>
            <div className="settings-page__theme-buttons">
              <Button
                type="button"
                variant={projectType === 'audiobook' ? 'default' : 'outline'}
                className="settings-page__theme-button"
                onClick={handleSwitchToAudiobook}
                disabled={projectType === 'audiobook'}
              >
                <BookOpen className="settings-page__theme-icon" />
                {t('settings.typeAudiobook')}
              </Button>
              <Button
                type="button"
                variant={projectType === 'series' ? 'default' : 'outline'}
                className="settings-page__theme-button"
                onClick={handleSwitchToSeries}
                disabled={projectType === 'series'}
              >
                <Library className="settings-page__theme-icon" />
                {t('settings.typeSeries')}
              </Button>
            </div>
          </div>
        </form>
      </ScrollArea>

      <Dialog open={isConfirmTypeSwitchOpen} onOpenChange={setIsConfirmTypeSwitchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.confirmSwitchTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.confirmSwitchDesc', { count: bookOrder.length - 1 })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmTypeSwitchOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmSwitchToAudiobook}>
              {t('settings.confirmSwitchAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
