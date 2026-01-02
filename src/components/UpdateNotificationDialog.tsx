import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';

export const UpdateNotificationDialog: React.FC = () => {
  const { t } = useTranslation();
  const { updateState, setUpdateState } = useAppContext();

  const isOpen = updateState?.status === 'available';
  const updateInfo = updateState?.info;

  const handleDownload = async () => {
    try {
      await window.audioPie.update.download();
    } catch (error) {
      console.error('Failed to start download:', error);
    }
  };

  const handleDismiss = () => {
    setUpdateState(null);
  };

  if (!isOpen || !updateInfo) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent className="update-notification__content">
        <DialogHeader>
          <DialogTitle className="update-notification__header-title">
            <Download className="update-notification__header-icon" />
            {t('update.available.title')}
          </DialogTitle>
          <DialogDescription>
            {t('update.available.description', { version: updateInfo.version })}
          </DialogDescription>
        </DialogHeader>

        <div className="update-notification__body">
          <div className="update-notification__info">
            <p className="update-notification__version">
              <strong>{t('update.available.newVersion')}:</strong> {updateInfo.version}
            </p>
            {updateInfo.releaseDate && (
              <p className="update-notification__date">
                <strong>{t('update.available.releaseDate')}:</strong>{' '}
                {new Date(updateInfo.releaseDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {updateInfo.releaseNotes && (
            <div className="update-notification__release-notes">
              <p className="update-notification__release-notes-title">
                {t('update.available.releaseNotes')}:
              </p>
              <div className="update-notification__release-notes-content">
                {updateInfo.releaseNotes}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="update-notification__footer">
          <Button type="button" variant="outline" onClick={handleDismiss}>
            <X className="update-notification__button-icon" />
            {t('update.available.later')}
          </Button>
          <Button type="button" onClick={handleDownload}>
            <Download className="update-notification__button-icon" />
            {t('update.available.download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
