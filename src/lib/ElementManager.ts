import type { CanvasElement } from "./types"
import { BaseElement } from "./elements"
import { FFmpegManager } from "./FFmpegManager"

type EventCallback = (...args: any[]) => void

export interface ElementManagerOptions {
  ffmpegManager: FFmpegManager
}

export class ElementManager {
  private elements: CanvasElement[] = []
  private listeners: Map<string, EventCallback[]> = new Map()
  private ffmpegManager: FFmpegManager

  constructor(options: ElementManagerOptions) {
    this.ffmpegManager = options.ffmpegManager

    // Proxy ffmpegManager events to elementManager events
    this.ffmpegManager.on("load:start", () => this.emit("load:start"))
    this.ffmpegManager.on("extract:start", () => this.emit("extract:start"))
    this.ffmpegManager.on("progress", (e) => this.emit("progress", e))
    this.ffmpegManager.on("extract:end", () => this.emit("extract:end"))
    this.ffmpegManager.on("imageload:start", () => this.emit("imageload:start"))
    this.ffmpegManager.on("imageload:end", () => this.emit("imageload:end"))
  }

  // --- Event Emitter ---
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

  async addElement(element: BaseElement) {
    await element.prepare(this.ffmpegManager)

    // Convert to CanvasElement
    const canvasElement: CanvasElement = {
      id: element.id,
      rect: element.rect,
      timeRange: element.timeRange,
      zIndex: element.zIndex,
      type: element.type as any,
      props: element.props as any
    }

    this.elements.push(canvasElement)
    this.elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    this.emit("element-add", canvasElement)
  }

  removeElement(elementId: string) {
    this.elements = this.elements.filter((el) => el.id !== elementId)
    this.emit("element-remove", elementId)
  }

  updateElement(elementId: string, newProps: Partial<CanvasElement>) {
    const element = this.elements.find((el) => el.id === elementId)
    if (element) {
      Object.assign(element, newProps)
      this.emit("element-update", element)
    }
  }

  getMaxTime(): number {
    if (this.elements.length === 0) {
      return 0
    }
    return Math.max(...this.elements.map((el) => el.timeRange[1]))
  }

  getVisibleElements(currentTime: number): CanvasElement[] {
    const visibleElements: CanvasElement[] = []
    for (const element of this.elements) {
      const [startTime, endTime] = element.timeRange
      let isVisible = currentTime >= startTime && currentTime < endTime

      // Special case: if the time is exactly the end time, we still want to render the last frame.
      if (currentTime === endTime && endTime > startTime) {
        isVisible = true
      }

      if (isVisible) {
        visibleElements.push(element)
      }
    }
    return visibleElements
  }
}
