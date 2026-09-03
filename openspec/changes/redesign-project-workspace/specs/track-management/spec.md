## MODIFIED Requirements

### Requirement: Reorder tracks
The system SHALL keep track order synchronized with chapter order. Track reordering SHALL be performed indirectly by dragging chapters in the Chapters view rather than through a standalone track list UI; the standalone tracks tab and its own drag-and-drop controls are removed from the primary workspace.

**RU:** Система ДОЛЖНА поддерживать порядок треков синхронизированным с порядком глав. Изменение порядка треков ДОЛЖНО выполняться косвенно — перетаскиванием глав в панели глав, а не через отдельный UI списка треков; отдельная вкладка треков и её собственные элементы drag-and-drop удаляются из основного рабочего пространства.

#### Scenario: Drag a chapter to a new position
- **WHEN** the user drags a chapter item by its handle to a new position in the chapters list
- **THEN** the system SHALL compute the new index order for the underlying tracks to match, persist it via `tracks/reorder`, and update the renderer's track list state accordingly, without exposing a separate tracks UI
- **RU:** Когда пользователь перетаскивает элемент главы за ручку на новую позицию в списке глав, система ДОЛЖНА вычислить новый порядок индексов для соответствующих треков, сохранить его через `tracks/reorder` и обновить состояние списка треков в рендерере, не показывая отдельный UI треков.
