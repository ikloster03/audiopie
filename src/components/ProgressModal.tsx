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
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            {t('build.title')}
          </DialogTitle>
          <DialogDescription>
            {t('build.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {getMessage()}
            </p>
            <Progress value={percent} className="h-3" />
            <p className="text-xs text-muted-foreground text-right font-mono">
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
