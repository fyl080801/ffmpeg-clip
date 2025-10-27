import type { ElementManager } from "./ElementManager"
import type { PlaybackController } from "./PlaybackController"

export interface CanvasDrawerOptions {
  fps: number
  controller: PlaybackController
  elementManager: ElementManager
}

export class CanvasDrawer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private controller: PlaybackController
  private elementManager: ElementManager

  constructor(canvas: HTMLCanvasElement, options: CanvasDrawerOptions) {
    this.canvas = canvas
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Could not get 2D context from canvas")
    }
    this.ctx = context
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
      element.draw(this.ctx, this.controller.currentTime)
    }
  }
}
