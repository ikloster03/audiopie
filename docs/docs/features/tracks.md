---
sidebar_position: 1
---

# Working with Tracks

The track list is the foundation of your audiobook project. This guide covers everything you need to know about managing audio tracks in AudioPie.

## Adding Tracks

### Drag and Drop

The quickest way to add tracks is drag and drop:

1. Open your file manager
2. Select one or more MP3 files
3. Drag them to the AudioPie track list
4. Drop to add them to your project

### File Dialog

Alternatively, use the file dialog:

1. Click the **+ Add Tracks** button in the header
2. Navigate to your audio files
3. Select one or multiple files (hold `Ctrl` or `Shift` for multi-select)
4. Click **Open**

:::tip
AudioPie currently supports **MP3** files only. Other formats (WAV, FLAC, OGG) will be added in future versions.
:::

## Track List Features

### Track Information

Each track displays:
- **Track number** — Position in the list
- **Title** — Display name (from filename or ID3 tags)
- **Duration** — Length in HH:MM:SS format

### Reordering Tracks

Tracks can be reordered via drag and drop:

1. Click and hold on a track
2. Drag it to the desired position
3. Release to drop

The track numbers will automatically update.

### Removing Tracks

To remove a track:

1. Hover over the track
2. Click the **×** (delete) button on the right
3. The track is removed immediately

:::caution
Removing a track also removes its associated chapter. This action cannot be undone.
:::

## Track to Chapter Mapping

When you add tracks, AudioPie automatically creates chapters based on the track information:

| Track Property | Chapter Property |
|---------------|------------------|
| Filename | Chapter title |
| Duration | Chapter end time |
| Order | Chapter order |

If you rearrange tracks, the associated chapters are also rearranged.

## Best Practices

### File Naming

For best results, name your MP3 files descriptively:

```
Good:
├── 01 - Introduction.mp3
├── 02 - Chapter 1 - The Beginning.mp3
├── 03 - Chapter 2 - The Journey.mp3
└── 04 - Epilogue.mp3

Avoid:
├── track001.mp3
├── track002.mp3
├── audio_20231215_recording.mp3
└── final_v2_FIXED.mp3
```

### Audio Quality

- Use consistent bitrate across all tracks
- Recommended: 128 kbps or 64 kbps for voice
- Ensure all tracks have the same sample rate

### Track Order

- Add tracks in the correct order, or
- Use drag and drop to reorder after adding
- Number prefixes (01, 02, 03) help maintain order when importing

## Troubleshooting

### Track Won't Add

If a track fails to add:
- Ensure it's a valid MP3 file
- Check file permissions
- Try re-encoding the file with another tool

### Duration Shows as 0:00

If duration displays incorrectly:
- The file may be corrupted
- Try re-encoding the file
- Check FFmpeg installation in Settings

### Playback Order Incorrect

If chapters appear out of order:
- Reorder tracks in the track list
- Chapters will update automatically

