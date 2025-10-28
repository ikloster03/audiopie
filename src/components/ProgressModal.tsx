import React from 'react';
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
      return `Этап ${buildProgress.currentStep} из ${buildProgress.totalSteps}: ${baseMessage}`;
    }
    return baseMessage;
  };

  return (
    <Dialog open={isBuildModalVisible} onOpenChange={setIsBuildModalVisible}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Building Audiobook
          </DialogTitle>
          <DialogDescription>
            Please wait while we process your audiobook...
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
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
