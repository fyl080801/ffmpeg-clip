import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

export type ProgressEvent = { progress: number; time: number }

type EventCallback = (...args: any[]) => void

export class FFmpegManager {
  private ffmpeg = new FFmpeg()
  private listeners: Map<string, EventCallback[]> = new Map()

  // --- Event Emitter Implementation ---
  public on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  public off(event: string, callback: EventCallback): void {
    if (this.listeners.has(event)) {
      const eventListeners = this.listeners
        .get(event)!
        .filter((cb) => cb !== callback)
      this.listeners.set(event, eventListeners)
    }
  }

  private emit(event: string, ...args: any[]): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(...args)
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e)
        }
      })
    }
  }
  // --- End Event Emitter ---

  public async load(): Promise<void> {
    this.emit("load:start")
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      )
    })
    this.emit("load:end")
  }

  public get ffmpegInstance(): FFmpeg {
    return this.ffmpeg
  }

  public async extractFrames(
    videoUrl: string,
    fps: number = 30
  ): Promise<HTMLImageElement[]> {
    this.emit("extract:start")
    this.ffmpeg.on("progress", (e: ProgressEvent) => {
      this.emit("progress", e)
    })

    const videoData = await fetchFile(videoUrl)
    this.ffmpeg.writeFile("input.mp4", videoData)

    await this.ffmpeg.exec([
      "-i",
      "input.mp4",
      "-vf",
      `fps=${fps}`,
      "frame_%d.png"
    ])

    this.emit("extract:end")

    this.emit("imageload:start")
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
    this.emit("imageload:end")
    return framesImages
  }
}
