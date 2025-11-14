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
    <div className="project-manager">
      {/* Theme and Language Toggle */}
      <div className="project-manager__controls">
        <Button onClick={toggleTheme} variant="ghost" size="sm" title={theme === 'light' ? t('header.switchToDarkMode') : t('header.switchToLightMode')}>
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        <Button onClick={() => changeLanguage(language === 'en' ? 'ru' : 'en')} variant="ghost" size="sm" title={language === 'en' ? 'Переключить на русский' : 'Switch to English'}>
          <Languages className="h-5 w-5" />
          <span className="ml-1 text-xs font-medium">{language.toUpperCase()}</span>
        </Button>
      </div>

      <div className="project-manager__container">
        {/* Logo */}
        <div className="project-manager__logo">
          <Music className="project-manager__logo-icon" />
          <h1 className="project-manager__logo-title">
            {t('app.title')}
          </h1>
        </div>

        {/* Project Cards */}
        <div className="project-manager__cards">
          {/* Open Project Card */}
          <Card className="project-manager__card" onClick={handleOpenProject}>
            <CardContent className="project-manager__card-content">
              <div className="project-manager__card-icon-wrapper project-manager__card-icon-wrapper--open">
                <FolderOpen className="project-manager__card-icon project-manager__card-icon--primary" />
              </div>
              <h2 className="project-manager__card-title">{t('projectManager.openProject')}</h2>
              <p className="project-manager__card-description">
                {t('projectManager.openProjectDesc')}
              </p>
            </CardContent>
          </Card>

          {/* Create New Card */}
          <Card className="project-manager__card" onClick={handleNewProject}>
            <CardContent className="project-manager__card-content">
              <div className="project-manager__card-icon-wrapper project-manager__card-icon-wrapper--new">
                <Plus className="project-manager__card-icon project-manager__card-icon--orange" />
              </div>
              <h2 className="project-manager__card-title">{t('projectManager.createNew')}</h2>
              <p className="project-manager__card-description">
                {t('projectManager.createNewDesc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="project-manager__footer">
          {t('app.subtitle')}
        </p>
      </div>
    </div>
  );
};
