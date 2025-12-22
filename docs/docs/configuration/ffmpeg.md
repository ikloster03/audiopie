---
sidebar_position: 2
---

# FFmpeg Configuration

AudioPie uses [FFmpeg](https://ffmpeg.org/) for audio processing. This guide covers FFmpeg configuration and troubleshooting.

## What is FFmpeg?

FFmpeg is a powerful open-source tool for handling multimedia files. AudioPie uses it to:

- Read MP3 file information (FFprobe)
- Convert MP3 to AAC
- Combine audio tracks
- Embed chapters and metadata
- Add cover art

## Bundled FFmpeg

AudioPie includes a bundled version of FFmpeg that works out of the box:

- **No configuration required**
- Works on all platforms
- Tested for compatibility

The bundled FFmpeg is used by default when no custom path is set.

## Using System FFmpeg

If you prefer using your system's FFmpeg installation:

### Linux

```bash
# Check if FFmpeg is installed
ffmpeg -version
ffprobe -version

# Install if needed (Ubuntu/Debian)
sudo apt install ffmpeg

# Install if needed (Fedora)
sudo dnf install ffmpeg

# Install if needed (Arch)
sudo pacman -S ffmpeg
```

Typical paths:
- `/usr/bin/ffmpeg`
- `/usr/bin/ffprobe`

### Windows

1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add to PATH or set in AudioPie settings

Typical paths:
- `C:\ffmpeg\bin\ffmpeg.exe`
- `C:\ffmpeg\bin\ffprobe.exe`

### macOS

```bash
# Install with Homebrew
brew install ffmpeg

# Check installation
which ffmpeg
which ffprobe
```

Typical paths:
- `/usr/local/bin/ffmpeg`
- `/opt/homebrew/bin/ffmpeg` (Apple Silicon)

## Configuring Custom FFmpeg

To use a custom FFmpeg installation:

1. Open **Settings** (gear icon)
2. Set **FFmpeg Path** to your `ffmpeg` executable
3. Set **FFprobe Path** to your `ffprobe` executable
4. Close Settings to save

### Verifying Configuration

After setting custom paths, try adding a track to verify:
- If successful, FFmpeg is working correctly
- If errors occur, check the paths

## FFmpeg Requirements

AudioPie requires FFmpeg with these codecs:

| Codec | Purpose | Required |
|-------|---------|----------|
| libmp3lame | Read MP3 files | ✅ |
| aac | Encode AAC audio | ✅ |
| mov/mp4 | M4B container | ✅ |

Most FFmpeg builds include these by default.

### Checking Codec Support

```bash
# Check for MP3 support
ffmpeg -codecs | grep mp3

# Check for AAC support
ffmpeg -codecs | grep aac

# Check for M4B/M4A support
ffmpeg -formats | grep m4a
```

## Troubleshooting

### "FFmpeg not found"

1. Check if paths are set correctly in Settings
2. Verify FFmpeg is executable:
   ```bash
   chmod +x /path/to/ffmpeg
   ```
3. Try clearing the paths to use bundled FFmpeg

### "FFprobe not found"

FFprobe is usually installed alongside FFmpeg. If missing:

1. Reinstall FFmpeg completely
2. Download from official sources
3. Ensure both binaries are from the same version

### Encoding Fails

```
Error: Encoding failed...
```

Possible causes:
- Source file is corrupted
- Insufficient disk space
- FFmpeg doesn't have write permissions
- Incompatible FFmpeg version

Solutions:
- Try bundled FFmpeg (clear custom paths)
- Re-encode source files with another tool
- Check disk space
- Update FFmpeg to latest version

### Slow Encoding

If encoding is very slow:

1. Check **FFmpeg Threads** setting
2. Ensure you're not running other intensive tasks
3. Consider reducing output bitrate
4. Check CPU usage during encoding

### Wrong Duration Detected

If track durations are incorrect:

```bash
# Check file directly
ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 \
  "path/to/file.mp3"
```

If FFprobe reports wrong duration:
- Source file may have issues
- Try re-encoding the source
- Check for VBR (Variable Bit Rate) issues

### Chapters Not Working

If chapters don't appear in the output:

1. Verify chapters are configured in AudioPie
2. Check FFmpeg version supports Nero chapters:
   ```bash
   ffmpeg -version
   # Should be 4.0 or newer
   ```
3. Try building a simple test case

## FFmpeg Version Compatibility

AudioPie is tested with:
- FFmpeg 4.x
- FFmpeg 5.x
- FFmpeg 6.x

Older versions (3.x and below) may have issues.

### Checking Your Version

```bash
ffmpeg -version
# FFmpeg 6.0 or newer recommended
```

## Advanced Configuration

### Custom FFmpeg Build

If you need a custom FFmpeg build:

```bash
# Example: Build with specific options
./configure --enable-gpl --enable-libmp3lame --enable-libfdk-aac
make -j8
sudo make install
```

### Using FFmpeg from Container

If running AudioPie with Docker/Flatpak:
- FFmpeg must be available inside the container
- Use bundled FFmpeg for best compatibility

## Performance Tips

### Encoding Speed

| Threads | Speed | CPU Usage |
|---------|-------|-----------|
| 1 | Slow | Low |
| 2 | Moderate | Medium |
| 4 | Fast | High |
| 8+ | Very Fast | Very High |

### Quality vs Speed

For faster builds with same quality:
- Ensure FFmpeg threads are set appropriately
- Use SSD for output location
- Close other applications during build

### Memory Usage

FFmpeg typically uses 100-500 MB RAM during encoding. Ensure you have sufficient free memory for:
- FFmpeg process
- AudioPie application
- Operating system

