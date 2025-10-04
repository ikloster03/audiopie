import Sortable, { SortableEvent } from 'sortablejs';
import { TrackInfo } from '../../../main/types';
import { appState } from '../state';

export class TrackList {
  private listEl: HTMLUListElement;
  private sortable: Sortable | null = null;

  constructor(private container: HTMLElement) {
    this.listEl = document.createElement('ul');
    this.listEl.className = 'track-list';
    container.appendChild(this.listEl);
    this.initSortable();
  }

  private initSortable() {
    this.sortable = Sortable.create(this.listEl, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: async (event: SortableEvent) => {
        if (event.oldIndex === undefined || event.newIndex === undefined) {
          return;
        }
        const items = Array.from(this.listEl.querySelectorAll('li'));
        const newOrder = items.map((item) => Number(item.dataset.index));
        await window.audioPie.tracks.reorder(newOrder);
        const current = [...appState.tracks];
        appState.tracks = newOrder.map((idx) => current[idx]);
        appState.notify();
        await this.refreshChapters();
      },
    });
  }

  private async refreshChapters() {
    const chapters = await window.audioPie.chapters.autoFromTracks();
    appState.chapters = chapters;
    appState.notify();
  }

  private createItem(track: TrackInfo, index: number): HTMLLIElement {
    const li = document.createElement('li');
    li.dataset.index = index.toString();
    li.draggable = false;

    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.textContent = '☰';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = track.displayTitle;
    titleInput.className = 'track-title-input';
    titleInput.addEventListener('change', async () => {
      const newTitle = titleInput.value.trim() || track.displayTitle;
      await window.audioPie.tracks.updateTitle(index, newTitle);
      appState.tracks[index].displayTitle = newTitle;
      appState.notify();
      await this.refreshChapters();
    });

    const duration = document.createElement('span');
    duration.className = 'track-duration';
    duration.textContent = formatDuration(track.durationMs);

    const removeButton = document.createElement('button');
    removeButton.className = 'track-remove';
    removeButton.textContent = '✕';
    removeButton.title = 'Remove track';
    removeButton.addEventListener('click', async () => {
      await window.audioPie.tracks.remove([index]);
      appState.tracks = appState.tracks.filter((_, i) => i !== index);
      appState.notify();
      await this.refreshChapters();
    });

    li.append(handle, titleInput, duration, removeButton);
    return li;
  }

  render(tracks: TrackInfo[]) {
    this.listEl.innerHTML = '';
    tracks.forEach((track, index) => {
      const item = this.createItem(track, index);
      this.listEl.appendChild(item);
    });
  }
}

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

const pad = (value: number): string => value.toString().padStart(2, '0');
