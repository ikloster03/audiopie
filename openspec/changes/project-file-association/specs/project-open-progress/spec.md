## ADDED Requirements

### Requirement: Overlay can start from an OS-supplied path
The extract overlay SHALL appear when a container extract is started because the OS supplied a `.audiopie` path, not only when the path came from the in-app open dialog. The overlay SHALL still NOT appear for a cancelled dialog, a legacy JSON open, or a `focused-existing` result.

**RU:** Оверлей распаковки ДОЛЖЕН появляться, когда распаковка контейнера начата потому, что ОС передала путь `.audiopie`, а не только когда путь пришёл из диалога открытия в приложении. Оверлей по-прежнему НЕ ДОЛЖЕН появляться для отменённого диалога, открытия legacy JSON или результата `focused-existing`.

#### Scenario: OS-open of a container shows the overlay
- **WHEN** the OS supplies a container-format `.audiopie` path that is not already open and the target window begins extract
- **THEN** that window SHALL show the same blocking extract overlay as after a dialog-chosen container path
- **RU:** Когда ОС передаёт путь контейнерного `.audiopie`, который ещё не открыт, и целевое окно начинает распаковку, это окно ДОЛЖНО показать тот же блокирующий оверлей распаковки, что и после пути контейнера, выбранного в диалоге
