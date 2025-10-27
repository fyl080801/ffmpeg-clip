import type { CanvasElement } from "./types"
import { type IDrawable } from "./elements"
import { FFmpegManager } from "./FFmpegManager"
import { EventEmitter, type IEventEmitter } from "./EventEmitter"

interface Events {
  add: (element: CanvasElement) => void
  remove: (elementId: string) => void
  update: (element: CanvasElement) => void
}
export interface ElementManagerOptions {
  ffmpegManager: FFmpegManager
}

export class ElementManager implements IEventEmitter<Events> {
  private elements: CanvasElement[] = []
  private listeners = new EventEmitter<Events>()

  constructor() {}

  on<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.on(eventName, handler)
  }

  off<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.off(eventName, handler)
  }

  async addElement(element: CanvasElement) {
    this.elements.push(element)
    this.elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    this.listeners.emit("add", element)
  }

  removeElement(elementId: string) {
    this.elements = this.elements.filter((el) => el.id !== elementId)
    this.listeners.emit("remove", elementId)
  }

  updateElement(elementId: string, newProps: Partial<CanvasElement>) {
    const element = this.elements.find((el) => el.id === elementId)
    if (element) {
      Object.assign(element, newProps)
      this.listeners.emit("update", element)
    }
  }

  getMaxTime(): number {
    if (this.elements.length === 0) {
      return 0
    }
    return Math.max(...this.elements.map((el) => el.timeRange[1]))
  }

  getVisibleElements(currentTime: number): IDrawable[] {
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
