import type {
  ElementRect,
  ImageProps,
  VideoFramesProps,
  TextProps
} from "./types"
import type { FFmpegManager } from "./FFmpegManager"
import { EventEmitter, type IEventEmitter } from "./EventEmitter"

export interface IFFmpegElement {
  prepare(ffmpegManager: FFmpegManager): Promise<void>
}

export interface IDrawable {
  draw(context: CanvasRenderingContext2D, currentTime: number): void
}

export abstract class BaseElement {
  id: string
  rect: ElementRect
  timeRange: [number, number]
  zIndex?: number

  constructor(props: {
    id: string
    rect: ElementRect
    timeRange: [number, number]
    zIndex?: number
  }) {
    this.id = props.id
    this.rect = props.rect
    this.timeRange = props.timeRange
    this.zIndex = props.zIndex
  }

  abstract get type(): string
  abstract get props(): ImageProps | VideoFramesProps | TextProps
}

export class ImageElement extends BaseElement implements IDrawable {
  props: { source: HTMLImageElement }

  constructor(props: {
    id: string
    rect: ElementRect
    timeRange: [number, number]
    zIndex?: number
    source: HTMLImageElement
  }) {
    super({
      id: props.id,
      rect: props.rect,
      timeRange: props.timeRange,
      zIndex: props.zIndex
    })
    this.props = { source: props.source }
  }

  get type() {
    return "image"
  }

  draw(context: CanvasRenderingContext2D): void {
    context.drawImage(
      this.props.source,
      this.rect.x,
      this.rect.y,
      this.rect.width,
      this.rect.height
    )
  }
}

interface VideoElementEvents {}

export class VideoElement
  extends BaseElement
  implements IFFmpegElement, IDrawable, IEventEmitter<VideoElementEvents>
{
  videoUrl: string
  props: { source: HTMLImageElement[] } = { source: [] }

  private listeners = new EventEmitter<VideoElementEvents>()
  private ffmpegManager?: FFmpegManager

  constructor(props: {
    id: string
    rect: ElementRect
    timeRange: [number, number]
    zIndex?: number
    videoUrl: string
  }) {
    super({
      id: props.id,
      rect: props.rect,
      timeRange: props.timeRange,
      zIndex: props.zIndex
    })
    this.videoUrl = props.videoUrl
  }

  on<K extends never>(eventName: K, handler: {}[K]): void {
    this.listeners.on(eventName, handler)
  }

  off<K extends never>(eventName: K, handler: {}[K]): void {
    this.listeners.off(eventName, handler)
  }

  get type() {
    return "video-frames"
  }

  async prepare(ffmpegManager: FFmpegManager): Promise<void> {
    if (!ffmpegManager) return

    this.ffmpegManager = ffmpegManager
    this.props.source = await this.ffmpegManager.extractFrames(this.videoUrl)
  }

  draw(context: CanvasRenderingContext2D, currentTime: number): void {
    if (!this.ffmpegManager) return

    // Use block scope to prevent variable name clashes
    const source = this.props.source
    if (source.length === 0) return
    let frameIndexInElement
    if (currentTime === this.timeRange[1]) {
      // If at the exact end time, render the last frame.
      frameIndexInElement = source.length - 1
    } else {
      const timeIntoElement = currentTime - this.timeRange[0] // in ms
      frameIndexInElement = Math.floor(
        (timeIntoElement / 1000) * this.ffmpegManager.fps
      )
    }
    // Clamp the index to be safe
    frameIndexInElement = Math.max(
      0,
      Math.min(frameIndexInElement, source.length - 1)
    )
    const frameImage = source[frameIndexInElement]
    if (frameImage && frameImage.complete) {
      context.drawImage(
        frameImage,
        this.rect.x,
        this.rect.y,
        this.rect.width,
        this.rect.height
      )
    }
  }
}

export class TextElement extends BaseElement implements IDrawable {
  props: { text: string; font?: string; color?: string }

  constructor(props: {
    id: string
    rect: ElementRect
    timeRange: [number, number]
    zIndex?: number
    text: string
    font?: string
    color?: string
  }) {
    super({
      id: props.id,
      rect: props.rect,
      timeRange: props.timeRange,
      zIndex: props.zIndex
    })
    this.props = {
      text: props.text,
      font: props.font,
      color: props.color
    }
  }

  get type() {
    return "text"
  }

  draw(context: CanvasRenderingContext2D): void {
    context.font = this.props.font || "30px Arial"
    context.fillStyle = this.props.color || "black"
    context.fillText(this.props.text, this.rect.x, this.rect.y)
  }
}
