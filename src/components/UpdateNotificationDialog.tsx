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

/**
 * Преобразует HTML release notes в читаемый текст
 */
const parseReleaseNotes = (html: string): string => {
  if (!html) return '';
  
  let text = html;
  
  // Заменяем заголовки на текст с новой строкой
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n$1\n');
  
  // Заменяем <li> на маркированные пункты
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
  
  // Заменяем <br> и <br/> на новые строки
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Заменяем </p> на новую строку
  text = text.replace(/<\/p>/gi, '\n');
  
  // Удаляем <strong>, <b>, <em>, <i> но оставляем содержимое
  text = text.replace(/<\/?(strong|b|em|i)[^>]*>/gi, '');
  
  // Удаляем ссылки, оставляем текст
  text = text.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
  
  // Удаляем все оставшиеся HTML теги
  text = text.replace(/<[^>]+>/g, '');
  
  // Декодируем HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Убираем лишние пустые строки и пробелы
  text = text
    .split('\n')
    .map(line => line.trim())
    .filter((line, index, arr) => !(line === '' && arr[index - 1] === ''))
    .join('\n')
    .trim();
  
  return text;
};

export const UpdateNotificationDialog: React.FC = () => {
  const { t } = useTranslation();
  const { updateState, setUpdateState } = useAppContext();

  const isOpen = updateState?.status === 'available';
  const updateInfo = updateState?.info;

  const handleDownload = async () => {
    // Сначала переключаем состояние на downloading с сохранением info
    setUpdateState({
      status: 'downloading',
      info: updateInfo,
      progress: {
        bytesPerSecond: 0,
        percent: 0,
        transferred: 0,
        total: 0,
      },
    });
    
    try {
      await window.audioPie.update.download();
    } catch (error) {
      console.error('Failed to start download:', error);
      setUpdateState({
        status: 'error',
        error: (error as Error).message,
      });
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
                {parseReleaseNotes(updateInfo.releaseNotes)}
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
