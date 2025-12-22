---
sidebar_position: 1
---

# Settings

AudioPie provides various settings to customize your workflow. Access settings by clicking the gear icon (⚙️) in the header.

## Settings Overview

The Settings dialog contains the following options:

| Setting | Description | Default |
|---------|-------------|---------|
| FFmpeg Path | Path to FFmpeg executable | Bundled |
| FFprobe Path | Path to FFprobe executable | Bundled |
| Default Bitrate | Output audio bitrate | 128 kbps |
| Default Output Dir | Where to save M4B files | Home folder |
| FFmpeg Threads | CPU threads for encoding | Auto |
| Theme | Light or Dark mode | System |
| Language | Interface language | English |

## Audio Settings

### Default Bitrate

The bitrate affects audio quality and file size:

```
┌────────────┬─────────────────┬──────────────────┐
│ Bitrate    │ Quality         │ ~Size per hour   │
├────────────┼─────────────────┼──────────────────┤
│ 64 kbps    │ Good (voice)    │ 28 MB            │
│ 96 kbps    │ Better          │ 42 MB            │
│ 128 kbps   │ Very Good       │ 56 MB            │
│ 192 kbps   │ Excellent       │ 84 MB            │
└────────────┴─────────────────┴──────────────────┘
```

**Recommendation**: For audiobooks (spoken word), 64-96 kbps provides excellent quality with smaller files.

### FFmpeg Threads

Controls how many CPU threads FFmpeg uses:

- **Auto (default)**: FFmpeg decides based on your system
- **1-2 threads**: Lower CPU usage, slower encoding
- **4+ threads**: Faster encoding, higher CPU usage

Leave at "Auto" unless you have specific needs.

## Output Settings

### Default Output Directory

Set a default folder for saving M4B files:

1. Click **Browse** next to Default Output Dir
2. Select your preferred folder
3. Click **Select**

When building, the file dialog will open to this location.

:::tip
Create a dedicated folder like `~/Audiobooks/Output` for easy organization.
:::

## Appearance

### Theme

Choose your preferred color scheme:

- **Light** — Bright interface with dark text
- **Dark** — Dark interface with light text
- **System** — Follows your OS setting

Toggle theme quickly using the moon/sun icon in the header.

### Language

AudioPie supports:

- 🇬🇧 **English**
- 🇷🇺 **Russian** (Русский)

Change language using the language button in the header, or in Settings.

## FFmpeg Configuration

See the dedicated [FFmpeg Configuration](./ffmpeg) guide for details on:

- Using bundled FFmpeg
- Using system FFmpeg
- Troubleshooting FFmpeg issues

## Saving Settings

Settings are saved automatically when you:
- Close the Settings dialog
- Change any setting

Settings persist across application restarts.

## Settings Location

AudioPie stores settings in your user data folder:

| Platform | Location |
|----------|----------|
| Linux | `~/.config/audiopie/` |
| Windows | `%APPDATA%\audiopie\` |
| macOS | `~/Library/Application Support/audiopie/` |

## Resetting Settings

To reset all settings to defaults:

1. Close AudioPie
2. Delete the settings file from the location above
3. Relaunch AudioPie

:::caution
This will reset ALL settings including FFmpeg paths and preferences.
:::

## Troubleshooting

### Settings Not Saving

- Check write permissions to the config folder
- Try running AudioPie as administrator (Windows)
- Check disk space

### Theme Not Applying

- Try restarting AudioPie
- Check if "System" theme is selected and OS theme changed
- Clear application cache

### Language Changed But Text Not Updated

- Some text may require a restart to update
- Close and reopen the Settings dialog
- Restart AudioPie

