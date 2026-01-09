---
sidebar_position: 2
---

# Installation

AudioPie is available for Linux, Windows, and macOS. Choose your preferred installation method below.

## Download Pre-built Binaries

The easiest way to install AudioPie is to download the pre-built binaries from the [GitHub Releases](https://github.com/ikloster03/audiopie/releases) page.

### Linux

1. Download the `.AppImage` file from the releases page
2. Make it executable:
   ```bash
   chmod +x AudioPie_*.AppImage
   ```
3. Run the application:
   ```bash
   ./AudioPie_*.AppImage
   ```

Alternatively, you can extract the `linux-unpacked` archive and run the `audiopie` binary directly.

### Windows

1. Download the `.exe` installer from the releases page
2. Run the installer and follow the instructions
3. Launch AudioPie from the Start menu

:::caution Windows SmartScreen Warning
If Windows SmartScreen shows "Windows protected your PC", click **"More info"** → **"Run anyway"**. This happens because the app is not yet code-signed. Code signing is in progress.
:::

### macOS

1. Download the `.dmg` file from the releases page
2. Open the DMG and drag AudioPie to your Applications folder
3. Launch AudioPie from Launchpad or Spotlight

:::caution macOS Security Warning
If macOS shows "AudioPie is damaged and can't be opened", this is because the app is not yet code-signed. Code signing is in progress.

**Solution**: Run in Terminal:
```bash
xattr -cr /Applications/AudioPie.app
```

Or go to **System Settings → Privacy & Security** and click **"Open Anyway"**.
:::

## Build from Source

If you prefer to build AudioPie from source, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) version 18 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/ikloster03/audiopie.git
   cd audiopie
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server (optional):
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

The built application will be in the `release/{version}` directory.

## FFmpeg

AudioPie uses FFmpeg for audio processing. The application includes a bundled version of FFmpeg, so you don't need to install it separately.

However, if you want to use your system's FFmpeg installation:

1. Open AudioPie
2. Go to **Settings** (gear icon)
3. Set the path to your FFmpeg and FFprobe executables

See the [FFmpeg Configuration](./configuration/ffmpeg) guide for more details.

## Troubleshooting

### Application Won't Start

- **Linux**: Make sure the AppImage has execute permissions
- **macOS**: If you see "damaged and can't be opened" error, run `xattr -cr /Applications/AudioPie.app` in Terminal, or allow the app in **System Settings → Privacy & Security → "Open Anyway"**
- **Windows**: If Windows SmartScreen blocks the app, click **"More info"** → **"Run anyway"**

:::info Code Signing Status
Code signing for macOS and Windows is currently in progress. Once complete, these security warnings will no longer appear.
:::

### FFmpeg Errors

If you see FFmpeg-related errors:

1. Check the Settings to ensure FFmpeg path is correct
2. Try using the bundled FFmpeg (leave paths empty in Settings)
3. Ensure FFmpeg has permissions to access your audio files

### Other Issues

If you encounter other issues, please:

1. Check the [FAQ](./faq)
2. Search [GitHub Issues](https://github.com/ikloster03/audiopie/issues)
3. Create a new issue with detailed information about your problem

