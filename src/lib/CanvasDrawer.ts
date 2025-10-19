import type { ElementManager } from "./ElementManager"
import type { PlaybackController } from "./PlaybackController"
import type { CanvasElement } from "./types"

export interface CanvasDrawerOptions {
  fps: number
  controller: PlaybackController
  elementManager: ElementManager
}

export class CanvasDrawer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private fps: number
  private controller: PlaybackController
  private elementManager: ElementManager

  constructor(canvas: HTMLCanvasElement, options: CanvasDrawerOptions) {
    this.canvas = canvas
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Could not get 2D context from canvas")
    }
    this.ctx = context
    this.fps = options.fps
    this.controller = options.controller
    this.elementManager = options.elementManager
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw elements
    for (const element of this.elementManager.getVisibleElements(
      this.controller.currentTime
    )) {
      this.drawElement(element)
    }
  }

  private drawElement(element: CanvasElement) {
    switch (element.type) {
      case "image":
        this.ctx.drawImage(
          element.props.source,
          element.rect.x,
          element.rect.y,
          element.rect.width,
          element.rect.height
        )
        break
      case "video-frames":
        {
          // Use block scope to prevent variable name clashes
          const source = element.props.source
          if (source.length === 0) break

          let frameIndexInElement
          if (this.controller.currentTime === element.timeRange[1]) {
            // If at the exact end time, render the last frame.
            frameIndexInElement = source.length - 1
          } else {
            const timeIntoElement =
              this.controller.currentTime - element.timeRange[0] // in ms
            frameIndexInElement = Math.floor(
              (timeIntoElement / 1000) * this.fps
            )
          }

          // Clamp the index to be safe
          frameIndexInElement = Math.max(
            0,
            Math.min(frameIndexInElement, source.length - 1)
          )

          const frameImage = source[frameIndexInElement]
          if (frameImage && frameImage.complete) {
            this.ctx.drawImage(
              frameImage,
              element.rect.x,
              element.rect.y,
              element.rect.width,
              element.rect.height
            )
          }
        }
        break
      case "text":
        this.ctx.font = element.props.font || "30px Arial"
        this.ctx.fillStyle = element.props.color || "black"
        this.ctx.fillText(element.props.text, element.rect.x, element.rect.y)
        break
    }
  }
}
