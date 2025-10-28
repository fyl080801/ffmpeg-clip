# GEMINI.md

## Project Overview

This is a web-based video editing application built with Vue 3, TypeScript, and Vite. It leverages `ffmpeg.wasm` to perform video processing directly in the browser.

The core functionality involves extracting frames from a video file, and then rendering these frames, along with other graphical elements like text, onto an HTML canvas. This allows for creating video compositions with overlays.

The application has a modular architecture, with distinct classes responsible for different concerns:

-   **`Player.ts`**: The main orchestrator, which initializes and coordinates all the other managers and controllers.
-   **`FFmpegManager.ts`**: A wrapper around `ffmpeg.wasm` to handle loading the FFmpeg engine and extracting video frames.
-   **`ElementManager.ts`**: Manages the different elements on the timeline, such as video frames and text overlays.
-   **`CanvasDrawer.ts`**: Responsible for rendering the elements onto the canvas at the correct time.
-   **`PlaybackController.ts`**: Controls the playback of the timeline, including play, pause, and seek operations.
-   **`EventEmitter.ts`**: A utility for implementing an event-driven architecture, allowing the different components to communicate with each other.

The UI is built with `element-plus` for components and styled with `tailwindcss`.

## Building and Running

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
    (or `npm install` / `yarn install`)

2.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

3.  **Build for production:**
    ```bash
    pnpm build
    ```
    This will create a `dist` directory with the production-ready files.

4.  **Preview the production build:**
    ```bash
    pnpm preview
    ```

## Development Conventions

-   **Language:** The project is written in TypeScript.
-   **Framework:** It uses Vue 3 with the `<script setup>` syntax for Single File Components (SFCs).
-   **Styling:** `tailwindcss` is used for utility-first CSS, and `element-plus` provides a component library.
-   **Architecture:** The core logic is separated from the Vue components and organized into classes within the `src/lib` directory. This promotes separation of concerns and makes the code more modular and testable.
-   **Asynchronous Operations:** The application makes extensive use of Promises for asynchronous operations, especially for loading FFmpeg and processing video files.
-   **State Management:** Component state is managed using Vue's reactivity system (`ref`, `reactive`). For cross-component communication, the application uses an event-driven approach with a custom `EventEmitter`.
