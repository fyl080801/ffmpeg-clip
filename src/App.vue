<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { ElButton, ElProgress, ElSlider } from "element-plus"
import { CanvasDrawer } from "./lib/CanvasDrawer"
import { ElementManager } from "./lib/ElementManager"
import type { CanvasElement } from "./lib/types"
import { FFmpegManager, type ProgressEvent } from "./lib/FFmpegManager"
import { PlaybackController } from "./lib/PlaybackController"

let canvasDrawer: CanvasDrawer
let elementManager: ElementManager
let playbackController: PlaybackController
const ffmpegManager = new FFmpegManager()
const canvas = ref<HTMLCanvasElement>()

const playing = ref(false)
const statusText = ref("Loading...")
const loadprocess = ref(0)
const fps = 30

const currentTime = ref(0) // in milliseconds
const totalDuration = ref(0) // in milliseconds

// --- Event Handlers ---
const onVpLoadStart = () => (statusText.value = "Loading ffmpeg...")
const onVpExtractStart = () => (statusText.value = "Extracting frames...")
const onVpProgress = (e: ProgressEvent) =>
  (loadprocess.value = e.progress * 100)
const onVpExtractEnd = () => (loadprocess.value = 100)
const onVpImageLoadStart = () => (statusText.value = "Loading image data...")
const onVpImageLoadEnd = () => (statusText.value = "")

const setupVideoProcessorListeners = () => {
  ffmpegManager.on("load:start", onVpLoadStart)
  ffmpegManager.on("extract:start", onVpExtractStart)
  ffmpegManager.on("progress", onVpProgress)
  ffmpegManager.on("extract:end", onVpExtractEnd)
  ffmpegManager.on("imageload:start", onVpImageLoadStart)
  ffmpegManager.on("imageload:end", onVpImageLoadEnd)
}

const cleanupVideoProcessorListeners = () => {
  ffmpegManager.off("load:start", onVpLoadStart)
  ffmpegManager.off("extract:start", onVpExtractStart)
  ffmpegManager.off("progress", onVpProgress)
  ffmpegManager.off("extract:end", onVpExtractEnd)
  ffmpegManager.off("imageload:start", onVpImageLoadStart)
  ffmpegManager.off("imageload:end", onVpImageLoadEnd)
}

const setupPlaybackControllerListeners = () => {
  playbackController.on("timeupdate", (time: number) => {
    currentTime.value = time
    canvasDrawer.render()
  })
  playbackController.on("play", () => (playing.value = true))
  playbackController.on("pause", () => (playing.value = false))
}

const load = async () => {
  setupVideoProcessorListeners()
  await ffmpegManager.load()

  const extractedImages = await ffmpegManager.extractFrames(
    "/video/demo.mp4",
    fps
  )

  const videoElement: CanvasElement = {
    id: "main-video",
    type: "video-frames",
    rect: {
      x: 0,
      y: 0,
      width: canvas.value!.width,
      height: canvas.value!.height
    },
    timeRange: [0, 5000],
    zIndex: 0,
    props: {
      source: extractedImages
    }
  }
  elementManager.addElement(videoElement)

  elementManager.addElement({
    id: "sample-text",
    type: "text",
    rect: { x: 50, y: 200, width: 200, height: 50 },
    timeRange: [1200, 4000],
    zIndex: 1,
    props: {
      text: "Hello World!",
      font: "40px Arial",
      color: "red"
    }
  })

  elementManager.addElement({
    id: "sample-text",
    type: "text",
    rect: { x: 250, y: 500, width: 200, height: 50 },
    timeRange: [3000, 5000],
    zIndex: 1,
    props: {
      text: "Hello World!",
      font: "40px Arial",
      color: "white"
    }
  })

  setupPlaybackControllerListeners()

  canvasDrawer.render()
}

onMounted(async () => {
  if (canvas.value) {
    elementManager = new ElementManager()
    playbackController = new PlaybackController({ elementManager })
    canvasDrawer = new CanvasDrawer(canvas.value, {
      fps,
      controller: playbackController,
      elementManager
    })

    playbackController.on("durationupdate", (value) => {
      totalDuration.value = value
    })

    await load()
  }
})

onUnmounted(() => {
  cleanupVideoProcessorListeners()
  // It's also good practice to clean up playback controller listeners
  // but since it's created and destroyed with the component, it's less critical.
})

const formatTime = (timeInMs: number) => {
  const totalSeconds = timeInMs / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const milliseconds = Math.floor(timeInMs % 1000)
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
}

const handleSliderSeek = (time: number | number[]) => {
  const newTime = Array.isArray(time) ? time[0] : time
  if (playbackController && newTime !== undefined) {
    playbackController.seek(newTime)
  }
}
</script>

<template>
  <div class="app-container">
    <div class="menu">
      <h3>Menu</h3>
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
    </div>
    <div class="content">
      <div class="canvas-container">
        <div class="w-[700px] mx-auto">
          <canvas ref="canvas" width="400" height="800"></canvas>
        </div>
      </div>
      <div class="controls-container">
        <div class="w-[700px] mx-auto">
          <div v-if="statusText" class="text-center my-2">
            <p>{{ statusText }}</p>
            <ElProgress
              v-if="loadprocess > 0 && loadprocess < 100"
              :percentage="loadprocess"
              :show-text="false"
              class="mt-2"
            />
          </div>
          <div v-if="loadprocess >= 100" class="text-center">
            <ElSlider
              :model-value="currentTime"
              @input="handleSliderSeek"
              :max="totalDuration"
              :step="10"
              :disabled="totalDuration === 0"
              :format-tooltip="formatTime"
              class="w-full"
            />
            <div class="text-center mt-2">
              {{ formatTime(currentTime) }} / {{ formatTime(totalDuration) }}
            </div>
            <br />
            <ElButton
              type="primary"
              @click="playbackController?.togglePlay()"
              :disabled="totalDuration === 0"
            >
              {{ playing ? "Pause" : "Play" }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.app-container {
  @apply flex;
  height: 100vh;
}

.menu {
  @apply w-[200px];
  @apply box-border p-[20px];
  @apply bg-[#f0f0f0];
}

.content {
  @apply flex flex-col flex-1 overflow-hidden;
  @apply bg-[#ffffff];
}

.canvas-container {
  @apply flex-1;
  @apply overflow-y-auto;
  @apply p-[20px];
}

.controls-container {
  @apply flex-shrink-0;
  @apply p-[20px];
  @apply border-t border-t-gray-200;
}
</style>
