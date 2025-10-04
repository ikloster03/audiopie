import { BuildProgress } from '../../../main/types';

export class ProgressModal {
  private overlay: HTMLDivElement;
  private messageEl: HTMLParagraphElement;
  private progressBar: HTMLDivElement;

  constructor(private container: HTMLElement) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'progress-overlay hidden';

    const dialog = document.createElement('div');
    dialog.className = 'progress-dialog';

    this.messageEl = document.createElement('p');
    this.messageEl.className = 'progress-message';

    const barWrapper = document.createElement('div');
    barWrapper.className = 'progress-bar-wrapper';
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'progress-bar';
    barWrapper.appendChild(this.progressBar);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', async () => {
      await window.audioPie.build.cancel();
      this.hide();
    });

    dialog.append(this.messageEl, barWrapper, cancelButton);
    this.overlay.appendChild(dialog);
    container.appendChild(this.overlay);
  }

  show(progress: BuildProgress) {
    this.overlay.classList.remove('hidden');
    this.update(progress);
  }

  hide() {
    this.overlay.classList.add('hidden');
  }

  update(progress: BuildProgress) {
    if (!progress) return;
    this.messageEl.textContent = progress.message || progress.phase;
    const percent = Math.min(100, Math.max(0, progress.percent ?? 0));
    this.progressBar.style.width = `${percent}%`;
  }
}
