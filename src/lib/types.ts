import type { IDrawable, IFFmpegElement } from "./elements"

export interface ElementRect {
  x: number
  y: number
  width: number
  height: number
}

// Common properties for all elements
interface BaseCanvasElement {
  id: string
  rect: ElementRect
  timeRange: [number, number] // [startTime, endTime] in milliseconds
  zIndex?: number
}

// Type-specific properties
export interface VideoFramesProps {
  source: HTMLImageElement[]
}

export interface ImageProps {
  source: HTMLImageElement
}

export interface TextProps {
  text: string
  font?: string
  color?: string
}

// Discriminated Union
export type CanvasElement = BaseCanvasElement &
  (
    | ({ type: "video-frames"; props: VideoFramesProps } & IFFmpegElement)
    | { type: "image"; props: ImageProps }
    | { type: "text"; props: TextProps }
  ) &
  IDrawable
