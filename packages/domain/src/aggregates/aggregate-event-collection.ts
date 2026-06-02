import type { DomainEvent } from "../events/domain-event.js";

export class AggregateEventCollection {
  #events: DomainEvent[] = [];

  add(event: DomainEvent): void {
    this.#events.push(event);
  }

  pull(): DomainEvent[] {
    const events = this.#events;
    this.#events = [];
    return events;
  }

  get size(): number {
    return this.#events.length;
  }

  isEmpty(): boolean {
    return this.#events.length === 0;
  }
}
