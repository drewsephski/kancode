export class AggregateEventCollection {
    #events = [];
    add(event) {
        this.#events.push(event);
    }
    pull() {
        const events = this.#events;
        this.#events = [];
        return events;
    }
    get size() {
        return this.#events.length;
    }
    isEmpty() {
        return this.#events.length === 0;
    }
}
//# sourceMappingURL=aggregate-event-collection.js.map