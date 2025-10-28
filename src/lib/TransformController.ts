
import type { CanvasElement } from "./types"
import { ElementManager } from "./ElementManager"
import { EventEmitter, type IEventEmitter } from "./EventEmitter"

interface Events {
  transform: (element: CanvasElement) => void
}

export class TransformController implements IEventEmitter<Events> {
  private canvas: HTMLCanvasElement
  private elementManager: ElementManager
  private listeners = new EventEmitter<Events>()
  private selectedElement: CanvasElement | null = null
  private transformHandle: string | null = null
  private startX = 0
  private startY = 0
  private startRect: { x: number; y: number; width: number; height: number } | null = null

  constructor(canvas: HTMLCanvasElement, elementManager: ElementManager) {
    this.canvas = canvas
    this.elementManager = elementManager
    this.canvas.addEventListener("mousedown", this.handleMouseDown)
    this.canvas.addEventListener("mousemove", this.handleMouseMove)
    this.canvas.addEventListener("mouseup", this.handleMouseUp)
  }

  on<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.on(eventName, handler)
  }

  off<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.off(eventName, handler)
  }

  public getSelectedElement(): CanvasElement | null {
    return this.selectedElement
  }

  private handleMouseDown = (event: MouseEvent) => {
    const { x, y } = this.getCanvasCoordinates(event)
    const elements = this.elementManager.getElements()
    this.selectedElement =
      elements.find((element) => this.isPointInRect(x, y, element.rect)) || null

    if (this.selectedElement) {
      this.transformHandle = this.getTransformHandle(x, y, this.selectedElement.rect)
      this.startX = x
      this.startY = y
      this.startRect = { ...this.selectedElement.rect }
    }
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.selectedElement || !this.startRect) return
    const { x, y } = this.getCanvasCoordinates(event)
    const dx = x - this.startX
    const dy = y - this.startY

    if (this.transformHandle) {
      const newRect = { ...this.selectedElement.rect }
      switch (this.transformHandle) {
        case "topLeft":
          newRect.x = this.startRect.x + dx
          newRect.y = this.startRect.y + dy
          newRect.width = this.startRect.width - dx
          newRect.height = this.startRect.height - dy
          break
        case "topRight":
          newRect.y = this.startRect.y + dy
          newRect.width = this.startRect.width + dx
          newRect.height = this.startRect.height - dy
          break
        case "bottomLeft":
          newRect.x = this.startRect.x + dx
          newRect.width = this.startRect.width - dx
          newRect.height = this.startRect.height + dy
          break
        case "bottomRight":
          newRect.width = this.startRect.width + dx
          newRect.height = this.startRect.height + dy
          break
        default:
          // move
          newRect.x = this.startRect.x + dx
          newRect.y = this.startRect.y + dy
      }
      this.selectedElement.rect = newRect
    } else {
      // move
      const newRect = { ...this.selectedElement.rect }
      newRect.x = this.startRect.x + dx
      newRect.y = this.startRect.y + dy
      this.selectedElement.rect = newRect
    }
    this.listeners.emit("transform", this.selectedElement)
  }

  private handleMouseUp = () => {
    if (this.selectedElement) {
      this.elementManager.updateElement(this.selectedElement.id, {
        rect: this.selectedElement.rect
      })
    }
    this.transformHandle = null
    this.startRect = null
  }

  private getCanvasCoordinates(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  private isPointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ) {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
  }

  private getTransformHandle(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ): string | null {
    const handleSize = 10
    if (
      this.isPointInRect(x, y, {
        x: rect.x - handleSize / 2,
        y: rect.y - handleSize / 2,
        width: handleSize,
        height: handleSize
      })
    )
      return "topLeft"
    if (
      this.isPointInRect(x, y, {
        x: rect.x + rect.width - handleSize / 2,
        y: rect.y - handleSize / 2,
        width: handleSize,
        height: handleSize
      })
    )
      return "topRight"
    if (
      this.isPointInRect(x, y, {
        x: rect.x - handleSize / 2,
        y: rect.y + rect.height - handleSize / 2,
        width: handleSize,
        height: handleSize
      })
    )
      return "bottomLeft"
    if (
      this.isPointInRect(x, y, {
        x: rect.x + rect.width - handleSize / 2,
        y: rect.y + rect.height - handleSize / 2,
        width: handleSize,
        height: handleSize
      })
    )
      return "bottomRight"
    return null
  }

  public drawSelection(ctx: CanvasRenderingContext2D) {
    if (!this.selectedElement) return

    const rect = this.selectedElement.rect
    const handleSize = 10

    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)"
    ctx.lineWidth = 2
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

    ctx.fillStyle = "rgba(0, 0, 255, 0.5)"
    // Top-left
    ctx.fillRect(rect.x - handleSize / 2, rect.y - handleSize / 2, handleSize, handleSize)
    // Top-right
    ctx.fillRect(
      rect.x + rect.width - handleSize / 2,
      rect.y - handleSize / 2,
      handleSize,
      handleSize
    )
    // Bottom-left
    ctx.fillRect(
      rect.x - handleSize / 2,
      rect.y + rect.height - handleSize / 2,
      handleSize,
      handleSize
    )
    // Bottom-right
    ctx.fillRect(
      rect.x + rect.width - handleSize / 2,
      rect.y + rect.height - handleSize / 2,
      handleSize,
      handleSize
    )
  }
}
