import { AppSettings } from '../../../main/types';
import { appState } from '../state';

export class SettingsDialog {
  private overlay: HTMLDivElement;
  private form: HTMLFormElement;

  constructor(private container: HTMLElement) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'settings-overlay hidden';

    this.form = document.createElement('form');
    this.form.className = 'settings-form';
    this.form.innerHTML = `
      <h2>Settings</h2>
      <label>FFmpeg Path<input type="text" name="ffmpegPath" /></label>
      <label>FFprobe Path<input type="text" name="ffprobePath" /></label>
      <label>Default Bitrate (kbps)<input type="number" name="defaultBitrateKbps" min="32" max="512" /></label>
      <label>Default Output Directory<input type="text" name="defaultOutputDir" /></label>
      <div class="actions">
        <button type="submit">Save</button>
        <button type="button" data-action="cancel">Cancel</button>
      </div>
    `;
    this.form.addEventListener('submit', this.handleSubmit);
    this.form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => this.close());

    this.overlay.appendChild(this.form);
    container.appendChild(this.overlay);
  }

  open(settings: AppSettings) {
    (this.form.elements.namedItem('ffmpegPath') as HTMLInputElement).value = settings.ffmpegPath || '';
    (this.form.elements.namedItem('ffprobePath') as HTMLInputElement).value = settings.ffprobePath || '';
    (this.form.elements.namedItem('defaultBitrateKbps') as HTMLInputElement).value = String(settings.defaultBitrateKbps || 128);
    (this.form.elements.namedItem('defaultOutputDir') as HTMLInputElement).value = settings.defaultOutputDir || '';
    this.overlay.classList.remove('hidden');
  }

  close() {
    this.overlay.classList.add('hidden');
  }

  private handleSubmit = async (event: Event) => {
    event.preventDefault();
    const ffmpegPath = (this.form.elements.namedItem('ffmpegPath') as HTMLInputElement).value || undefined;
    const ffprobePath = (this.form.elements.namedItem('ffprobePath') as HTMLInputElement).value || undefined;
    const defaultBitrateKbps = Number((this.form.elements.namedItem('defaultBitrateKbps') as HTMLInputElement).value) || 128;
    const defaultOutputDir = (this.form.elements.namedItem('defaultOutputDir') as HTMLInputElement).value || undefined;

    const updated = await window.audioPie.settings.set({ ffmpegPath, ffprobePath, defaultBitrateKbps, defaultOutputDir });
    appState.settings = updated;
    this.close();
  };
}
