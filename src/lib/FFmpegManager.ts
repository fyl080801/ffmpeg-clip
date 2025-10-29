import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { EventEmitter, type IEventEmitter } from "./EventEmitter"

export type ProgressEvent = { progress: number; time: number }

interface Events {
  loading(): void
  loaded(): void
  progress(event: ProgressEvent): void
  extracting(): void
  extracted(): void
  imageloading(): void
  imageloaded(): void
}
export class FFmpegManager implements IEventEmitter<Events> {
  private ffmpeg = new FFmpeg()
  private listeners = new EventEmitter<Events>()
  private _fps: number = 30

  constructor(options: any) {
    this._fps = options.fps
  }

  // --- Event Emitter Implementation ---
  on<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.on(eventName, handler)
  }

  off<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.off(eventName, handler)
  }
  // --- End Event Emitter ---

  public async load(): Promise<void> {
    this.listeners.emit("loading")
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      // wasmURL: await toBlobURL(
      //   `${baseURL}/ffmpeg-core.wasm`,
      //   "application/wasm"
      // )
      wasmURL: await toBlobURL("/ffmpeg/ffmpeg-core.wasm", "application/wasm")
    })
    this.listeners.emit("loaded")
  }

  public get ffmpegInstance(): FFmpeg {
    return this.ffmpeg
  }

  public get fps(): number {
    return this._fps
  }

  public async extractFrames(videoUrl: string): Promise<HTMLImageElement[]> {
    this.listeners.emit("extracting")
    this.ffmpeg.on("progress", (e: ProgressEvent) => {
      this.listeners.emit("progress", e)
    })

    const videoData = await fetchFile(videoUrl)
    this.ffmpeg.writeFile("input.mp4", videoData)

    await this.ffmpeg.exec([
      "-i",
      "input.mp4",
      "-vf",
      `fps=${this._fps}`,
      "frame_%d.png"
    ])

    this.listeners.emit("extracted")

    this.listeners.emit("imageloading")
    const frameFiles = (await this.ffmpeg.listDir("/")).filter((f: any) =>
      f.name.startsWith("frame_")
    )

    frameFiles.sort((a, b) => {
      const aNum = parseInt(a.name.match(/(\d+)/)![0])
      const bNum = parseInt(b.name.match(/(\d+)/)![0])
      return aNum - bNum
    })

    const framesImages: HTMLImageElement[] = []
    const imageLoadPromises: Promise<void>[] = []

    for (const file of frameFiles) {
      const frameData = await this.ffmpeg.readFile(file.name)
      const blob = new Blob([frameData as any], { type: "image/png" })
      const url = URL.createObjectURL(blob)

      const img = new Image()
      const loadPromise = new Promise<void>((resolve) => {
        img.onload = () => resolve()
      })
      img.src = url
      framesImages.push(img)
      imageLoadPromises.push(loadPromise)
    }

    await Promise.all(imageLoadPromises)
    this.listeners.emit("imageloaded")
    return framesImages
  }
}
