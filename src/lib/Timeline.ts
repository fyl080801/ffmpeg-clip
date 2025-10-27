import { EventEmitter, type IEventEmitter } from "./EventEmitter"

interface Events {}

export class Timeline implements IEventEmitter<Events> {
  private listeners = new EventEmitter<Events>()

  on<K extends never>(eventName: K, handler: Events[K]): void {
    this.listeners.on(eventName, handler)
  }

  off<K extends never>(eventName: K, handler: Events[K]): void {
    this.listeners.off(eventName, handler)
  }
}
