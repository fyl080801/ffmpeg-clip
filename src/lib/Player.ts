import { CanvasDrawer } from "./CanvasDrawer"
import { ElementManager } from "./ElementManager"
import { EventEmitter, type IEventEmitter } from "./EventEmitter"
import { FFmpegManager, type ProgressEvent } from "./FFmpegManager"
import { PlaybackController, type IPlay } from "./PlaybackController"
import { TransformController } from "./TransformController"
import { VideoElement, TextElement, BaseElement } from "./elements"

interface Events {
  ready(): void
  play(): void
  pause(): void
  timeupdate(time: number): void
  loading(): void
  progress(event: ProgressEvent): void
  durationupdate(duration: number): void
  end(): void
}

export class Player implements IPlay, IEventEmitter<Events> {
  private ffmpegManager: FFmpegManager
  private canvasDrawer: CanvasDrawer
  private elementManager: ElementManager
  private playbackController: PlaybackController
  private transformController: TransformController
  private listeners = new EventEmitter<Events>()
  private elements: any[]

  constructor(element: HTMLCanvasElement, options: any) {
    this.elements = options.elements
    this.ffmpegManager = new FFmpegManager(options)
    this.elementManager = new ElementManager()
    this.playbackController = new PlaybackController({
      elementManager: this.elementManager
    })
    this.transformController = new TransformController(element, this.elementManager)
    this.canvasDrawer = new CanvasDrawer(element, {
      fps: options.fps,
      controller: this.playbackController,
      elementManager: this.elementManager,
      transformController: this.transformController
    })

    this.playbackController.on("timeupdate", (time) => {
      this.canvasDrawer.render()
      this.listeners.emit("timeupdate", time)
    })

    this.transformController.on("transform", () => {
      this.canvasDrawer.render()
    })

    this.playbackController.on("play", () => {
      this.listeners.emit("play")
    })

    this.playbackController.on("pause", () => {
      this.listeners.emit("pause")
    })

    this.playbackController.on("durationupdate", (duration) => {
      this.listeners.emit("durationupdate", duration)
    })

    this.playbackController.on("end", () => {
      this.listeners.emit("end")
    })

    this.elementManager.on("add", (element) => {
      if (element.type === "video-frames") {
        element.prepare(this.ffmpegManager)
      }
    })

    this.ffmpegManager.on("loading", () => {
      this.listeners.emit("loading")
    })

    this.ffmpegManager.on("loaded", () => {
      this.listeners.emit("ready")

      this._addElements(this.elements)
    })

    this.ffmpegManager.on("progress", (event) => {
      this.listeners.emit("progress", event)
    })
  }

  private _addElements(elements: any[]) {
    for (const elementData of elements) {
      let element: BaseElement | null = null
      switch (elementData.type) {
        case "video-frames":
          element = new VideoElement(elementData)
          break
        case "text":
          element = new TextElement(elementData)
          break
      }
      if (element) {
        this.elementManager.addElement(element as any)
      }
    }
  }

  public updateElements(elements: any[]) {
    this.elements = elements

    const newElementMap = new Map(elements.map((e) => [e.id, e]))
    const oldElementMap = new Map(
      this.elementManager.getElements().map((e) => [e.id, e])
    )

    // 1. Remove elements that are no longer in the new list
    for (const oldId of oldElementMap.keys()) {
      if (!newElementMap.has(oldId)) {
        this.elementManager.removeElement(oldId)
      }
    }

    // 2. Add or update elements
    for (const newElementData of elements) {
      if (oldElementMap.has(newElementData.id)) {
        // Update existing element
        this.elementManager.updateElement(newElementData.id, newElementData)
      } else {
        // Add new element
        this._addElements([newElementData])
      }
    }
  }

  on<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.on(eventName, handler)
  }

  off<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.off(eventName, handler)
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

  public togglePlay() {
    this.playbackController.togglePlay()
  }

  public seek(time: number) {
    this.playbackController.seek(time)
  }
}
