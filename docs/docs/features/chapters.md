---
sidebar_position: 2
---

# Chapter Editing

Chapters are what make audiobooks special. They allow listeners to navigate directly to specific parts of the book. AudioPie provides powerful chapter editing tools.

## Understanding Chapters

Each chapter in AudioPie has:

| Property | Description |
|----------|-------------|
| **Title** | The chapter name shown in players |
| **Start Time** | When the chapter begins (calculated automatically) |
| **End Time** | When the chapter ends (calculated automatically) |

Chapters are sequential and continuous — the end of one chapter is the start of the next.

## Automatic Chapter Generation

When you add tracks, AudioPie automatically creates chapters:

```
Track: 01 - Introduction.mp3 (5:30)
  → Chapter: "01 - Introduction" (0:00 - 5:30)

Track: 02 - Chapter One.mp3 (15:00)
  → Chapter: "02 - Chapter One" (5:30 - 20:30)

Track: 03 - Chapter Two.mp3 (12:30)
  → Chapter: "03 - Chapter Two" (20:30 - 33:00)
```

## Editing Chapter Titles

### Quick Edit

1. Navigate to the **Chapters** tab
2. Click on any chapter title
3. Type the new title
4. Press `Enter` or click outside to save

### Batch Rename

For consistent naming, consider a pattern like:

- `Chapter 1: The Beginning`
- `Chapter 2: First Steps`
- `Prologue`, `Epilogue`, `Afterword`

## Reordering Chapters

:::warning
Reordering chapters does NOT reorder the audio. The audio sequence is determined by the track list. Chapter reordering only affects chapter markers.
:::

To change both audio and chapter order:
1. Go to the **Tracks** panel
2. Reorder the tracks (drag and drop)
3. Chapters will automatically update

## Chapter Timing

Chapter times are calculated based on cumulative track durations:

```
Chapter 1: 0:00:00 - 0:05:30  (Track 1 duration)
Chapter 2: 0:05:30 - 0:20:30  (Track 1 + Track 2)
Chapter 3: 0:20:30 - 0:33:00  (Track 1 + Track 2 + Track 3)
```

The times are displayed in `HH:MM:SS` format for easy reference.

## Advanced Chapter Operations

### Merging Chapters

While AudioPie doesn't directly merge chapters, you can achieve this by:

1. Renaming chapters to have the same conceptual grouping
2. Or, merging the source MP3 files before importing

### Custom Chapter Points

Currently, chapters are 1:1 with tracks. For custom chapter points within a single track:

1. Use an audio editor to split the track
2. Import the split files as separate tracks
3. Name them appropriately

### Very Long Tracks

If you have a single long audio file:

1. Consider splitting it into logical chapters
2. Use tools like `mp3splt` or Audacity
3. Import the resulting files

## Best Practices

### Chapter Naming

Good chapter names are:
- ✅ Descriptive and meaningful
- ✅ Consistent in format
- ✅ Not too long (50 characters or less)

Avoid:
- ❌ Generic names like "Track 1", "Part A"
- ❌ Filenames with extensions
- ❌ Very long descriptions

### Number of Chapters

- Short books: 5-15 chapters
- Medium books: 15-30 chapters
- Long books: 30-50+ chapters

Too many very short chapters can be annoying for listeners.

## How Players Display Chapters

Different audiobook players display chapters differently:

| Player | Chapter Display |
|--------|----------------|
| Apple Books | Chapter list, seek bar markers |
| Audiobookshelf | Chapter list with timing |
| Smart AudioBook Player | Dropdown chapter selector |
| Prologue | Chapter list, tap to seek |

## Troubleshooting

### Chapters Don't Match Audio

- Ensure tracks are in the correct order
- Check track durations are reading correctly
- Rebuild the project

### Chapter Times Are Wrong

- Check if any track has incorrect duration
- Try removing and re-adding problematic tracks
- Ensure FFmpeg is working correctly (Settings)

### Chapters Not Showing in Player

Some players need to:
- Re-scan the library
- Re-import the audiobook
- Update their database

