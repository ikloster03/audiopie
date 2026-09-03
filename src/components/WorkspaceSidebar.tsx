import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, FileText, LogOut, Settings } from 'lucide-react';
import { Tooltip } from './ui/tooltip';
import audioPieLogo from '../../assets/audiopie.svg';

export type WorkspaceSection = 'chapters' | 'metadata' | 'settings';
export type SidebarMode = 'minimal' | 'expanded';

interface WorkspaceSidebarProps {
  activeSection: WorkspaceSection;
  onSelect: (section: WorkspaceSection) => void;
  onCloseProject: () => void;
  mode?: SidebarMode;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  activeSection,
  onSelect,
  onCloseProject,
  mode = 'expanded',
}) => {
  const { t } = useTranslation();
  const isMinimal = mode === 'minimal';

  const items: Array<{ id: WorkspaceSection; label: string; icon: React.ReactNode }> = [
    {
      id: 'chapters',
      label: t('sidebar.chapters'),
      icon: <BookOpen className="workspace-sidebar__icon" />,
    },
    {
      id: 'metadata',
      label: t('sidebar.metadata'),
      icon: <FileText className="workspace-sidebar__icon" />,
    },
    {
      id: 'settings',
      label: t('sidebar.settings'),
      icon: <Settings className="workspace-sidebar__icon" />,
    },
  ];

  const renderItem = (
    label: string,
    button: React.ReactElement,
  ) => {
    if (!isMinimal) {
      return button;
    }
    return (
      <Tooltip label={label} side="right">
        {button}
      </Tooltip>
    );
  };

  return (
    <nav
      className={`workspace-sidebar${isMinimal ? ' workspace-sidebar--minimal' : ''}`}
      aria-label={t('sidebar.ariaLabel')}
    >
      <div className="workspace-sidebar__brand">
        <img
          src={audioPieLogo}
          alt={isMinimal ? t('app.title') : ''}
          className="workspace-sidebar__logo"
        />
        {!isMinimal && (
          <span className="workspace-sidebar__title">{t('app.title')}</span>
        )}
      </div>
      <ul className="workspace-sidebar__list">
        {items.map((item) => {
          const isActive = item.id === activeSection;
          const button = (
            <button
              type="button"
              className={`workspace-sidebar__item${isActive ? ' workspace-sidebar__item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={isMinimal ? item.label : undefined}
              onClick={() => onSelect(item.id)}
            >
              {item.icon}
              {!isMinimal && <span className="workspace-sidebar__label">{item.label}</span>}
            </button>
          );
          return <li key={item.id}>{renderItem(item.label, button)}</li>;
        })}
      </ul>
      <div className="workspace-sidebar__footer">
        {renderItem(
          t('header.close'),
          <button
            type="button"
            className="workspace-sidebar__item"
            aria-label={isMinimal ? t('header.close') : undefined}
            onClick={onCloseProject}
          >
            <LogOut className="workspace-sidebar__icon" />
            {!isMinimal && <span className="workspace-sidebar__label">{t('header.close')}</span>}
          </button>,
        )}
      </div>
    </nav>
  );
};
