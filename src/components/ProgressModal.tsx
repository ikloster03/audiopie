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
import { Loader2 } from 'lucide-react';

export const ProgressModal: React.FC = () => {
  const { t } = useTranslation();
  const { buildProgress, isBuildModalVisible, setIsBuildModalVisible } = useAppContext();

  const handleCancel = async () => {
    await window.audioPie.build.cancel();
    setIsBuildModalVisible(false);
  };

  if (!isBuildModalVisible || !buildProgress) {
    return null;
  }

  const percent = Math.min(100, Math.max(0, buildProgress.percent ?? 0));
  
  const getMessage = () => {
    const baseMessage = buildProgress.message || buildProgress.phase;
    if (buildProgress.currentStep && buildProgress.totalSteps) {
      return t('build.step', { 
        current: buildProgress.currentStep, 
        total: buildProgress.totalSteps, 
        message: baseMessage 
      });
    }
    return baseMessage;
  };

  return (
    <Dialog open={isBuildModalVisible} onOpenChange={setIsBuildModalVisible}>
      <DialogContent className="progress-modal__content" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="progress-modal__header-title">
            <Loader2 className="progress-modal__spinner" />
            {t('build.title')}
          </DialogTitle>
          <DialogDescription>
            {t('build.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="progress-modal__body">
          <div className="progress-modal__info">
            <p className="progress-modal__message">
              {getMessage()}
            </p>
            <Progress value={percent} className="progress-modal__bar" />
            <p className="progress-modal__percentage">
              {percent}%
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCancel} variant="outline">
            {t('build.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
