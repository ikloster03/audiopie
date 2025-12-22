---
sidebar_position: 4
---

# Building Audiobooks

The build process converts your MP3 tracks into a single M4B audiobook file with chapters and metadata.

## Starting a Build

### Prerequisites

Before building, ensure you have:
- ✅ At least one track added
- ✅ A title set in metadata
- ✅ (Optional) Chapters organized
- ✅ (Optional) Cover art added

### Build Steps

1. Click the **Build** button (hammer icon) in the header
2. Choose the output location and filename
3. Click **Save**
4. Wait for the encoding process to complete

## Build Process

The build happens in several phases:

### Phase 1: Analyzing

AudioPie reads information from your source tracks:
- Audio codec and bitrate
- Sample rate
- Duration
- Number of channels

### Phase 2: Encoding

Each track is converted to AAC format:
- Default bitrate: 128 kbps (configurable)
- Format: AAC-LC
- Container: M4A

Progress shows as a percentage for each track.

### Phase 3: Adding Chapters

Chapter markers are embedded in the file:
- Chapter titles
- Start and end times
- Chapter index

### Phase 4: Finalizing

The final M4B is created with:
- All audio concatenated
- Metadata embedded
- Cover art attached
- File extension changed to .m4b

## Build Settings

### Output Bitrate

Configure in **Settings**:

| Bitrate | Quality | File Size |
|---------|---------|-----------|
| 64 kbps | Good (voice) | ~28 MB/hour |
| 96 kbps | Better | ~42 MB/hour |
| 128 kbps | Best | ~56 MB/hour |
| 192 kbps | Overkill | ~84 MB/hour |

For audiobooks (voice only), 64-96 kbps is usually sufficient.

### Output Location

By default, the file dialog opens to:
- Your configured default output directory, or
- Your home/Documents folder

You can set a default output directory in **Settings**.

### File Naming

The default filename is based on your book title:

```
Title: "The Great Gatsby"
Default filename: The_Great_Gatsby.m4b
```

Special characters are replaced with underscores for compatibility.

## Build Progress

During the build, a progress modal shows:

```
┌─────────────────────────────────────────┐
│           Building Audiobook            │
├─────────────────────────────────────────┤
│                                         │
│  [████████████░░░░░░░░░] 60%            │
│                                         │
│  Encoding track 3 of 5...               │
│                                         │
└─────────────────────────────────────────┘
```

:::caution
Do not close AudioPie during the build process. This may result in corrupted output.
:::

## Build Performance

Build time depends on:

| Factor | Impact |
|--------|--------|
| Total audio duration | Major |
| Number of tracks | Minor |
| Source file quality | Minor |
| Computer speed | Moderate |
| FFmpeg threads | Moderate |

Typical speeds:
- ~2-5x real-time on modern computers
- 10-hour audiobook: 2-5 minutes to build

### Optimizing Build Speed

In **Settings**, you can configure:

- **FFmpeg Threads** — More threads = faster encoding (but more CPU usage)
- Recommended: Leave at default (auto) or set to number of CPU cores

## Output File

### M4B Format

The output is a standard M4B file:
- Based on MPEG-4 container
- AAC audio codec
- Chapter markers (Nero chapters)
- Metadata tags
- Embedded cover art

### Compatibility

M4B files work with:

| Player | Platform | Support |
|--------|----------|---------|
| Apple Books | macOS, iOS | ✅ Full |
| Audiobookshelf | Web, Apps | ✅ Full |
| Smart AudioBook Player | Android | ✅ Full |
| Prologue | iOS | ✅ Full |
| VLC | All | ✅ Chapters |
| Plex | Server | ✅ Full |

## Troubleshooting

### Build Fails Immediately

- Check FFmpeg is installed/configured correctly
- Ensure all tracks are valid MP3 files
- Check disk space for output

### Build Hangs

- Very long tracks may take time
- Check FFmpeg process in Task Manager
- Try reducing FFmpeg threads in Settings

### Output Has No Audio

- Source files may be corrupted
- Try re-encoding source MP3s
- Check FFmpeg error output

### Chapters Missing

- Ensure chapters were configured
- Try rebuilding
- Check with `ffprobe` on the output file

### File Too Large

- Reduce output bitrate (64 kbps for voice)
- Ensure you're not using 192+ kbps
- Check source file quality

### Player Doesn't Recognize File

- Rename `.m4b` to `.m4a` and back
- Re-import into player
- Try a different player to verify file integrity

