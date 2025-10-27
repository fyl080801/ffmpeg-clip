export class EventEmitter<T extends Record<string | symbol, any>> {
  private eventMap: Record<keyof T, Array<(...args: any[]) => void>> = {} as any

  on<K extends keyof T>(eventName: K, listener: T[K]) {
    if (!this.eventMap[eventName]) {
      this.eventMap[eventName] = []
    }
    this.eventMap[eventName].push(listener)
    return this
  }

  emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>) {
    const listeners = this.eventMap[eventName]
    if (!listeners || listeners.length === 0) return false
    listeners.forEach((listener) => {
      listener(...args)
    })
    return true
  }

  off<K extends keyof T>(eventName: K, listener: T[K]) {
    if (this.eventMap[eventName]) {
      this.eventMap[eventName] = this.eventMap[eventName].filter(
        (item) => item !== listener
      )
    }
    return this
  }
}

export interface IEventEmitter<TEvents> {
  on<K extends keyof TEvents>(eventName: K, handler: TEvents[K]): void
  off<K extends keyof TEvents>(eventName: K, handler: TEvents[K]): void
}

export default EventEmitter
