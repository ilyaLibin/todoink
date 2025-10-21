# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TodoInk is a Next.js web application that simulates an e-ink todo device with voice input. It uses local AI transcription (Whisper via Transformers.js) to convert voice recordings into todo items, all running client-side in the browser.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Client-Side State Management
- **localStorage persistence**: Todos and lists are automatically saved to localStorage and restored on page load (see src/app/page.tsx:32-69)
- **State structure**:
  - `todos[]` - Array of todo items with id, text, completed status, and listId
  - `lists[]` - Array of list objects with id and name
  - `currentList` - Active list ID (defaults to 1)

### Voice Transcription Architecture

**Web Worker Pattern**: AI transcription runs in a dedicated web worker (src/workers/transcription.worker.ts) to avoid blocking the main thread during inference.

**Model Loading**:
- Whisper Tiny model (~40MB) is preloaded on page mount via `workerRef.current.postMessage({ preload: true })`
- Loading progress is tracked and displayed to users via worker messages with `status: "progress"`
- Model is cached by the browser after first download

**Audio Processing Flow**:
1. MediaRecorder API captures audio in WebM format
2. Main thread converts audio to proper format using AudioContext (16kHz, Float32Array, mono)
3. Processed audio is transferred to worker (using transferable objects for performance)
4. Worker runs Whisper model inference
5. Transcription result is sent back to main thread via postMessage
6. UI updates with transcribed text

**Key Implementation Details**:
- Audio processing happens in main thread (AudioContext not available in workers)
- Stereo-to-mono conversion averages both channels (src/app/page.tsx:259-266)
- Worker communication uses transferable objects to avoid copying large audio buffers
- Microphone permission is requested proactively on page load (src/app/page.tsx:128-137)

### Button Interaction System

**Long-press Detection**: Uses setTimeout with 200ms delay to distinguish between clicks and voice recording intent (src/app/page.tsx:302-307)

**Interaction Modes**:
- Single click → Toggle todo completion
- Double click → Delete todo
- Long press (>200ms) → Start voice recording to add/edit todo

**State Tracking**:
- `activeButtonIndex` ref tracks which button is being long-pressed
- `recording` state determines if MediaRecorder is active
- Recording state is cleared on transcription completion or error

### Component Structure

- **src/app/page.tsx**: Main page component containing all todo logic, state management, and voice recording
- **src/components/**: Presentational components (Logo, RecordingLight, Footer, Legend, MobileSplash, GitHubStars)
- **src/workers/transcription.worker.ts**: Isolated web worker for Whisper model inference
- **src/data/defaultData.ts**: Default todos and lists, TypeScript interfaces

### Next.js Configuration

**Turbopack Alias** (next.config.ts):
- `onnxruntime-node` is aliased to itself for proper resolution with Transformers.js

**TypeScript Paths** (tsconfig.json):
- `@/*` maps to `./src/*` for cleaner imports

## Working with This Codebase

### Adding Todo Features
- Todo CRUD operations are in src/app/page.tsx (functions: `addOrUpdateTodo`, `handleButtonClick`, `handleButtonDoubleClick`)
- Each todo must have a `listId` to associate it with a list
- Use `setTodos` with functional updates to avoid race conditions

### Modifying Voice Transcription
- Worker logic is in src/workers/transcription.worker.ts
- Model selection happens in the pipeline call (currently "Xenova/whisper-tiny.en")
- Progress tracking requires implementing `progress_callback` in pipeline options
- Audio format must be Float32Array at 16kHz sample rate

### Styling
- Uses CSS Modules (*.module.css files)
- Tailwind CSS v4 configured via postcss.config.mjs
- E-ink aesthetic uses monochrome color scheme with serif fonts

### Browser APIs Used
- **Web Workers**: For running AI models without blocking UI
- **MediaRecorder**: For capturing voice audio
- **AudioContext**: For audio format conversion (16kHz resampling, stereo→mono)
- **localStorage**: For persisting todos and lists
- **getUserMedia**: For microphone access

### Performance Considerations
- Whisper model is ~40MB and downloads on first load
- Use transferable objects when sending audio data to workers
- Audio processing (AudioContext) must happen in main thread
- Model inference is CPU-intensive; keep in web worker
