import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { useAppContext } from '../context/AppContext';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings } = useAppContext();
  const [maxCpuCores, setMaxCpuCores] = useState<number>(0);
  const [formData, setFormData] = useState<AppSettings>({
    ffmpegPath: '',
    ffprobePath: '',
    defaultBitrateKbps: 128,
    defaultOutputDir: '',
    ffmpegThreads: 0
  });

  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        ffmpegPath: settings.ffmpegPath || '',
        ffprobePath: settings.ffprobePath || '',
        defaultBitrateKbps: settings.defaultBitrateKbps || 128,
        defaultOutputDir: settings.defaultOutputDir || '',
        ffmpegThreads: settings.ffmpegThreads ?? 0
      });
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (isOpen) {
      window.audioPie.settings.getMaxCpuCores().then(setMaxCpuCores);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await window.audioPie.settings.set({
      ffmpegPath: formData.ffmpegPath || undefined,
      ffprobePath: formData.ffprobePath || undefined,
      defaultBitrateKbps: formData.defaultBitrateKbps,
      defaultOutputDir: formData.defaultOutputDir || undefined,
      ffmpegThreads: formData.ffmpegThreads
    });
    setSettings(updated);
    onClose();
  };

  const handleChange = (key: keyof AppSettings, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-overlay">
      <form className="settings-form" onSubmit={handleSubmit}>
        <h2>Settings</h2>
        <label>
          FFmpeg Path
          <input
            type="text"
            value={formData.ffmpegPath}
            onChange={(e) => handleChange('ffmpegPath', e.target.value)}
          />
        </label>
        <label>
          FFprobe Path
          <input
            type="text"
            value={formData.ffprobePath}
            onChange={(e) => handleChange('ffprobePath', e.target.value)}
          />
        </label>
        <label>
          Default Bitrate (kbps)
          <input
            type="number"
            min="32"
            max="512"
            value={formData.defaultBitrateKbps}
            onChange={(e) => handleChange('defaultBitrateKbps', Number(e.target.value))}
          />
        </label>
        <label>
          Default Output Directory
          <input
            type="text"
            value={formData.defaultOutputDir}
            onChange={(e) => handleChange('defaultOutputDir', e.target.value)}
          />
        </label>
        <label>
          Parallel FFmpeg Processes
          <input
            type="number"
            min="0"
            max={maxCpuCores}
            value={formData.ffmpegThreads}
            onChange={(e) => handleChange('ffmpegThreads', Number(e.target.value))}
          />
          <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
            How many tracks to encode simultaneously. 0 = Auto (all {maxCpuCores} cores), Max: {maxCpuCores}
          </small>
        </label>
        <div className="actions">
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

