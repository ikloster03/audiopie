**English** | [Русский](README_RU.md)

<p align="center">
  <img src="assets/audiopie.svg" alt="AudioPie Logo" width="128" height="128">
</p>

# AudioPie

AudioPie — build M4B audiobooks from MP3 tracks with chapter editing.

📚 **[Documentation](https://audiopie.ikloster.tech)**

## Features

- 🎵 Convert MP3 tracks to M4B audiobook format
- 📖 Edit chapters with drag & drop
- 🎨 Metadata editing support
- 🔧 FFmpeg integration
- 💾 Project save/load functionality
- 🌍 Multilingual (English & Russian)

## Tech Stack

- ⚡️ **Vite** — Next generation frontend tooling
- ⚛️ **React 18** — UI framework
- 🖥 **Electron** — Cross-platform desktop apps
- 📘 **TypeScript** — Type safety
- 🎨 **SCSS** — Styling

## Project Structure

```
├── electron/          # Electron main & preload processes
│   ├── main/         # Main process
│   └── preload/      # Preload scripts
├── src/              # React application (renderer)
│   ├── components/   # React components
│   ├── context/      # React context
│   └── styles/       # SCSS styles
├── public/           # Static assets
├── build/            # App icons
└── assets/           # Additional resources (FFmpeg, etc.)
```

## Development

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

The built application will be in the `release/{version}` directory.

## Scripts

- `npm run dev` — Start development server with hot reload
- `npm run build` — Build application for production
- `npm run preview` — Preview production build

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## Security Warnings

> ⚠️ **Note**: Code signing is currently in progress. Until it's complete, you may see security warnings when launching the app.

### macOS

If macOS shows "AudioPie is damaged and can't be opened", run in Terminal:

```bash
xattr -cr /Applications/AudioPie.app
```

Or go to **System Settings → Privacy & Security** and click **"Open Anyway"**.

### Windows

If Windows SmartScreen shows "Windows protected your PC":

1. Click **"More info"**
2. Click **"Run anyway"**

## License

MIT License — see [LICENSE](LICENSE) file for details

## Author

Ivan Monastyrev (i@ikloster.ru)
