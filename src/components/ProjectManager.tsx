import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FolderOpen, Plus, Moon, Sun, Languages, BookOpen, Library, ArrowLeft, FileInput } from 'lucide-react';
import audioPieLogo from '../../assets/audiopie.svg';

type ProjectManagerScreen = 'main' | 'chooseType';

export const ProjectManager: React.FC = () => {
  const { t } = useTranslation();
  const { openProjectFromDialog, createNewProject, startFromTemplate, theme, toggleTheme, language, changeLanguage } = useAppContext();
  const [screen, setScreen] = useState<ProjectManagerScreen>('main');
  const [isCreating, setIsCreating] = useState(false);

  const handleOpenProject = async () => {
    await openProjectFromDialog();
  };

  const handleCreate = async (type: 'audiobook' | 'series') => {
    setIsCreating(true);
    try {
      await createNewProject(type);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartFromExisting = async () => {
    setIsCreating(true);
    try {
      const created = await createNewProject('audiobook');
      if (created) {
        await startFromTemplate();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const controls = (
    <div className="project-manager__controls">
      <Button onClick={toggleTheme} variant="ghost" size="sm" title={theme === 'light' ? t('header.switchToDarkMode') : t('header.switchToLightMode')}>
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
      <Button onClick={() => changeLanguage(language === 'en' ? 'ru' : 'en')} variant="ghost" size="sm" title={language === 'en' ? 'Переключить на русский' : 'Switch to English'}>
        <Languages className="h-5 w-5" />
        <span className="ml-1 text-xs font-medium">{language.toUpperCase()}</span>
      </Button>
    </div>
  );

  if (screen === 'chooseType') {
    return (
      <div className="project-manager">
        {controls}
        <div className="project-manager__container">
          <div className="project-manager__logo">
            <img src={audioPieLogo} alt="AudioPie Logo" className="project-manager__logo-icon" />
            <h1 className="project-manager__logo-title">{t('projectManager.chooseTypeTitle')}</h1>
          </div>

          <div className="project-manager__cards">
            <Card className="project-manager__card" onClick={() => !isCreating && handleCreate('audiobook')}>
              <CardContent className="project-manager__card-content">
                <div className="project-manager__card-icon-wrapper project-manager__card-icon-wrapper--new">
                  <BookOpen className="project-manager__card-icon project-manager__card-icon--orange" />
                </div>
                <h2 className="project-manager__card-title">{t('projectManager.typeAudiobook')}</h2>
                <p className="project-manager__card-description">{t('projectManager.typeAudiobookDesc')}</p>
              </CardContent>
            </Card>

            <Card className="project-manager__card" onClick={() => !isCreating && handleCreate('series')}>
              <CardContent className="project-manager__card-content">
                <div className="project-manager__card-icon-wrapper project-manager__card-icon-wrapper--open">
                  <Library className="project-manager__card-icon project-manager__card-icon--primary" />
                </div>
                <h2 className="project-manager__card-title">{t('projectManager.typeSeries')}</h2>
                <p className="project-manager__card-description">{t('projectManager.typeSeriesDesc')}</p>
              </CardContent>
            </Card>
          </div>

          <Button variant="ghost" onClick={handleStartFromExisting} disabled={isCreating} className="project-manager__template-link">
            <FileInput className="h-4 w-4" />
            {t('projectManager.startFromExisting')}
          </Button>

          <Button variant="ghost" onClick={() => setScreen('main')} className="project-manager__back-link">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-manager">
      {controls}

      <div className="project-manager__container">
        {/* Logo */}
        <div className="project-manager__logo">
          <img src={audioPieLogo} alt="AudioPie Logo" className="project-manager__logo-icon" />
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
          <Card className="project-manager__card" onClick={() => setScreen('chooseType')}>
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
