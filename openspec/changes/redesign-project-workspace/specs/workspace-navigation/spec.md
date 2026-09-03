## ADDED Requirements

### Requirement: Sidebar-based section navigation
The system SHALL present a persistent sidebar (Discord-style) listing the primary workspace sections available for an open project (at minimum: Chapters, Metadata), replacing the previous horizontal tab bar. The sidebar SHALL remain visible while any section is active.

**RU:** Система ДОЛЖНА показывать постоянную боковую панель (в стиле Discord) со списком основных разделов рабочего пространства открытого проекта (как минимум: Главы, Метаданные), заменяя прежнюю горизонтальную панель вкладок. Боковая панель ДОЛЖНА оставаться видимой независимо от того, какой раздел активен.

#### Scenario: Open a project
- **WHEN** the user opens or creates a project and enters the editing workspace
- **THEN** the system SHALL render the sidebar with all available sections and SHALL default to the Chapters section as the active view
- **RU:** Когда пользователь открывает или создаёт проект и переходит в рабочее пространство редактирования, система ДОЛЖНА отобразить боковую панель со всеми доступными разделами и по умолчанию сделать активным раздел «Главы».

### Requirement: Active section indication
The system SHALL visually indicate which workspace section is currently active in the sidebar, and SHALL switch the main content area to the corresponding section when the user clicks a different sidebar item.

**RU:** Система ДОЛЖНА визуально показывать, какой раздел рабочего пространства активен в данный момент в боковой панели, и переключать основную область контента на соответствующий раздел, когда пользователь нажимает на другой пункт боковой панели.

#### Scenario: Switch sections
- **WHEN** the user clicks a sidebar item that is not the currently active section
- **THEN** the system SHALL mark that item as active, unmark the previous item, and render that section's content in the main area without navigating away from the current project
- **RU:** Когда пользователь нажимает на пункт боковой панели, который не является текущим активным разделом, система ДОЛЖНА пометить этот пункт как активный, снять пометку с предыдущего и отрисовать содержимое этого раздела в основной области, не покидая текущий проект.
