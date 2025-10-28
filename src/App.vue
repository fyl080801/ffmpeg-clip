<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { ElButton, ElProgress, ElSlider } from "element-plus"
import { type ProgressEvent } from "./lib/FFmpegManager"
import { Player } from "./lib/Player"

let player: Player

const canvas = ref<HTMLCanvasElement>()
const playing = ref(false)
const statusText = ref("Loading...")

const loadprocess = ref(0)

const currentTime = ref(0) // in milliseconds
const totalDuration = ref(0) // in milliseconds

const init = () => {
  if (!canvas.value) return

  player = new Player(canvas.value, {
    fps: 30,
    elements: [
      {
        id: "main-video",
        type: "video-frames",
        rect: {
          x: 0,
          y: 0,
          width: canvas.value.width,
          height: canvas.value.height
        },
        timeRange: [0, 5000],
        zIndex: 0,
        videoUrl: "/video/demo.mp4"
      },
      {
        id: "sample-text-1",
        type: "text",
        rect: { x: 50, y: 200, width: 200, height: 50 },
        timeRange: [1200, 4000],
        zIndex: 1,
        text: "Hello World!",
        font: "40px Arial",
        color: "red"
      }
    ]
  })

  player.on("loading", () => {
    statusText.value = "Loading ffmpeg..."
  })

  player.on("ready", () => {
    statusText.value = "Extracting frames..."
  })

  player.on("progress", (e: ProgressEvent) => {
    if (e.progress < 1) {
      loadprocess.value = e.progress * 100
    } else {
      loadprocess.value = 100
      statusText.value = ""
    }
  })

  player.on("durationupdate", (duration) => {
    totalDuration.value = duration
  })

  player.on("timeupdate", (time) => {
    currentTime.value = time
  })

  player.on("play", () => {
    playing.value = true
  })

  player.on("pause", () => {
    playing.value = false
  })

  player.start()
}

onMounted(() => {
  init()
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
  if (player && newTime !== undefined) {
    player.seek(newTime)
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
              @click="player?.togglePlay()"
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
