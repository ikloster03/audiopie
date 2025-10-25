# AudioPie

AudioPie - build m4b audiobooks from mp3 tracks with chapter editing.

## Features

- 🎵 Convert MP3 tracks to M4B audiobook format
- 📖 Edit chapters with drag & drop
- 🎨 Metadata editing support
- 🔧 FFmpeg integration
- 💾 Project save/load functionality

## Tech Stack

- ⚡️ **Vite** - Next generation frontend tooling
- ⚛️ **React 18** - UI framework
- 🖥 **Electron** - Cross-platform desktop apps
- 📘 **TypeScript** - Type safety
- 🎨 **CSS** - Styling

## Project Structure

```
├── electron/          # Electron main & preload processes
│   ├── main/         # Main process
│   └── preload/      # Preload scripts
├── src/              # React application (renderer)
│   ├── components/   # React components
│   ├── context/      # React context
│   └── styles/       # CSS styles
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

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build application for production
- `npm run preview` - Preview production build

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Ivan Monastyrev (i@ikloster.ru)
