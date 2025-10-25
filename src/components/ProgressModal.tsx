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

  return (
    <div className="progress-overlay">
      <div className="progress-dialog">
        <p className="progress-message">
          {buildProgress.message || buildProgress.phase}
        </p>
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar"
            style={{ width: `${percent}%` }}
          />
        </div>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
};

