# AudioPie

AudioPie is a cross-platform Electron application for crafting `.m4b` audiobooks from a list of `.mp3` tracks. The app lets you edit audiobook metadata, manage chapter timing, and run FFmpeg/FFprobe pipelines from a friendly desktop UI.

## Requirements

- Node.js 18+
- FFmpeg and FFprobe available in `PATH` or configured inside the app settings

## Getting started

```bash
npm install
npm run dev
```

The `dev` script launches the TypeScript watchers for both the main and renderer processes and starts Electron in development mode.

## Building installers

```bash
npm run build
```

Electron Builder generates distributable packages for Windows, macOS, and Linux inside the `dist/` directory.

## Project format

Projects can be saved to and restored from `.audiopie.json` files. They store track order, chapter definitions, and all metadata fields, allowing you to pause and resume work effortlessly.

## License

MIT
