<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { ElButton, ElProgress, ElSlider } from "element-plus"
import { CanvasDrawer } from "./lib/CanvasDrawer"
import { ElementManager } from "./lib/ElementManager"
import { FFmpegManager, type ProgressEvent } from "./lib/FFmpegManager"
import { PlaybackController } from "./lib/PlaybackController"
import { VideoElement, TextElement } from "./lib/elements"
import { Player } from "./lib/Player"

let player: Player

// const ffmpegManager = new FFmpegManager()

// const init = (elm: HTMLCanvasElement) => {
//   let canvasDrawer: CanvasDrawer
//   let elementManager: ElementManager
//   let playbackController: PlaybackController

//   elementManager = new ElementManager({ ffmpegManager })
//   playbackController = new PlaybackController({ elementManager })
//   canvasDrawer = new CanvasDrawer(elm, {
//     fps,
//     controller: playbackController,
//     elementManager
//   })

//   playbackController.on("durationupdate", (value) => {
//     totalDuration.value = value
//   })

//   playbackController.on("timeupdate", (time: number) => {
//     currentTime.value = time
//     canvasDrawer.render()
//   })
//   playbackController.on("play", () => (playing.value = true))
//   playbackController.on("pause", () => (playing.value = false))
// }

const canvas = ref<HTMLCanvasElement>()
const playing = ref(false)
const statusText = ref("Loading...")

const init = () => {
  if (!canvas.value) return

  player = new Player(canvas.value, {
    fps: 30
  })

  player.start()

  player.on("ready", () => {
    player.addElement({
      type: "video-frames",
      id: "main-video"
      // rect: {
      //   x: 0,
      //   y: 0,
      //   width: canvas.value!.width,
      //   height: canvas.value!.height
      // },
      // timeRange: [0, 5000],
      // zIndex: 0,
      // videoUrl: "/video/demo.mp4"
    })
  })
}

// const loadprocess = ref(0)
// const fps = 30

// const currentTime = ref(0) // in milliseconds
// const totalDuration = ref(0) // in milliseconds

// // --- Event Handlers ---
// const onVpLoadStart = () => (statusText.value = "Loading ffmpeg...")
// const onVpExtractStart = () => (statusText.value = "Extracting frames...")
// const onVpProgress = (e: ProgressEvent) =>
//   (loadprocess.value = e.progress * 100)
// const onVpExtractEnd = () => (loadprocess.value = 100)
// const onVpImageLoadStart = () => (statusText.value = "Loading image data...")
// const onVpImageLoadEnd = () => (statusText.value = "")

// const setupElementManagerListeners = () => {
//   elementManager.on("load:start", onVpLoadStart)
//   elementManager.on("extract:start", onVpExtractStart)
//   elementManager.on("progress", onVpProgress)
//   elementManager.on("extract:end", onVpExtractEnd)
//   elementManager.on("imageload:start", onVpImageLoadStart)
//   elementManager.on("imageload:end", onVpImageLoadEnd)
// }

// const cleanupElementManagerListeners = () => {
//   elementManager.off("load:start", onVpLoadStart)
//   elementManager.off("extract:start", onVpExtractStart)
//   elementManager.off("progress", onVpProgress)
//   elementManager.off("extract:end", onVpExtractEnd)
//   elementManager.off("imageload:start", onVpImageLoadStart)
//   elementManager.off("imageload:end", onVpImageLoadEnd)
// }

// const setupPlaybackControllerListeners = () => {
//   playbackController.on("timeupdate", (time: number) => {
//     currentTime.value = time
//     canvasDrawer.render()
//   })
//   playbackController.on("play", () => (playing.value = true))
//   playbackController.on("pause", () => (playing.value = false))
// }

// const load = async () => {
//   // setupElementManagerListeners()
//   await ffmpegManager.load()

//   const elements = [
//     new VideoElement({
//       id: "main-video",
//       rect: {
//         x: 0,
//         y: 0,
//         width: canvas.value!.width,
//         height: canvas.value!.height
//       },
//       timeRange: [0, 5000],
//       zIndex: 0,
//       videoUrl: "/video/demo.mp4"
//     }),
//     new TextElement({
//       id: "sample-text-1",
//       rect: { x: 50, y: 200, width: 200, height: 50 },
//       timeRange: [1200, 4000],
//       zIndex: 1,
//       text: "Hello World!",
//       font: "40px Arial",
//       color: "red"
//     }),
//     new TextElement({
//       id: "sample-text-2",
//       rect: { x: 250, y: 500, width: 200, height: 50 },
//       timeRange: [3000, 5000],
//       zIndex: 1,
//       text: "Hello World!",
//       font: "40px Arial",
//       color: "white"
//     })
//   ]

//   // Add elements in parallel for efficiency
//   await Promise.all(
//     elements.map((element) => elementManager.addElement(element))
//   )

//   setupPlaybackControllerListeners()

//   canvasDrawer.render()
// }

onMounted(() => {
  init()
  // if (canvas.value) {
  //   init(canvas.value)
  //   // elementManager = new ElementManager({ ffmpegManager })
  //   // playbackController = new PlaybackController({ elementManager })
  //   // canvasDrawer = new CanvasDrawer(canvas.value, {
  //   //   fps,
  //   //   controller: playbackController,
  //   //   elementManager
  //   // })
  //   // playbackController.on("durationupdate", (value) => {
  //   //   totalDuration.value = value
  //   // })
  //   await load()
  // }
})

// onUnmounted(() => {
//   // cleanupElementManagerListeners()
//   // It's also good practice to clean up playback controller listeners
//   // but since it's created and destroyed with the component, it's less critical.
// })

// const formatTime = (timeInMs: number) => {
//   const totalSeconds = timeInMs / 1000
//   const minutes = Math.floor(totalSeconds / 60)
//   const seconds = Math.floor(totalSeconds % 60)
//   const milliseconds = Math.floor(timeInMs % 1000)
//   return `${minutes.toString().padStart(2, "0")}:${seconds
//     .toString()
//     .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
// }

// const handleSliderSeek = (time: number | number[]) => {
//   const newTime = Array.isArray(time) ? time[0] : time
//   if (playbackController && newTime !== undefined) {
//     playbackController.seek(newTime)
//   }
// }
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
        <!-- <div class="w-[700px] mx-auto">
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
        </div> -->
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
