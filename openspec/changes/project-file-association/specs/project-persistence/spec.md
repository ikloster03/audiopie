## ADDED Requirements

### Requirement: Open a project from an OS-supplied path
The system SHALL allow a `.audiopie` project to be opened from a filesystem path supplied by the operating system, not only from the in-app native open dialog. That path SHALL go through the same load implementation as a dialog-chosen path (format detection, container extract or legacy JSON parse, completeness check). Paths already owned by a window SHALL focus that window instead of loading a second session.

**RU:** Система ДОЛЖНА позволять открывать проект `.audiopie` по пути, переданному операционной системой, а не только из нативного диалога открытия в приложении. Этот путь ДОЛЖЕН проходить ту же реализацию загрузки, что и путь, выбранный в диалоге (определение формата, распаковка контейнера или разбор legacy JSON, проверка полноты). Пути, уже принадлежащие окну, ДОЛЖНЫ фокусировать это окно вместо загрузки второй сессии.

#### Scenario: OS path loads like a dialog path
- **WHEN** the OS supplies a `.audiopie` path that is not already open
- **THEN** the system SHALL detect format and load that project into the window chosen by Rule A, using the same extract-or-parse behavior as `openPath` after the open dialog
- **RU:** Когда ОС передаёт путь `.audiopie`, который ещё не открыт, система ДОЛЖНА определить формат и загрузить этот проект в окно, выбранное правилом A, с тем же поведением extract-or-parse, что и `openPath` после диалога открытия

#### Scenario: OS path that is already open does not reload
- **WHEN** the OS supplies a `.audiopie` path already owned by a window
- **THEN** the system SHALL focus that window and SHALL NOT extract, parse, or overwrite that window's session
- **RU:** Когда ОС передаёт путь `.audiopie`, уже принадлежащий окну, система ДОЛЖНА сфокусировать это окно и НЕ ДОЛЖНА распаковывать, разбирать или перезаписывать сессию этого окна
