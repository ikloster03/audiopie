import { BookMetadata } from '../../../main/types';
import { appState } from '../state';

const metadataFields: Array<{
  key: keyof BookMetadata;
  label: string;
  type: 'text' | 'number' | 'textarea';
}> = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'author', label: 'Author', type: 'text' },
  { key: 'narrator', label: 'Narrator', type: 'text' },
  { key: 'series', label: 'Series', type: 'text' },
  { key: 'seriesIndex', label: 'Series Index', type: 'number' },
  { key: 'year', label: 'Year', type: 'number' },
  { key: 'genre', label: 'Genre', type: 'text' },
  { key: 'publisher', label: 'Publisher', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

export class MetadataForm {
  private formEl: HTMLFormElement;
  private coverLabel: HTMLSpanElement;

  constructor(private container: HTMLElement) {
    this.formEl = document.createElement('form');
    this.formEl.className = 'metadata-form';
    this.container.appendChild(this.formEl);
    this.coverLabel = document.createElement('span');
    this.renderFields();
  }

  private renderFields() {
    metadataFields.forEach((field) => {
      const fieldWrapper = document.createElement('label');
      fieldWrapper.className = 'field';

      const text = document.createElement('span');
      text.textContent = field.label;
      fieldWrapper.appendChild(text);

      if (field.type === 'textarea') {
        const textarea = document.createElement('textarea');
        textarea.dataset.key = field.key as string;
        textarea.addEventListener('change', this.handleChange);
        fieldWrapper.appendChild(textarea);
      } else {
        const input = document.createElement('input');
        input.type = field.type;
        input.dataset.key = field.key as string;
        input.addEventListener('change', this.handleChange);
        fieldWrapper.appendChild(input);
      }

      this.formEl.appendChild(fieldWrapper);
    });

    const coverSection = document.createElement('div');
    coverSection.className = 'cover-section';

    const coverButton = document.createElement('button');
    coverButton.type = 'button';
    coverButton.textContent = 'Choose Cover';
    coverButton.addEventListener('click', this.handleCoverSelect);

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.textContent = 'Clear';
    clearButton.addEventListener('click', async () => {
      await window.audioPie.metadata.set({ coverPath: undefined });
      appState.metadata = { ...appState.metadata, coverPath: undefined };
      appState.notify();
      this.updateCoverLabel();
    });

    this.coverLabel.className = 'cover-label';

    coverSection.append(coverButton, clearButton, this.coverLabel);
    this.formEl.appendChild(coverSection);
  }

  private handleChange = async (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const key = target.dataset.key as keyof BookMetadata;
    if (!key) {
      return;
    }
    let value: string | number | undefined = target.value;
    if ((key === 'seriesIndex' || key === 'year') && value !== '') {
      value = Number(value);
    }
    if (value === '') {
      value = undefined;
    }
    await window.audioPie.metadata.set({ [key]: value } as Partial<BookMetadata>);
    appState.metadata = { ...appState.metadata, [key]: value };
    appState.notify();
  };

  private handleCoverSelect = async () => {
    const result = await window.audioPie.metadata.selectCover();
    if (result) {
      appState.metadata = { ...appState.metadata, coverPath: result };
      await window.audioPie.metadata.set({ coverPath: result });
      appState.notify();
      this.updateCoverLabel();
    }
  };

  private updateCoverLabel() {
    const cover = appState.metadata.coverPath;
    this.coverLabel.textContent = cover ? cover : 'No cover selected';
  }

  render(metadata: BookMetadata) {
    metadataFields.forEach((field) => {
      const element = this.formEl.querySelector(`[data-key="${field.key}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!element) return;
      const value = metadata[field.key];
      if (element instanceof HTMLInputElement && element.type === 'number') {
        element.value = value !== undefined ? String(value) : '';
      } else {
        element.value = value ? String(value) : '';
      }
    });
    this.updateCoverLabel();
  }
}
