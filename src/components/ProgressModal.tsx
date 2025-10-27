import React from 'react';
import { useAppContext } from '../context/AppContext';

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
    <div className="progress-overlay">
      <div className="progress-dialog">
        <p className="progress-message">
          {getMessage()}
        </p>
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="progress-info">
          <span>{percent}%</span>
        </div>
        <button onClick={handleCancel}>Отмена</button>
      </div>
    </div>
  );
};

