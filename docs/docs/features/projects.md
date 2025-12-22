---
sidebar_position: 5
---

# Project Management

AudioPie projects allow you to save your work and continue later. This is especially useful for complex audiobooks that require multiple editing sessions.

## Project Files

AudioPie projects are saved as `.audiopie` files. These JSON-based files contain:

- Track list and order
- Chapter configuration
- Metadata (title, author, etc.)
- Cover art reference
- Settings specific to the project

## Creating a Project

### New Project

1. Launch AudioPie
2. Click **New Project** in the Project Manager
3. Start adding tracks and editing

### From Existing Files

1. Launch AudioPie
2. Click **New Project**
3. Drag and drop your MP3 files
4. Save the project

## Saving Projects

### Save

Press `Ctrl+S` or click the **Save** button (disk icon):

- First save: Opens file dialog to choose location
- Subsequent saves: Saves to the same location

### Save Requirements

To save a project, you need:
- ✅ At least one track
- ✅ A title in metadata

If these aren't met, you'll see an error notification.

### Auto-Save

Currently, AudioPie does not auto-save. Remember to save your work frequently!

## Opening Projects

### From Project Manager

1. Launch AudioPie
2. Click **Open Project**
3. Select your `.audiopie` file
4. Click **Open**

### From File Manager

You can also double-click an `.audiopie` file in your file manager to open it in AudioPie (if file associations are configured).

## Project Structure

### What's Saved

| Data | Saved |
|------|-------|
| Track paths | ✅ |
| Track order | ✅ |
| Chapter titles | ✅ |
| Chapter order | ✅ |
| All metadata | ✅ |
| Cover path | ✅ |

### What's NOT Saved

| Data | Saved |
|------|-------|
| Audio data | ❌ (referenced, not embedded) |
| Build output | ❌ |
| Global settings | ❌ (stored separately) |

:::important
Project files reference your audio files by path. If you move or delete the original MP3 files, the project won't be able to find them.
:::

## Closing Projects

To close the current project:

1. Click the **Close** button (X icon) in the header
2. You'll return to the Project Manager

:::caution
Unsaved changes will be lost! AudioPie will warn you if you have unsaved work.
:::

## Project Portability

### Moving Projects

If you need to move a project to another computer:

1. Copy the `.audiopie` file
2. Copy all referenced MP3 files
3. Maintain the same folder structure, OR
4. Update paths after opening on new computer

### Best Practice

Keep project files with their audio:

```
My Audiobook/
├── My Audiobook.audiopie
├── tracks/
│   ├── 01 - Introduction.mp3
│   ├── 02 - Chapter One.mp3
│   └── ...
└── cover.jpg
```

## Project Workflow Tips

### Naming Conventions

Use descriptive project names:

```
Good:
- "The Great Gatsby - F. Scott Fitzgerald.audiopie"
- "Dune Book 1.audiopie"

Avoid:
- "project1.audiopie"
- "audiobook.audiopie"
- "untitled.audiopie"
```

### Version Control

For complex projects, consider keeping versions:

```
Project Hail Mary v1.audiopie    (initial import)
Project Hail Mary v2.audiopie    (chapters edited)
Project Hail Mary final.audiopie (ready to build)
```

### Backup Strategy

Back up both:
- Your `.audiopie` project files
- Your source MP3 files
- Your cover images

## Troubleshooting

### "File Not Found" Errors

If tracks show errors after opening:
- Source MP3 files were moved or deleted
- Restore files to original location, OR
- Remove and re-add the tracks

### Project Won't Open

- File may be corrupted
- Try opening in a text editor to check JSON validity
- Check if it's a valid `.audiopie` file

### Changes Not Saving

Ensure:
- You have write permissions to the save location
- Disk isn't full
- File isn't open in another application

