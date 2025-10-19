import type { ElementManager } from "./ElementManager"

type EventCallback = (...args: any[]) => void

export interface PlaybackControllerOption {
  elementManager: ElementManager
}

export class PlaybackController {
  private listeners: Map<string, EventCallback[]> = new Map()
  private totalDuration: number // in ms

  private _isPlaying = false
  private _currentTime = 0 // in ms

  private animationId: number | null = null
  private animationLoopStart = 0
  private timeWhenPaused = 0
  private elementManager: ElementManager

  private updateTotalDuration = () => {
    this.totalDuration = this.elementManager.getMaxTime()
    this.emit("durationupdate", this.totalDuration)
  }

  constructor(options: PlaybackControllerOption) {
    this.totalDuration = 0
    this.elementManager = options.elementManager
    this.elementManager.on("element-add", this.updateTotalDuration)
    this.elementManager.on("element-update", this.updateTotalDuration)
    this.elementManager.on("element-remove", this.updateTotalDuration)
  }

  public update(options: { duration?: number }): void {
    if (options.duration !== undefined) {
      this.totalDuration = options.duration
    }
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

  // --- Public Getters ---
  public get isPlaying(): boolean {
    return this._isPlaying
  }
  public get currentTime(): number {
    return this._currentTime
  }

  // --- Public Methods ---
  public play(): void {
    if (this._isPlaying) return
    if (this._currentTime >= this.totalDuration) {
      this._currentTime = 0
      this.timeWhenPaused = 0
    }
    this._isPlaying = true
    this.emit("play")
    this.animationLoopStart = performance.now() - this.timeWhenPaused
    this.runAnimationLoop()
  }

  public pause(): void {
    if (!this._isPlaying) return
    this._isPlaying = false
    this.emit("pause")
    this.timeWhenPaused = this._currentTime
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  public togglePlay(): void {
    if (this._isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  public seek(time: number): void {
    const newTime = Math.max(0, Math.min(time, this.totalDuration))
    this._currentTime = newTime
    this.timeWhenPaused = newTime // Update pause time for correct resume
    this.emit("timeupdate", newTime)
    this.emit("seek", newTime)
  }

  private runAnimationLoop = (): void => {
    if (!this._isPlaying) return

    const elapsedTime = performance.now() - this.animationLoopStart

    if (elapsedTime >= this.totalDuration) {
      this._currentTime = this.totalDuration
      this.pause() // This will emit 'pause'
      this.emit("timeupdate", this._currentTime)
      this.emit("ended")
    } else {
      this._currentTime = elapsedTime
      this.emit("timeupdate", this._currentTime)
      this.animationId = requestAnimationFrame(this.runAnimationLoop)
    }
  }
}
