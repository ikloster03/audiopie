import { Chapter } from '../../../main/types';
import { appState } from '../state';

export class ChapterList {
  private listEl: HTMLDivElement;
  private pendingUpdate: number | null = null;

  constructor(private container: HTMLElement) {
    this.listEl = document.createElement('div');
    this.listEl.className = 'chapter-list';
    container.appendChild(this.listEl);
  }

  private scheduleUpdate() {
    if (this.pendingUpdate) {
      window.clearTimeout(this.pendingUpdate);
    }
    this.pendingUpdate = window.setTimeout(async () => {
      await window.audioPie.chapters.update(appState.chapters);
      this.pendingUpdate = null;
    }, 200);
  }

  private createChapterRow(chapter: Chapter, index: number): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'chapter-row';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = chapter.title;
    titleInput.addEventListener('input', () => {
      appState.chapters[index].title = titleInput.value;
      this.scheduleUpdate();
    });

    const timing = document.createElement('span');
    timing.className = 'chapter-timing';
    timing.textContent = `${formatDuration(chapter.startMs)} – ${formatDuration(chapter.endMs)}`;

    row.append(titleInput, timing);
    return row;
  }

  render(chapters: Chapter[]) {
    this.listEl.innerHTML = '';
    if (chapters.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No chapters yet. Generate them from tracks.';
      this.listEl.appendChild(empty);
      return;
    }
    chapters.forEach((chapter, index) => {
      this.listEl.appendChild(this.createChapterRow(chapter, index));
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
