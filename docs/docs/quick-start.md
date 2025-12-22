---
sidebar_position: 3
---

# Quick Start

This guide will walk you through creating your first audiobook with AudioPie in just a few minutes.

## Step 1: Launch AudioPie

After [installing](./installation) AudioPie, launch the application. You'll see the Project Manager screen.

From here, you can:
- **New Project** — Start a fresh audiobook project
- **Open Project** — Open an existing `.audiopie` project file

Click **New Project** to begin.

## Step 2: Add Audio Tracks

Once you create a new project, you'll see the main workspace with an empty track list.

### Adding Tracks

There are two ways to add MP3 tracks:

1. **Drag & Drop** — Simply drag MP3 files from your file manager and drop them onto the track list
2. **Add Tracks Button** — Click the **+ Add Tracks** button in the header and select files from the dialog

Your tracks will appear in the left panel, and chapters will be automatically generated based on the file names.

## Step 3: Organize Chapters

Switch to the **Chapters** tab in the right panel to manage your audiobook's chapter structure.

### Chapter Operations

- **Rename** — Click on a chapter title to edit it
- **Reorder** — Drag chapters to change their order
- **Merge** — Select multiple chapters and merge them into one
- **Split** — Divide a long chapter into smaller parts

Chapters are automatically timed based on your audio tracks.

## Step 4: Fill Metadata

Switch to the **Metadata** tab to add information about your audiobook:

| Field | Description |
|-------|-------------|
| **Title** | The audiobook title (required) |
| **Author** | The book's author |
| **Genre** | Book genre/category |
| **Description** | Book synopsis or description |
| **Cover** | Cover image (click to select or drag & drop) |

:::tip
The Title field is required for saving projects and building audiobooks.
:::

## Step 5: Build Your Audiobook

When you're satisfied with your chapters and metadata, it's time to build the M4B file.

1. Click the **Build** button (hammer icon) in the header
2. Choose where to save the output file
3. Wait for the encoding process to complete

A progress dialog will show you the current status:

- **Analyzing** — Reading audio file information
- **Encoding** — Converting audio to AAC format
- **Adding Chapters** — Embedding chapter markers
- **Finalizing** — Writing metadata and cover art

## Step 6: Enjoy Your Audiobook!

Once complete, your M4B file is ready to use with any audiobook player:

- **Apple Books** — Built-in support on macOS/iOS
- **Audiobookshelf** — Open-source audiobook server
- **Smart AudioBook Player** — Popular Android player
- **Prologue** — iOS audiobook player

## Saving Your Project

Don't forget to save your project! Click **Save** (or press `Ctrl+S`) to save your work as an `.audiopie` file. This lets you:

- Continue editing later
- Re-build with different settings
- Keep your chapter edits and metadata

## Next Steps

Now that you've created your first audiobook, explore these topics:

- [Working with Tracks](./features/tracks) — Advanced track management
- [Chapter Editing](./features/chapters) — Detailed chapter operations
- [Metadata Guide](./features/metadata) — Cover art and metadata tips
- [Settings](./configuration/settings) — Customize AudioPie
