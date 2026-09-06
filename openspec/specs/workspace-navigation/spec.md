# workspace-navigation Specification

## Purpose
Primary workspace navigation via a persistent sidebar (Chapters, Metadata, Settings), replacing the old tab bar and header; includes sidebar modes and floating Save/Build actions.

**RU:** Основная навигация по рабочему пространству через постоянную боковую панель (Главы, Метаданные, Настройки), заменяющую вкладки и верхнюю шапку; включает режимы сайдбара и float-кнопки Сохранить/Собрать.

## Requirements
### Requirement: Sidebar-based section navigation
The system SHALL present a persistent sidebar listing the primary workspace sections for an open project (Chapters, Metadata, Settings), replacing the previous horizontal tab bar and top header. The sidebar SHALL remain visible while any section is active. The sidebar top SHALL show the AudioPie logo; in expanded mode it SHALL also show the "AudioPie" title.

**RU:** Система ДОЛЖНА показывать постоянную боковую панель с разделами Главы, Метаданные, Настройки, заменяя вкладки и верхнюю шапку. Сверху — логотип; в расширенном режиме также подпись «AudioPie».

#### Scenario: Open a project
- **WHEN** the user opens or creates a project and enters the editing workspace
- **THEN** the system SHALL render the sidebar with all available sections and SHALL default to the Chapters section as the active view
- **RU:** Когда пользователь открывает или создаёт проект, система ДОЛЖНА показать сайдбар и сделать активным раздел «Главы».

### Requirement: Active section indication
The system SHALL visually indicate which workspace section is currently active in the sidebar, and SHALL switch the main content area to the corresponding section when the user clicks a different sidebar item. Settings SHALL render as a full page in the main area, not a modal dialog.

**RU:** Система ДОЛЖНА выделять активный раздел и переключать контент по клику. Настройки ДОЛЖНЫ открываться страницей в основной области, не модалкой.

#### Scenario: Switch sections
- **WHEN** the user clicks a sidebar item that is not the currently active section
- **THEN** the system SHALL mark that item as active, unmark the previous item, and render that section's content in the main area without leaving the current project
- **RU:** Когда пользователь выбирает другой пункт сайдбара, система ДОЛЖНА сменить активный пункт и показать соответствующий контент, не закрывая проект.

### Requirement: Expanded and minimal sidebar modes
The system SHALL support two sidebar presentations, persisted as `sidebarMode` in application settings: `expanded` (default) with icon plus label, and `minimal` with logo only and icon-only buttons. In minimal mode, items SHALL use Discord-like round-to-squircle hover/active styling without a left selection stripe, and SHALL show a tooltip with the section name on hover.

**RU:** Система ДОЛЖНА поддерживать два вида сайдбара, сохраняемых как `sidebarMode`: `expanded` (по умолчанию, иконка + подпись) и `minimal` (только логотип и иконки). В минимальном режиме — Discord-like круг→скруглённый квадрат, без полоски слева, с тултипом названия.

#### Scenario: Switch to minimal mode
- **WHEN** the user selects Minimal in Settings
- **THEN** the system SHALL persist `sidebarMode: 'minimal'` immediately and render the icon-only sidebar
- **RU:** Когда пользователь выбирает «Минимальная» в настройках, система ДОЛЖНА сразу сохранить `sidebarMode: 'minimal'` и показать сайдбар только с иконками.

#### Scenario: Switch to expanded mode
- **WHEN** the user selects Expanded in Settings
- **THEN** the system SHALL persist `sidebarMode: 'expanded'` immediately and render labels next to icons plus the AudioPie title beside the logo
- **RU:** Когда пользователь выбирает «Расширенная», система ДОЛЖНА сразу сохранить `expanded` и показать подписи и название рядом с логотипом.

### Requirement: Floating save and build actions
On the Chapters and Metadata sections the system SHALL show icon-only floating actions: Save (medium) stacked above Build (large), each with a hover tooltip. These actions SHALL NOT appear on the Settings page. The stack SHALL hide with a downward slide-and-fade when the user scrolls the section content down, SHALL reappear when the user scrolls up, and SHALL be visible when the scroll position is at the top.

**RU:** На страницах Глав и Метаданных система ДОЛЖНА показывать float-кнопки-иконки: Сохранить (средняя) над Собрать (большая), с тултипами. На странице Настроек их быть не должно. Стек ДОЛЖЕН скрываться со слайдом вниз при скролле вниз, показываться при скролле вверх и быть видимым у верхнего края списка.

#### Scenario: Scroll down then up
- **WHEN** the user scrolls the Chapters or Metadata content downward past a small threshold
- **THEN** the system SHALL hide the floating Save/Build stack with a short transform/opacity animation
- **AND WHEN** the user then scrolls upward (or returns near the top)
- **THEN** the system SHALL show the stack again with the same animation reversed
- **RU:** Когда пользователь скроллит контент глав/метаданных вниз, система ДОЛЖНА скрыть стек float-кнопок анимацией; при скролле вверх или у верха списка — снова показать.
