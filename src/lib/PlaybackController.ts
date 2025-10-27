import type { ElementManager } from "./ElementManager"
import EventEmitter, { type IEventEmitter } from "./EventEmitter"

interface Events {
  durationupdate(duration: number): void
  timeupdate(time: number): void
  play(): void
  pause(): void
  end(): void
  seek(time: number): void
}

export interface IPlay {
  play(): void
  pause(): void
  seek(time: number): void
}

export interface PlaybackControllerOption {
  elementManager: ElementManager
}

export class PlaybackController implements IPlay, IEventEmitter<Events> {
  private listeners = new EventEmitter<Events>()
  private totalDuration: number // in ms

  private _isPlaying = false
  private _currentTime = 0 // in ms

  private animationId: number | null = null
  private animationLoopStart = 0
  private timeWhenPaused = 0
  private elementManager: ElementManager

  private updateTotalDuration = () => {
    this.totalDuration = this.elementManager.getMaxTime()
    this.listeners.emit("durationupdate", this.totalDuration)
  }

  constructor(options: PlaybackControllerOption) {
    this.totalDuration = 0
    this.elementManager = options.elementManager
    this.elementManager.on("add", this.updateTotalDuration)
    this.elementManager.on("update", this.updateTotalDuration)
    this.elementManager.on("remove", this.updateTotalDuration)
  }

  on<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.on(eventName, handler)
  }
  off<K extends keyof Events>(eventName: K, handler: Events[K]): void {
    this.listeners.off(eventName, handler)
  }

  public update(options: { duration?: number }): void {
    if (options.duration !== undefined) {
      this.totalDuration = options.duration
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
    this.listeners.emit("play")
    this.animationLoopStart = performance.now() - this.timeWhenPaused
    this.runAnimationLoop()
  }

  public pause(): void {
    if (!this._isPlaying) return
    this._isPlaying = false
    this.listeners.emit("pause")
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
    this.listeners.emit("timeupdate", newTime)
    this.listeners.emit("seek", newTime)
  }

  private runAnimationLoop = (): void => {
    if (!this._isPlaying) return

    const elapsedTime = performance.now() - this.animationLoopStart

    if (elapsedTime >= this.totalDuration) {
      this._currentTime = this.totalDuration
      this.pause() // This will emit 'pause'
      this.listeners.emit("timeupdate", this._currentTime)
      this.listeners.emit("end")
    } else {
      this._currentTime = elapsedTime
      this.listeners.emit("timeupdate", this._currentTime)
      this.animationId = requestAnimationFrame(this.runAnimationLoop)
    }
  }
}
