import { CanvasDrawer } from "./CanvasDrawer"
import { ElementManager } from "./ElementManager"
import { EventEmitter, type IEventEmitter } from "./EventEmitter"
import { FFmpegManager } from "./FFmpegManager"
import { PlaybackController, type IPlay } from "./PlaybackController"
import type { CanvasElement } from "./types"

interface Events {
  ready(): void
}

export class Player implements IPlay, IEventEmitter<Events> {
  private ffmpegManager: FFmpegManager
  private canvasDrawer: CanvasDrawer
  private elementManager: ElementManager
  private playbackController: PlaybackController
  private listeners = new EventEmitter<Events>()

  constructor(element: HTMLCanvasElement, options: any) {
    this.ffmpegManager = new FFmpegManager(options)
    this.elementManager = new ElementManager()
    this.playbackController = new PlaybackController({
      elementManager: this.elementManager
    })
    this.canvasDrawer = new CanvasDrawer(element, {
      fps: options.fps,
      controller: this.playbackController,
      elementManager: this.elementManager
    })

    this.playbackController.on("timeupdate", () => {
      this.canvasDrawer.render()
    })

    this.elementManager.on("add", (element) => {
      if (element.type === "video-frames") {
        element.prepare(this.ffmpegManager)
      }
    })

    this.ffmpegManager.on("loaded", () => {
      this.listeners.emit("ready")
    })
  }

  on<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.on(eventName, handler)
  }

  off<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.off(eventName, handler)
  }

  public addElement(element: CanvasElement) {
    this.elementManager.addElement(element)
  }

  public start() {
    return this.ffmpegManager.load()
  }

  public render() {
    this.canvasDrawer.render()
  }

  public play() {
    this.playbackController.play()
  }

  public pause() {
    this.playbackController.pause()
  }

  public seek(time: number) {
    this.playbackController.seek(time)
  }
}
