## ADDED Requirements

### Requirement: Play an individual MP3 track
The system SHALL let the user play any imported MP3 track from within the app, showing play/pause control, elapsed/total time, and a seek bar.

**RU:** Система ДОЛЖНА позволять пользователю воспроизводить любой импортированный MP3-трек прямо в приложении, показывая элемент управления play/pause, прошедшее/общее время и полосу перемотки.

#### Scenario: Play a track
- **WHEN** the user clicks the play affordance on a track/chapter row
- **THEN** the system SHALL load that track's audio file into the player and begin playback, updating the seek bar and elapsed time as playback progresses
- **RU:** Когда пользователь нажимает элемент воспроизведения на строке трека/главы, система ДОЛЖНА загрузить аудиофайл этого трека в плеер и начать воспроизведение, обновляя полосу перемотки и прошедшее время по мере воспроизведения.

#### Scenario: Switch tracks while one is playing
- **WHEN** the user clicks the play affordance on a different track while another is currently playing
- **THEN** the system SHALL stop the currently playing track and start playback of the newly selected track from its beginning
- **RU:** Когда пользователь нажимает элемент воспроизведения на другом треке, пока играет текущий, система ДОЛЖНА остановить текущий трек и начать воспроизведение вновь выбранного трека с начала.

#### Scenario: Pause and resume
- **WHEN** the user clicks pause while a track is playing, and later clicks play again
- **THEN** the system SHALL pause at the current position and resume playback from that same position, respectively
- **RU:** Когда пользователь нажимает паузу во время воспроизведения трека, а позже снова нажимает play, система ДОЛЖНА поставить воспроизведение на паузу в текущей позиции и, соответственно, возобновить его с той же позиции.

### Requirement: Play the last built M4B with chapter seeking
The system SHALL let the user play the most recently successfully built M4B output file, and SHALL let the user jump playback to the start of any chapter from the project's chapter list.

**RU:** Система ДОЛЖНА позволять пользователю воспроизводить последний успешно собранный M4B-файл и переходить воспроизведением к началу любой главы из списка глав проекта.

#### Scenario: Build completes successfully
- **WHEN** a build finishes successfully
- **THEN** the system SHALL offer a "play result" action that loads the newly built M4B file into the player
- **RU:** Когда сборка успешно завершается, система ДОЛЖНА предложить действие «прослушать результат», которое загружает только что собранный M4B-файл в плеер.

#### Scenario: Jump to a chapter
- **WHEN** the user selects a chapter from the chapter selector while the built M4B is loaded in the player
- **THEN** the system SHALL seek playback to that chapter's `startMs` and continue (or begin) playback from there
- **RU:** Когда пользователь выбирает главу из селектора глав, пока в плеере загружен собранный M4B, система ДОЛЖНА перемотать воспроизведение к `startMs` этой главы и продолжить (или начать) воспроизведение оттуда.

#### Scenario: No build output available yet
- **WHEN** the user has not yet successfully built the project in the current session (no known output path)
- **THEN** the "play result" action SHALL be disabled or hidden rather than attempting to load a nonexistent file
- **RU:** Когда пользователь ещё не выполнил успешную сборку проекта в текущей сессии (нет известного пути к результату), действие «прослушать результат» ДОЛЖНО быть отключено или скрыто, а не пытаться загрузить несуществующий файл.

### Requirement: Player state is transient
The system SHALL treat player state (currently loaded file, playback position, play/pause status) as UI-only state that resets on project open/close and SHALL NOT persist it to the `.audiopie` project file.

**RU:** Система ДОЛЖНА рассматривать состояние плеера (загруженный файл, позиция воспроизведения, статус play/pause) как состояние только для UI, которое сбрасывается при открытии/закрытии проекта, и НЕ ДОЛЖНА сохранять его в файл проекта `.audiopie`.

#### Scenario: Close and reopen a project
- **WHEN** the user closes the current project (returns to the Project Manager) and opens a project again
- **THEN** the player SHALL reset to an empty/stopped state rather than resuming previous playback
- **RU:** Когда пользователь закрывает текущий проект (возвращается в менеджер проектов) и снова открывает проект, плеер ДОЛЖЕН сброситься в пустое/остановленное состояние, а не возобновлять предыдущее воспроизведение.
