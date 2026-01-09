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
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Loader2, Download, RefreshCw } from 'lucide-react';

export const UpdateProgressModal: React.FC = () => {
  const { t } = useTranslation();
  const { updateState, setUpdateState } = useAppContext();

  const isDownloading = updateState?.status === 'downloading';
  const isDownloaded = updateState?.status === 'downloaded';
  const isOpen = isDownloading || isDownloaded;

  const progress = updateState?.progress;
  const updateInfo = updateState?.info;

  const handleInstall = () => {
    try {
      window.audioPie.update.installAndRestart();
    } catch (error) {
      console.error('Failed to install update:', error);
    }
  };

  const handleLater = () => {
    setUpdateState(null);
  };

  if (!isOpen) {
    return null;
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={isDownloaded ? handleLater : undefined}>
      <DialogContent
        className="update-progress__content"
        onInteractOutside={(e) => isDownloading && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="update-progress__header-title">
            {isDownloading && (
              <>
                <Loader2 className="update-progress__spinner" />
                {t('update.downloading.title')}
              </>
            )}
            {isDownloaded && (
              <>
                <Download className="update-progress__header-icon" />
                {t('update.downloaded.title')}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isDownloading && t('update.downloading.description')}
            {isDownloaded && t('update.downloaded.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="update-progress__body">
          {isDownloading && (
            <div className="update-progress__info">
              <Progress
                value={progress?.percent ?? 0}
                className="update-progress__bar"
              />
              <div className="update-progress__stats">
                <p className="update-progress__percentage">
                  {(progress?.percent ?? 0).toFixed(1)}%
                </p>
                {progress && progress.total > 0 ? (
                  <>
                    <p className="update-progress__size">
                      {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
                    </p>
                    <p className="update-progress__speed">
                      {formatSpeed(progress.bytesPerSecond)}
                    </p>
                  </>
                ) : (
                  <p className="update-progress__size">
                    {t('update.downloading.preparing')}
                  </p>
                )}
              </div>
            </div>
          )}

          {isDownloaded && updateInfo && (
            <div className="update-progress__ready">
              <p className="update-progress__ready-message">
                {t('update.downloaded.ready', { version: updateInfo.version })}
              </p>
              <p className="update-progress__ready-instruction">
                {t('update.downloaded.instruction')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="update-progress__footer">
          {isDownloaded && (
            <>
              <Button type="button" variant="outline" onClick={handleLater}>
                {t('update.downloaded.later')}
              </Button>
              <Button type="button" onClick={handleInstall}>
                <RefreshCw className="update-progress__button-icon" />
                {t('update.downloaded.installNow')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
