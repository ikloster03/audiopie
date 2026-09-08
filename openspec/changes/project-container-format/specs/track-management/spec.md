## MODIFIED Requirements

### Requirement: Select and import MP3 tracks
The system SHALL let the user add MP3 tracks via a native file dialog from the Chapters toolbar, or by dropping `.mp3` files onto the workspace main area. For each imported file, the system SHALL copy it into the current book's folder within the project's working directory, probe duration via FFprobe on the copied file, and derive a default display title from the original file name.

**RU:** Система ДОЛЖНА позволять добавлять MP3 через диалог из тулбара глав или drop на основную область. Для каждого файла система ДОЛЖНА скопировать его в папку текущей книги внутри рабочей директории проекта, определить длительность через FFprobe у скопированного файла и вывести название по умолчанию из исходного имени файла.

#### Scenario: Add tracks via file dialog
- **WHEN** the user activates "Add tracks" in the Chapters view and selects one or more MP3 files
- **THEN** the system SHALL copy each selected file into the current book's working-directory folder, probe each copy's duration, append tracks referencing the copies, and append matching chapters without regenerating existing chapter titles
- **RU:** Когда пользователь добавляет треки из панели глав, система ДОЛЖНА скопировать каждый выбранный файл в папку текущей книги в рабочей директории, определить длительность каждой копии, добавить треки со ссылками на копии и главы, не перегенерируя существующие названия глав.

#### Scenario: Add tracks via drag and drop
- **WHEN** the user drops files onto the workspace main area
- **THEN** the system SHALL keep only `.mp3` files and add them the same way as files chosen via the dialog, copying each into the current book's working-directory folder
- **RU:** Когда пользователь бросает файлы на основную область, система ДОЛЖНА оставить только `.mp3` и добавить их как через диалог, копируя каждый в папку текущей книги в рабочей директории.

#### Scenario: Some files fail to probe
- **WHEN** one or more dropped/selected files fail duration probing after being copied (e.g. corrupt or unsupported file)
- **THEN** the system SHALL still add the files that succeeded, SHALL remove the copied file for any that failed probing, and SHALL report the failures as a message sent over the build progress channel (`phase: 'probe'`), which the renderer surfaces as an alert
- **RU:** Когда один или несколько скопированных файлов не удаётся проанализировать (например, повреждён или не поддерживается), система ДОЛЖНА всё равно добавить успешно обработанные файлы, удалить скопированный файл для неудачных и сообщить об ошибках через канал прогресса сборки (`phase: 'probe'`), который рендерер показывает как alert.

### Requirement: Remove tracks
The system SHALL allow removing a track from the Chapters view by removing that chapter row's source file, which SHALL also delete the track's copied file from the project's working directory. Remaining tracks SHALL keep their relative order.

**RU:** Система ДОЛЖНА позволять удалять трек из панели глав удалением исходника строки главы, что ДОЛЖНО также удалить скопированный файл трека из рабочей директории проекта. Относительный порядок оставшихся треков сохраняется.

#### Scenario: Remove a chapter's source file
- **WHEN** the user clicks remove on a chapter row
- **THEN** the system SHALL remove that track and its paired chapter, delete the track's copied file from the working directory, and recompute remaining chapter times from remaining track durations
- **RU:** Когда пользователь нажимает удаление на строке главы, система ДОЛЖНА удалить этот трек и парную главу, удалить скопированный файл трека из рабочей директории и пересчитать время оставшихся глав.
