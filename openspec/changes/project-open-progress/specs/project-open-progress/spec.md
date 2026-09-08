## ADDED Requirements

### Requirement: Blocking overlay while a container project extracts
The system SHALL show a full-screen overlay that blocks all user interaction for the entire duration of extracting a container-format `.audiopie` file into the working directory. The overlay SHALL NOT be dismissable by clicking outside, pressing Escape, or a close/cancel control.

**RU:** Система ДОЛЖНА показывать полноэкранный оверлей, блокирующий любое взаимодействие пользователя на всё время распаковки контейнерного `.audiopie` в рабочую директорию. Оверлей НЕ ДОЛЖЕН закрываться кликом снаружи, клавишей Escape или элементом закрытия/отмены.

#### Scenario: Overlay blocks a second Open while extract is running
- **WHEN** a container extract is in progress after the user chose a project file
- **THEN** the system SHALL keep the overlay visible and SHALL NOT start a second open, and clicks on the project-manager cards, theme, and language controls SHALL have no effect
- **RU:** Когда после выбора файла идёт распаковка контейнера, система ДОЛЖНА держать оверлей видимым и НЕ ДОЛЖНА начинать второе открытие, а клики по карточкам менеджера проектов, переключателям темы и языка НЕ ДОЛЖНЫ иметь эффекта.

#### Scenario: Overlay is not dismissable
- **WHEN** the extract overlay is visible
- **THEN** clicking the dimmed backdrop, pressing Escape, or looking for a cancel/close control SHALL NOT hide the overlay or abort the extract
- **RU:** Когда оверлей распаковки виден, клик по затемнённому фону, Escape или поиск кнопки отмены/закрытия НЕ ДОЛЖНЫ скрыть оверлей или прервать распаковку.

### Requirement: Byte-weighted determinate progress
The system SHALL report extract progress as uncompressed bytes transferred over uncompressed bytes total (not as a count of ZIP entries), and SHALL display a determinate progress bar, a percent, and a human-readable transferred/total size. While total size is not yet known (central-directory scan), the system SHALL show a preparing state rather than a determinate bar that appears stuck at 0%.

**RU:** Система ДОЛЖНА сообщать прогресс распаковки как отношение переданных несжатых байт к их сумме (не как число записей ZIP) и ДОЛЖНА показывать детерминированный прогресс-бар, проценты и человекочитаемый размер transferred/total. Пока суммарный размер ещё неизвестен (обход central directory), система ДОЛЖНА показывать состояние подготовки, а не детерминированный бар, застывший на 0%.

#### Scenario: Progress advances during a single large audio entry
- **WHEN** the archive contains one large MP3 that accounts for most of its uncompressed size
- **THEN** the progress bar SHALL advance while that entry is streaming to disk, not only when the entry completes
- **RU:** Когда архив содержит один большой MP3, составляющий большую часть несжатого размера, прогресс-бар ДОЛЖЕН расти пока эта запись пишется на диск, а не только в момент её завершения.

#### Scenario: Preparing state before byte totals are known
- **WHEN** extract has started but the total uncompressed size has not yet been computed
- **THEN** the overlay SHALL be visible and SHALL show a preparing/indeterminate message rather than a determinate 0% bar as the only feedback
- **RU:** Когда распаковка началась, но суммарный несжатый размер ещё не вычислен, оверлей ДОЛЖЕН быть виден и ДОЛЖЕН показывать сообщение о подготовке/неопределённый статус, а не детерминированный бар на 0% как единственную обратную связь.

#### Scenario: Progress reaches 100% when extract completes
- **WHEN** container extract finishes successfully
- **THEN** the last reported progress SHALL have percent 100 and transferred equal to total before the overlay is dismissed
- **RU:** Когда распаковка контейнера успешно завершается, последний сообщённый прогресс ДОЛЖЕН иметь 100% и transferred равный total до снятия оверлея.

### Requirement: Overlay lifecycle is tied to extract, not the file dialog
The system SHALL show the extract overlay only after the user has confirmed a file path, and SHALL hide it when extract finishes (success or failure) or when the opened snapshot is rejected by the existing UI completeness check. The system SHALL NOT show the overlay while the native open dialog is open, when the dialog is cancelled, or when the chosen file is a legacy plain-JSON `.audiopie`.

**RU:** Система ДОЛЖНА показывать оверлей распаковки только после подтверждения пути к файлу и ДОЛЖНА скрывать его, когда распаковка заканчивается (успех или ошибка) или когда открытый снимок отвергается существующей проверкой полноты UI. Система НЕ ДОЛЖНА показывать оверлей, пока открыт нативный диалог, когда диалог отменён, или когда выбранный файл — старый plain-JSON `.audiopie`.

#### Scenario: Cancelled dialog never shows the overlay
- **WHEN** the user cancels the native open-file dialog
- **THEN** the system SHALL NOT show the extract overlay and SHALL leave the project manager unchanged
- **RU:** Когда пользователь отменяет нативный диалог открытия файла, система НЕ ДОЛЖНА показывать оверлей распаковки и ДОЛЖНА оставить менеджер проектов без изменений.

#### Scenario: Legacy JSON open skips the overlay
- **WHEN** the user opens a legacy plain-JSON `.audiopie` file
- **THEN** the system SHALL NOT show the extract overlay
- **RU:** Когда пользователь открывает старый plain-JSON файл `.audiopie`, система НЕ ДОЛЖНА показывать оверлей распаковки.

#### Scenario: Overlay dismisses on extract error
- **WHEN** extract fails (unreadable ZIP, I/O error, or similar)
- **THEN** the system SHALL hide the overlay, SHALL NOT enter the open-project editor, and SHALL surface an error to the user
- **RU:** Когда распаковка заканчивается ошибкой (нечитаемый ZIP, ошибка I/O и т.п.), система ДОЛЖНА скрыть оверлей, НЕ ДОЛЖНА входить в редактор открытого проекта и ДОЛЖНА показать ошибку пользователю.

#### Scenario: Overlay dismisses when completeness check rejects the project
- **WHEN** a container extract succeeds but the renderer rejects the snapshot via the existing audiobook completeness check
- **THEN** the system SHALL hide the overlay and SHALL remain on the project manager
- **RU:** Когда распаковка контейнера проходит успешно, но рендерер отвергает снимок существующей проверкой полноты аудиокниги, система ДОЛЖНА скрыть оверлей и ОСТАТЬСЯ на менеджере проектов.
