import type { ElementRect, ImageProps, VideoFramesProps, TextProps } from "./types"
import type { FFmpegManager } from "./FFmpegManager"

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

  abstract prepare(ffmpegManager: FFmpegManager): Promise<void>
}

export class ImageElement extends BaseElement {
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

  async prepare(ffmpegManager: FFmpegManager): Promise<void> {
    // No preparation needed for image elements
  }
}

export class VideoElement extends BaseElement {
  videoUrl: string
  props: { source: HTMLImageElement[] } = { source: [] }

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

  get type() {
    return "video-frames"
  }

  async prepare(ffmpegManager: FFmpegManager): Promise<void> {
    const frames = await ffmpegManager.extractFrames(this.videoUrl, 30)
    this.props.source = frames
  }
}

export class TextElement extends BaseElement {
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

  async prepare(ffmpegManager: FFmpegManager): Promise<void> {
    // No preparation needed for text elements
  }
}
