import { AggregateEventCollection } from "./aggregate-event-collection.js";
import type { DomainEvent, DomainEventInput } from "../events/domain-event.js";

export abstract class AggregateRoot {
  #events = new AggregateEventCollection();

  constructor(
    public readonly id: string,
    protected _version = 0,
  ) {}

  get version(): number {
    return this._version;
  }

  protected recordEvent(event: DomainEventInput): void {
    const version = this._version + 1;
    this._version = version;
    this.#events.add({
      ...event,
      version,
    });
  }

  pullEvents(): DomainEvent[] {
    return this.#events.pull();
  }
}
