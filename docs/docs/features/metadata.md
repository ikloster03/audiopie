---
sidebar_position: 3
---

# Metadata Management

Metadata makes your audiobook discoverable and well-organized. AudioPie supports metadata fields that are embedded in the final M4B file.

## Metadata Fields

### Required

| Field | Description |
|-------|-------------|
| **Title** | The audiobook title. Required for saving and building. |

### Recommended

| Field | Description |
|-------|-------------|
| **Author** | The book's author (writer) |
| **Genre** | Book genre or category |
| **Cover** | Cover image for the audiobook |

### Optional

| Field | Description |
|-------|-------------|
| **Description** | Synopsis or description of the book |

## Editing Metadata

1. Switch to the **Metadata** tab in the right panel
2. Fill in the desired fields
3. Metadata is auto-saved with the project

### Title

The title is the most important field:

```
Good titles:
- "The Great Gatsby"
- "Harry Potter and the Philosopher's Stone"
- "Project Hail Mary"

Avoid:
- "Audiobook"
- "Untitled"
- "Book 1"
```

### Author

The author field identifies who wrote the book:

```
Author: Andy Weir
```

For multiple authors, separate with commas:

```
Authors: James S.A. Corey, Ty Franck
```

### Genre

Use standard genre categories for better organization:

```
Good genres:
- Science Fiction
- Fantasy
- Mystery
- Biography
- Self-Help
```

## Cover Art

### Adding a Cover

There are two ways to add a cover:

1. **Click to select** — Click the cover area or "Choose Cover" button
2. **Drag & Drop** — Drag an image file directly onto the cover area

Supported formats: JPG, PNG, WebP

### Cover Requirements

For best compatibility:

| Property | Recommendation |
|----------|---------------|
| Format | JPG or PNG |
| Size | 500×500 to 1400×1400 pixels |
| Aspect Ratio | Square (1:1) |
| File Size | Under 500 KB |

:::tip Finding Covers
You can find audiobook covers on:
- [Audible](https://audible.com)
- [Goodreads](https://goodreads.com)
- [Open Library](https://openlibrary.org)
- [Libro.fm](https://libro.fm)
:::

### Cover in Players

The cover appears in:
- Player library view
- Now playing screen
- Lock screen (mobile)
- Notification area

## Description

The description field supports longer text. Use it for:

```
From the author of The Martian, a new science fiction
thriller about an astronaut who wakes up on a spaceship
with no memory of how he got there or what his mission is.

"An unforgettable story of survival and scientific ingenuity."
```

## How Metadata is Stored

AudioPie embeds metadata using standard M4B/M4A tags:

| Field | Tag |
|-------|-----|
| Title | `©nam` |
| Author | `©ART` |
| Genre | `©gen` |
| Description | `desc` |
| Cover | `covr` |

These tags are read by all major audiobook players.

## Metadata from Source Files

If your MP3 files have ID3 tags, AudioPie uses them for:
- Track display names
- Initial chapter titles

However, book-level metadata (title, author, etc.) must be entered manually.

## Best Practices

### Be Consistent

If you create multiple audiobooks:
- Use consistent naming conventions
- Format author names the same way
- Use same genre categories

### Keep It Clean

- Remove extra spaces
- Fix capitalization
- Use proper names (not nicknames)

## Troubleshooting

### Metadata Not Showing in Player

- Some players cache metadata — try rescanning
- Check if the player supports M4B metadata
- Try re-importing the audiobook

### Cover Not Displaying

- Ensure the image isn't too large (>2MB)
- Try a different image format (JPG instead of PNG)
- Check image dimensions (should be square)

### Special Characters in Title

Most special characters work fine. If issues occur:
- Avoid emojis in the title
- Use standard quotes and dashes
- Remove unusual Unicode characters
