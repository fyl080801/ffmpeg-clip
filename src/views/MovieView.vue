<script setup lang="ts">
import { onMounted, ref } from "vue"
import etro from "etro"
import { ElButton } from "element-plus"
// import { TextStrokePosition } from "etro/dist/layer"

const canvasRef = ref<HTMLCanvasElement>()
const videoRef = ref<HTMLVideoElement>()
const movieRef = ref<etro.Movie>()

const onPlay = () => {
  if (!movieRef.value) return

  // movieRef.value.stream({
  //   frameRate: 60,
  //   duration: 5,
  //   video: true,
  //   audio: true,
  //   onStart: (stream: MediaStream) => {
  //     // Streaming has started

  //     console.log(stream)
  //   }
  // })
  movieRef.value.play({})
}

const onStop = () => {
  if (!movieRef.value) return

  movieRef.value?.stop()
}

onMounted(() => {
  if (canvasRef.value) {
    const movie = new etro.Movie({
      canvas: canvasRef.value
    })
      .addLayer(
        new etro.layer.Visual({
          startTime: 0,
          duration: 5,
          background: etro.parseColor("blue")
        })
      )

      .addLayer(
        new etro.layer.Video({
          startTime: 0,
          duration: 5,
          source: "/video/demo.mp4", // also accepts an `HTMLVideoElement`
          // sourceX: 0, // default: 0
          // sourceY: 0, // default: 0
          // sourceWidth: 400, // default: null (full width)
          // sourceHeight: 400, // default: null (full height)
          // sourceStartTime: 0, // default: 0
          // destX: 0, // default: 0
          // destY: 0, // default: 0
          destWidth: 80, // default: null (full width)
          destHeight: 110, // default: null (full height)
          // x: 0, // default: 0
          // y: 0, // default: 0
          // width: 400, // default: null (full width)
          // height: 800, // default: null (full height)
          // opacity: 1, // default: 1
          muted: false // default: false
          // volume: 1, // default: 1
          // playbackRate: 1 // default: 1
        })
      )

    // .addLayer(
    //   new etro.layer.Text({
    //     startTime: 0,
    //     duration: 5,
    //     text: "Hello World",
    //     x: 0, // default: 0
    //     y: 0, // default: 0
    //     width: 400, // default: null (full width)
    //     height: 400, // default: null (full height)
    //     opacity: 1, // default: 1
    //     color: etro.parseColor("white"), // default: new etro.Color(0, 0, 0, 1)
    //     font: "10px sans-serif", // default: '10px sans-serif'
    //     textX: 20, // default: 0
    //     textY: 20, // default: 0
    //     textAlign: "left" // default: 'left'
    //     // textBaseline: "alphabetic", // default: 'alphabetic'
    //     // textDirection: "ltr" // default: 'ltr'
    //     // textStroke: {
    //     //   // default: null (no stroke)
    //     //   color: etro.parseColor("white"),
    //     //   // position: TextStrokePosition.Outside, // default: TextStrokePosition.Outside
    //     //   thickness: 2 // default: 1
    //     // }
    //   })
    // )

    movie.refresh()

    movieRef.value = movie
  }
})
</script>

<template>
  <div>
    <canvas ref="canvasRef" class="w-[800px] h-[600px]"></canvas>
    <ElButton type="primary" @click="onPlay">play</ElButton>
    <ElButton @click="onStop">play</ElButton>
    <!-- <video ref="videoRef" src="/video/demo.mp4"></video> -->
  </div>
</template>
