import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Music, FolderOpen, Plus, Moon, Sun, Languages } from 'lucide-react';

export const ProjectManager: React.FC = () => {
  const { t } = useTranslation();
  const { setTracks, setChapters, setMetadata, openProject, newProject, theme, toggleTheme, language, changeLanguage } = useAppContext();

  const handleOpenProject = async () => {
    const data = await window.audioPie.project.open();

    if (
      data &&
      data.tracks.length > 0 &&
      data.chapters.length > 0 &&
      data.metadata.title !== 'Untitled Audiobook'
    ) {
      setTracks(data.tracks);
      setChapters(data.chapters);
      setMetadata(data.metadata);
      openProject();
    }
  };

  const handleNewProject = async () => {
    await window.audioPie.project.new();
    newProject();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      {/* Theme and Language Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <Button onClick={toggleTheme} variant="ghost" size="sm" title={theme === 'light' ? t('header.switchToDarkMode') : t('header.switchToLightMode')}>
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        <Button onClick={() => changeLanguage(language === 'en' ? 'ru' : 'en')} variant="ghost" size="sm" title={language === 'en' ? 'Переключить на русский' : 'Switch to English'}>
          <Languages className="h-5 w-5" />
          <span className="ml-1 text-xs font-medium">{language.toUpperCase()}</span>
        </Button>
      </div>

      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <Music className="h-16 w-16 text-primary" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            {t('app.title')}
          </h1>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Open Project Card */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer group" onClick={handleOpenProject}>
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FolderOpen className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">{t('projectManager.openProject')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('projectManager.openProjectDesc')}
              </p>
            </CardContent>
          </Card>

          {/* Create New Card */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer group" onClick={handleNewProject}>
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <Plus className="h-10 w-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">{t('projectManager.createNew')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('projectManager.createNewDesc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {t('app.subtitle')}
        </p>
      </div>
    </div>
  );
};
