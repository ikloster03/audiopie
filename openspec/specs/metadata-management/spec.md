# metadata-management Specification

## Purpose
TBD - created by archiving change baseline-capture-existing-capabilities. Update Purpose after archive.
## Requirements
### Requirement: Edit book metadata fields
The system SHALL let the user view and edit book metadata (title, author, narrator, series, series index, year, genre, publisher, description, cover path). The current UI form exposes title, author, genre, and description as editable fields; the remaining fields are part of the persisted `BookMetadata` model and are settable via the metadata API even when not surfaced in this form.

**RU:** Система ДОЛЖНА позволять просматривать и редактировать метаданные книги (название, автор, чтец, серия, номер в серии, год, жанр, издатель, описание, путь к обложке). Текущая форма UI показывает как редактируемые поля только название, автора, жанр и описание; остальные поля являются частью сохраняемой модели `BookMetadata` и доступны через API метаданных, даже если не отображаются в этой форме.

#### Scenario: Edit a text metadata field
- **WHEN** the user types into a metadata field (e.g. title, author, genre)
- **THEN** the system SHALL update the in-memory metadata immediately for responsive typing and SHALL persist the changed field via `metadata/set` asynchronously
- **RU:** Когда пользователь вводит текст в поле метаданных (например, название, автор, жанр), система ДОЛЖНА немедленно обновить метаданные в памяти для отзывчивого ввода и асинхронно сохранить изменённое поле через `metadata/set`.

#### Scenario: Clear a metadata field
- **WHEN** the user clears a metadata field's input to an empty string
- **THEN** the system SHALL persist that field as `undefined` rather than an empty string
- **RU:** Когда пользователь очищает поле метаданных до пустой строки, система ДОЛЖНА сохранить это поле как `undefined`, а не как пустую строку.

### Requirement: Manage book cover art
The system SHALL let the user set a cover image either via a native file dialog or by dropping an image file (`.jpg`, `.jpeg`, `.png`) onto the cover area, and SHALL let the user clear the currently set cover.

**RU:** Система ДОЛЖНА позволять устанавливать обложку книги через нативный диалог выбора файла либо перетаскиванием файла изображения (`.jpg`, `.jpeg`, `.png`) на область обложки, а также позволять очищать текущую обложку.

#### Scenario: Select cover via file dialog
- **WHEN** the user clicks the cover selection button and picks an image file
- **THEN** the system SHALL store the selected file's path as `metadata.coverPath` and persist it via `metadata/set`
- **RU:** Когда пользователь нажимает кнопку выбора обложки и выбирает файл изображения, система ДОЛЖНА сохранить путь к выбранному файлу как `metadata.coverPath` и зафиксировать его через `metadata/set`.

#### Scenario: Drop an image onto the cover area
- **WHEN** the user drags an image file over the cover area and drops it
- **THEN** the system SHALL show a drop-target overlay while dragging, and on drop SHALL validate the file has an image MIME type, resolve its file system path, and persist it as the cover via `metadata/setCoverFromPath`
- **RU:** Когда пользователь перетаскивает файл изображения над областью обложки и отпускает его, система ДОЛЖНА показывать оверлей зоны сброса во время перетаскивания, а при отпускании — проверить, что MIME-тип файла является изображением, определить его путь в файловой системе и сохранить как обложку через `metadata/setCoverFromPath`.

#### Scenario: Reject a non-image file path for cover
- **WHEN** `metadata/setCoverFromPath` is called with a path whose extension is not `.jpg`, `.jpeg`, or `.png`, or that does not exist on disk
- **THEN** the system SHALL NOT update the stored cover path and SHALL return no result
- **RU:** Когда `metadata/setCoverFromPath` вызывается с путём, расширение которого не `.jpg`, `.jpeg` или `.png`, либо файл не существует на диске, система НЕ ДОЛЖНА обновлять сохранённый путь к обложке и ДОЛЖНА вернуть пустой результат.

#### Scenario: Clear the cover
- **WHEN** the user clicks the clear-cover action
- **THEN** the system SHALL unset `metadata.coverPath` and stop displaying a cover preview
- **RU:** Когда пользователь нажимает действие очистки обложки, система ДОЛЖНА сбросить `metadata.coverPath` и перестать показывать превью обложки.

### Requirement: Render cover preview from disk
The system SHALL render the currently configured cover image in the UI by reading the file from disk and converting it to a base64 data URL, inferring the MIME type from the file extension (`.png` → `image/png`; `.jpg`/`.jpeg` → `image/jpeg`, default `image/jpeg`).

**RU:** Система ДОЛЖНА отображать текущую настроенную обложку в UI, читая файл с диска и преобразуя его в base64 data URL, определяя MIME-тип по расширению файла (`.png` → `image/png`; `.jpg`/`.jpeg` → `image/jpeg`, по умолчанию `image/jpeg`).

#### Scenario: Cover file no longer exists
- **WHEN** the configured `coverPath` does not exist on disk when requesting the preview
- **THEN** the system SHALL return `null` instead of throwing, and the UI SHALL fall back to the empty-cover state
- **RU:** Когда настроенный `coverPath` не существует на диске в момент запроса превью, система ДОЛЖНА вернуть `null` вместо ошибки, а UI ДОЛЖЕН показать состояние отсутствия обложки.

