---
sidebar_position: 10
---

# Frequently Asked Questions

Common questions and answers about AudioPie.

## General

### What is AudioPie?

AudioPie is a desktop application that converts MP3 audio files into M4B audiobook format with chapter markers, metadata, and cover art.

### Is AudioPie free?

Yes! AudioPie is free and open-source under the MIT license.

### What platforms does AudioPie support?

AudioPie runs on:
- 🐧 Linux (AppImage)
- 🪟 Windows (Installer)
- 🍎 macOS (DMG)

### What file formats are supported?

**Input**: MP3 files only (more formats planned)

**Output**: M4B (MPEG-4 audiobook)

## Audiobook Creation

### How do I create an audiobook?

1. Add your MP3 tracks
2. Arrange chapters
3. Fill in metadata (title, author, etc.)
4. Add cover art (optional)
5. Click Build

See the [Quick Start](./quick-start) guide for details.

### Can I add files other than MP3?

Currently, only MP3 files are supported. Support for WAV, FLAC, and other formats is planned for future versions.

### How long does building take?

Typically 2-5x real-time speed:
- 10-hour audiobook: 2-5 minutes
- 30-hour audiobook: 6-15 minutes

Depends on your computer's speed and settings.

### Why is my output file so large?

File size depends on bitrate:
- 128 kbps = ~56 MB per hour
- 64 kbps = ~28 MB per hour

For smaller files, reduce bitrate in Settings. 64 kbps is excellent for spoken word.

## Chapters

### Can I create chapters manually?

Chapters are created automatically from your tracks. Each track becomes one chapter.

For custom chapter points, split your audio files before importing.

### How do I merge chapters?

Currently, chapters are 1:1 with tracks. To merge chapters:
1. Merge the source MP3 files using an audio editor
2. Import the merged file as one track

### Why are chapter times wrong?

Chapter times are calculated from track durations. If times are wrong:
- Check if source files have correct duration
- Try removing and re-adding problematic tracks
- Ensure FFmpeg is working correctly

## Audio Quality

### What bitrate should I use?

For audiobooks (spoken word):
- **64 kbps** — Good quality, smallest files
- **96 kbps** — Better quality, recommended
- **128 kbps** — Best quality for voice

Higher bitrates (192+) are unnecessary for speech.

### Will converting affect audio quality?

AudioPie re-encodes MP3 to AAC. Quality loss is minimal at recommended bitrates. AAC at 64 kbps sounds comparable to MP3 at 96 kbps.

### Can I keep original quality?

For minimal quality loss:
- Use 128 kbps or higher output bitrate
- Start with high-quality source files
- Avoid multiple re-encodings

## Compatibility

### Which players support M4B?

All major audiobook players:
- Apple Books (macOS, iOS)
- Audiobookshelf
- Smart AudioBook Player (Android)
- Prologue (iOS)
- Plex
- VLC

### Why doesn't my player show chapters?

Some players need to:
- Re-scan the library
- Re-import the audiobook
- Update their database

Try removing and re-adding the audiobook.

### Can I use M4B files on Kindle?

Kindle devices don't support M4B natively. Options:
- Use Audible format instead
- Convert M4B to Audible using other tools
- Use a different player app on Kindle Fire

## Projects

### Where are projects saved?

Projects are saved as `.audiopie` files wherever you choose. Settings are stored in your system's app data folder.

### Can I edit a project on another computer?

Yes, but ensure:
- The `.audiopie` file is copied
- All source MP3 files are in the same relative locations
- Or re-link the files after opening

### Why can't I save my project?

To save, you need:
- At least one track added
- A title in metadata

Add these and try again.

## Troubleshooting

### AudioPie won't start

**Linux**: Ensure AppImage has execute permission
```bash
chmod +x AudioPie_*.AppImage
```

**macOS**: Allow in System Preferences → Security & Privacy

**Windows**: If blocked by Defender, click "More info" → "Run anyway"

### Build fails with FFmpeg error

1. Try using bundled FFmpeg (clear custom paths in Settings)
2. Update FFmpeg to latest version
3. Check source files aren't corrupted

### Tracks show 0:00 duration

- Source file may be corrupted
- FFmpeg might not be configured correctly
- Try re-encoding the source file

### Application is slow

- Check available disk space
- Close other applications
- Reduce number of tracks per project
- Try restarting AudioPie

## Feature Requests

### Will you add [feature]?

Check [GitHub Issues](https://github.com/ikloster03/audiopie/issues) for existing requests or create a new one!

Planned features:
- Support for more audio formats
- Chapter splitting within tracks
- Batch project building
- Audiobook playback preview

### How can I contribute?

AudioPie is open source! You can:
- Report bugs on GitHub
- Submit feature requests
- Contribute code via pull requests
- Help with translations

## Support

### Where can I get help?

1. Check this FAQ
2. Search [GitHub Issues](https://github.com/ikloster03/audiopie/issues)
3. Create a new issue with detailed information

### How do I report a bug?

Create an issue on GitHub with:
- AudioPie version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Any error messages

